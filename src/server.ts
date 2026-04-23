import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import axios from 'axios';
import { COURSES } from './courses';
import { FlowController } from './flowController';

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
      }
    );
  } catch (error) {
    console.error('Error enviando mensaje de WhatsApp:', error);
  }
};
// Helper para enviar microtests (Reply Buttons)
const sendMicrotest = async (to: string, capsule: any, questionIndex: number) => {
  const q = capsule.questions[questionIndex];
  await sendWhatsAppMessage(to, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: q.question },
      action: {
        buttons: q.options.map((opt: string, idx: number) => ({
          type: 'reply',
          reply: { id: `answer_${capsule.id}_${questionIndex}_${idx}`, title: opt }
        }))
      }
    }
  });
};

// 1. Verificación del Webhook de Meta
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 2. Data Exchange para WhatsApp Flows (Onboarding)
app.post('/flow-data-exchange', async (req: Request, res: Response) => {
  const { phone_number } = req.body; // WhatsApp envía esto automáticamente

  try {
    const result = await pool.query('SELECT * FROM estudiantes WHERE celular = $1', [phone_number]);

    if (result.rows.length > 0) {
      const estudiante = result.rows[0];
      res.json({
        authorized: true,
        nombre: estudiante.nombre,
        message: `¡Hola ${estudiante.nombre}! Bienvenido a Durni.`
      });
    } else {
      res.json({
        authorized: false,
        message: 'No tienes acceso a Durni. Comunícate a durnico.col@gmail.com'
      });
    }
  } catch (error) {
    console.error('Error en Data Exchange:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 3. Recepción de Mensajes del Webhook
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry[0];
    const changes = entry.changes[0];
    const value = changes.value;

    if (value.messages) {
      const message = value.messages[0];
      const from = message.from;

      // 1. Verificar autorización
      const userRes = await pool.query('SELECT * FROM estudiantes WHERE celular = $1', [from]);
      if (userRes.rows.length === 0) {
        await sendWhatsAppMessage(from, {
          type: 'text',
          text: { body: 'No tienes acceso a Durni. Comunícate a durnico.col@gmail.com' }
        });
        return res.sendStatus(200);
      }

      const estudiante = userRes.rows[0];

      // 2. Manejar respuestas interactivas (Selección de curso / Microtests)
      if (message.type === 'interactive') {
        const interactive = message.interactive;
        
        if (interactive.type === 'list_reply') {
          const selectionId = interactive.list_reply.id;
          if (selectionId.startsWith('course_')) {
            const courseId = selectionId.replace('course_', '');
            
            // Inicializar o actualizar progreso
            await pool.query(
              'INSERT INTO progreso_estudiantes (estudiante_id, curso_id, fase_actual, capsula_actual) VALUES ($1, $2, 1, 1) ON CONFLICT (estudiante_id) DO UPDATE SET curso_id = $2, fase_actual = 1, capsula_actual = 1',
              [estudiante.id, courseId]
            );

            const course = COURSES.find(c => c.id === courseId);
            if (course) {
              await sendWhatsAppMessage(from, { 
                type: 'text', 
                text: { body: `¡Excelente elección! Iniciamos con el curso: ${course.title}.` } 
              });
              
              const firstCapsule = course.phases[0].capsules[0];
              const mediaType = firstCapsule.type === 'video' ? 'video' : 'audio';
              await sendWhatsAppMessage(from, {
                [mediaType]: { link: firstCapsule.url, caption: firstCapsule.title }
              });
              
              // Enviar el primer microtest
              await sendMicrotest(from, firstCapsule, 0);
            }
          }
        } else if (interactive.type === 'button_reply') {
          const replyId = interactive.button_reply.id;
          if (replyId.startsWith('answer_')) {
            const [, capsuleId, qIdx, optIdx] = replyId.split('_');
            const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1', [estudiante.id]);
            const progreso = progRes.rows[0];
            const course = FlowController.getCourse(progreso.curso_id);
            const capsule = course?.phases.find(p => p.id === progreso.fase_actual)?.capsules.find(c => c.id === Number(capsuleId));

            if (capsule) {
              const isCorrect = Number(optIdx) === capsule.questions[Number(qIdx)].answer;
              if (isCorrect) {
                await sendWhatsAppMessage(from, { type: 'text', text: { body: '¡Correcto! 🌟' } });
                
                // Si es la última pregunta, avanzar a la siguiente cápsula
                if (Number(qIdx) === capsule.questions.length - 1) {
                  const nextCapsuleId = progreso.capsula_actual + 1;
                  const nextStep = FlowController.getNextStep(progreso.curso_id, progreso.fase_actual, nextCapsuleId);
                  
                  if (nextStep?.type === 'CAPSULE') {
                    await pool.query(
                      'UPDATE progreso_estudiantes SET capsula_actual = $1 WHERE id = $2',
                      [nextCapsuleId, progreso.id]
                    );
                    await sendWhatsAppMessage(from, { type: 'text', text: { body: `Sigamos con la Cápsula ${nextCapsuleId}.` } });
                    if (nextStep.capsule) {
                      const mediaType = nextStep.capsule.type === 'video' ? 'video' : 'audio';
                      await sendWhatsAppMessage(from, {
                        [mediaType]: { link: nextStep.capsule.url, caption: nextStep.capsule.title }
                      });
                      // Enviar primera pregunta del test de la nueva cápsula
                      await sendMicrotest(from, nextStep.capsule, 0);
                    }
                  } else {
                    await sendWhatsAppMessage(from, { type: 'text', text: { body: 'Has terminado esta fase. ¡Felicidades! Sigue con el entregable práctico.' } });
                  }
                } else {
                  // Siguiente pregunta del test
                  await sendMicrotest(from, capsule, Number(qIdx) + 1);
                }
              } else {
                await sendWhatsAppMessage(from, { type: 'text', text: { body: 'Casi lo tienes. Intenta de nuevo. 💪' } });
                await sendMicrotest(from, capsule, Number(qIdx));
              }
            }
          }
        }
        return res.sendStatus(200);
      }

      // 3. Flujo normal de mensajes
      const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1', [estudiante.id]);
      
      if (progRes.rows.length === 0) {
        // Enviar menú de cursos si no hay progreso
        await sendWhatsAppMessage(from, {
          type: 'interactive',
          interactive: {
            type: 'list',
            header: { type: 'text', text: 'Bienvenido a Durni' },
            body: { text: 'Selecciona el curso que deseas iniciar:' },
            action: {
              button: 'Ver cursos',
              sections: [{
                title: 'Cursos Disponibles',
                rows: COURSES.map(c => ({ id: `course_${c.id}`, title: c.title }))
              }]
            }
          }
        });
      } else {
        const progreso = progRes.rows[0];
        await sendWhatsAppMessage(from, {
          type: 'text',
          text: { body: `Vas muy bien en la fase ${progreso.fase_actual}. Responde al test anterior para continuar.` }
        });
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Durni corriendo en puerto ${PORT}`);
});
