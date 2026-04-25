import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';
import { COURSES, Phase, Capsule } from './courses';
import { FlowController } from './flowController';

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Helper para enviar mensajes de WhatsApp
const sendWhatsAppMessage = async (to: string, messageData: any) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        ...messageData
      },
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
  } catch (error: any) {
    console.error('Error enviando mensaje:', error.response?.data || error.message);
  }
};

// Helper para enviar microtests
const sendMicrotest = async (to: string, capsule: Capsule, questionIndex: number) => {
  const question = capsule.questions[questionIndex];
  if (!question) return;

  await sendWhatsAppMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: `Microtest: ${capsule.title}` },
      body: { text: question.question },
      action: {
        buttons: question.options.map((opt, idx) => ({
          type: 'reply',
          reply: { id: `answer_${capsule.id}_${questionIndex}_${idx}`, title: opt.substring(0, 20) }
        }))
      }
    }
  });
};

// 1. Verificación del Webhook (Meta)
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Recepción de Mensajes del Webhook
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry[0];
    const changes = entry.changes[0];
    const value = changes.value;

    if (value.messages) {
      const message = value.messages[0];
      const from = message.from;

      const userRes = await pool.query('SELECT * FROM estudiantes WHERE celular = $1', [from]);
      if (userRes.rows.length === 0) {
        console.log(`Usuario no registrado: ${from}`);
        await sendWhatsAppMessage(from, {
          type: 'text',
          text: { body: 'Hola. No estás registrado en Durni. Contacta a durnico.col@gmail.com para acceso.' }
        });
        return res.sendStatus(200);
      }

      const estudiante = userRes.rows[0];

      // CASO 1: Mensaje de Texto (Hola / Reset)
      if (message.type === 'text') {
        console.log(`Enviando Menú de Bienvenida a ${from}`);
        try {
          await sendWhatsAppMessage(from, {
            type: 'interactive',
            interactive: {
              type: 'list',
              header: { type: 'text', text: 'Bienvenido a Durni' },
              body: { text: `¡Hola ${estudiante.nombre}! Soy Durni. ¿Qué curso quieres iniciar hoy?` },
              footer: { text: 'Programa de Aceleración Rural' },
              action: {
                button: 'Ver Cursos',
                sections: [
                  {
                    title: 'Cursos Disponibles',
                    rows: [
                      { id: 'course_1', title: 'Aceleración Rural', description: 'Inicia tu camino' },
                      { id: 'course_2', title: 'Finanzas del Campo', description: 'Maneja tu dinero' }
                    ]
                  }
                ]
              }
            }
          });
          console.log(`✅ Menú enviado exitosamente a ${from}`);
        } catch (err: any) {
          console.error('❌ Error detallado de Meta:', JSON.stringify(err.response?.data || err.message, null, 2));
        }
        return res.sendStatus(200);
      }

      // CASO 2: Respuesta de Lista (Selección de curso)
      if (message.type === 'interactive' && message.interactive.type === 'list_reply') {
        const selectionId = message.interactive.list_reply.id;
        
        if (selectionId.startsWith('course_')) {
          const courseId = selectionId.replace('course_', '');
          
          console.log(`Curso seleccionado: ${courseId} por ${from}`);

          await pool.query(
            'INSERT INTO progreso_estudiantes (estudiante_id, curso_id, fase_actual, capsula_actual) VALUES ($1, $2, 1, 1) ON CONFLICT (estudiante_id) DO UPDATE SET curso_id = $2, fase_actual = 1, capsula_actual = 1',
            [estudiante.id, courseId]
          );

          const course = FlowController.getCourseById(Number(courseId));
          if (course) {
            await sendWhatsAppMessage(from, { 
              type: 'text', 
              text: { body: `🚀 ¡Excelente! Iniciamos: ${course.title}.` } 
            });
            
            const firstCapsule = course.phases[0].capsules[0];
            const mediaType = firstCapsule.type === 'video' ? 'video' : 'audio';
            
            await sendWhatsAppMessage(from, {
              [mediaType]: { link: firstCapsule.url, caption: firstCapsule.title }
            });
            
            setTimeout(() => sendMicrotest(from, firstCapsule, 0), 3000);
          }
        }
        return res.sendStatus(200);
      }

      // CASO 3: Botones de Microtest (BUTTON_REPLY)
      if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
        const replyId = message.interactive.button_reply.id;
        
        if (replyId.startsWith('answer_')) {
          const [, capsuleId, qIdx, optIdx] = replyId.split('_');
          const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1', [estudiante.id]);
          const progreso = progRes.rows[0];
          
          const course = FlowController.getCourseById(progreso.curso_id);
          const phase = course?.phases.find((p: Phase) => p.id === progreso.fase_actual);
          const capsule = phase?.capsules.find((c: Capsule) => c.id === Number(capsuleId));

          if (capsule) {
            const isCorrect = Number(optIdx) === capsule.questions[Number(qIdx)].answer;
            
            if (isCorrect) {
              await sendWhatsAppMessage(from, { type: 'text', text: { body: '¡Correcto! 🌟' } });
              
              if (Number(qIdx) === capsule.questions.length - 1) {
                const nextCapsuleId = Number(capsuleId) + 1;
                const nextStep = FlowController.getNextStep(progreso.curso_id, progreso.fase_actual, nextCapsuleId);
                
                if (nextStep?.type === 'CAPSULE' && nextStep.capsule) {
                  await pool.query('UPDATE progreso_estudiantes SET capsula_actual = $1 WHERE id = $2', [nextCapsuleId, progreso.id]);
                  await sendWhatsAppMessage(from, { type: 'text', text: { body: `Siguiente lección:` } });
                  
                  const mediaType = nextStep.capsule.type === 'video' ? 'video' : 'audio';
                  await sendWhatsAppMessage(from, {
                    [mediaType]: { link: nextStep.capsule.url, caption: nextStep.capsule.title }
                  });
                  setTimeout(() => sendMicrotest(from, nextStep.capsule!, 0), 3000);
                } else if (nextStep?.type === 'PHASE_COMPLETE' && nextStep.phase) {
                  await sendWhatsAppMessage(from, { type: 'text', text: { body: `🎉 ¡Felicidades! Has terminado la fase: ${nextStep.phase.title}.\n\n${nextStep.phase.deliverable}` } });
                }
              } else {
                await sendMicrotest(from, capsule, Number(qIdx) + 1);
              }
            } else {
              await sendWhatsAppMessage(from, { type: 'text', text: { body: 'No es correcto. ¡Inténtalo de nuevo! 💪' } });
              setTimeout(() => sendMicrotest(from, capsule, Number(qIdx)), 2000);
            }
          }
        }
        return res.sendStatus(200);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Durni corriendo en puerto ${PORT}`);
});
