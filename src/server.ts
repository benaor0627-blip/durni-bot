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
        const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1 ORDER BY ultima_actualizacion DESC LIMIT 1', [estudiante.id]);
        
        if (progRes.rows.length > 0) {
          const ultimoProgreso = progRes.rows[0];
          const course = FlowController.getCourseById(ultimoProgreso.curso_id);
          
          await sendWhatsAppMessage(from, {
            type: 'interactive',
            interactive: {
              type: 'button',
              header: {
                type: 'image',
                image: {
                  link: 'https://files.catbox.moe/mgztcr.png'
                }
              },
              body: { text: `¡Hola ${estudiante.nombre}! Veo que estabas tomando el curso *${course?.title}*.\n\n¿Quieres retomar donde lo dejaste o prefieres explorar otros cursos?` },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: `resume_YES_${ultimoProgreso.curso_id}`, title: 'Retomar Curso' } },
                  { type: 'reply', reply: { id: 'resume_NO', title: 'Explorar Otros' } }
                ]
              }
            }
          });
        } else {
          await sendWhatsAppMessage(from, {
            type: 'interactive',
            interactive: {
              type: 'button',
              header: {
                type: 'image',
                image: {
                  link: 'https://files.catbox.moe/mgztcr.png'
                }
              },
              body: { text: `¡Hola ${estudiante.nombre}! Soy Durni. ¿Qué curso quieres iniciar hoy?` },
              footer: { text: 'Programa de Aceleración Rural' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'course_1', title: 'Aceleración Rural' } },
                  { type: 'reply', reply: { id: 'course_2', title: 'Finanzas del Campo' } }
                ]
              }
            }
          });
        }
        return res.sendStatus(200);
      }

      // CASO 2: Respuesta de Lista (Removido, ahora usamos botones)
      if (message.type === 'interactive' && message.interactive.type === 'list_reply') {
        // Fallback por si llega una respuesta vieja
        return res.sendStatus(200);
      }

      // CASO 3: Botones (Microtest, Selección o Reanudación)
      if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
        const replyId = message.interactive.button_reply.id;
        
        // --- REANUDACIÓN DE CURSO ---
        if (replyId.startsWith('resume_')) {
          if (replyId === 'resume_NO') {
            await sendWhatsAppMessage(from, {
              type: 'interactive',
              interactive: {
                type: 'button',
                body: { text: `¿Qué nuevo curso quieres explorar?` },
                action: {
                  buttons: [
                    { type: 'reply', reply: { id: 'course_1', title: 'Aceleración Rural' } },
                    { type: 'reply', reply: { id: 'course_2', title: 'Finanzas del Campo' } }
                  ]
                }
              }
            });
          } else {
            const courseId = replyId.split('_')[2];
            const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1 AND curso_id = $2', [estudiante.id, courseId]);
            const progreso = progRes.rows[0];
            const course = FlowController.getCourseById(Number(courseId));
            
            if (course && progreso) {
              const phase = course.phases.find(p => p.id === progreso.fase_actual);
              const capsule = phase?.capsules.find(c => c.id === progreso.capsula_actual);
              
              if (capsule) {
                await pool.query('UPDATE progreso_estudiantes SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE id = $1', [progreso.id]);
                await sendWhatsAppMessage(from, { type: 'text', text: { body: `🚀 ¡Retomando: ${course.title}!` } });
                const mediaType = capsule.type === 'video' ? 'video' : 'audio';
                await sendWhatsAppMessage(from, { [mediaType]: { link: capsule.url, caption: capsule.title } });
                setTimeout(() => sendMicrotest(from, capsule, 0), 3000);
              }
            }
          }
        }
        
        // --- SELECCIÓN DE CURSO ---
        else if (replyId.startsWith('course_')) {
          const courseId = replyId.replace('course_', '');
          console.log(`Curso seleccionado: ${courseId} por ${from}`);

          // Intentar insertar nuevo progreso. Si ya existe, no hace nada.
          await pool.query(
            'INSERT INTO progreso_estudiantes (estudiante_id, curso_id, fase_actual, capsula_actual) VALUES ($1, $2, 1, 1) ON CONFLICT (estudiante_id, curso_id) DO NOTHING',
            [estudiante.id, courseId]
          );
          
          // Actualizar ultima_actualizacion
          await pool.query('UPDATE progreso_estudiantes SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE estudiante_id = $1 AND curso_id = $2', [estudiante.id, courseId]);

          // Obtener el progreso (puede ser nuevo o ya existente)
          const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1 AND curso_id = $2', [estudiante.id, courseId]);
          const progreso = progRes.rows[0];

          const course = FlowController.getCourseById(Number(courseId));
          if (course && progreso) {
            const phase = course.phases.find(p => p.id === progreso.fase_actual);
            const capsule = phase?.capsules.find(c => c.id === progreso.capsula_actual);

            if (capsule) {
              await sendWhatsAppMessage(from, { 
                type: 'text', 
                text: { body: `🚀 ¡Iniciando/Retomando: ${course.title}!` } 
              });
              
              const mediaType = capsule.type === 'video' ? 'video' : 'audio';
              await sendWhatsAppMessage(from, { [mediaType]: { link: capsule.url, caption: capsule.title } });
              setTimeout(() => sendMicrotest(from, capsule, 0), 3000);
            }
          }
        } 
        
        // --- MICROTESTS ---
        else if (replyId.startsWith('answer_')) {
          const [, capsuleIdStr, qIdxStr, optIdxStr] = replyId.split('_');
          const capsuleId = Number(capsuleIdStr);
          const qIdx = Number(qIdxStr);
          const optIdx = Number(optIdxStr);

          const progRes = await pool.query('SELECT * FROM progreso_estudiantes WHERE estudiante_id = $1 ORDER BY ultima_actualizacion DESC LIMIT 1', [estudiante.id]);
          const progreso = progRes.rows[0];
          
          const course = FlowController.getCourseById(progreso.curso_id);
          const phase = course?.phases.find((p: Phase) => p.id === progreso.fase_actual);
          const capsule = phase?.capsules.find((c: Capsule) => c.id === capsuleId);

          if (capsule) {
            const isCorrect = optIdx === capsule.questions[qIdx].answer;
            
            // Guardar intento en BD
            await pool.query(`
              INSERT INTO resultados_microtest (estudiante_id, curso_id, fase_id, capsula_id, pregunta_idx, intentos, es_correcto)
              VALUES ($1, $2, $3, $4, $5, 1, $6)
              ON CONFLICT (estudiante_id, curso_id, fase_id, capsula_id, pregunta_idx)
              DO UPDATE SET intentos = resultados_microtest.intentos + 1, es_correcto = $6, fecha = CURRENT_TIMESTAMP
            `, [estudiante.id, progreso.curso_id, progreso.fase_actual, capsuleId, qIdx, isCorrect]);

            if (isCorrect) {
              await sendWhatsAppMessage(from, { type: 'text', text: { body: '¡Correcto! 🌟' } });
              
              if (qIdx === capsule.questions.length - 1) {
                const nextCapsuleId = capsuleId + 1;
                const nextStep = FlowController.getNextStep(progreso.curso_id, progreso.fase_actual, nextCapsuleId);
                
                if (nextStep?.type === 'CAPSULE' && nextStep.capsule) {
                  await pool.query('UPDATE progreso_estudiantes SET capsula_actual = $1, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id = $2', [nextCapsuleId, progreso.id]);
                  await sendWhatsAppMessage(from, { type: 'text', text: { body: `Siguiente lección:` } });
                  
                  const mediaType = nextStep.capsule.type === 'video' ? 'video' : 'audio';
                  await sendWhatsAppMessage(from, { [mediaType]: { link: nextStep.capsule.url, caption: nextStep.capsule.title } });
                  setTimeout(() => sendMicrotest(from, nextStep.capsule!, 0), 3000);
                } else if (nextStep?.type === 'PHASE_COMPLETE' && nextStep.phase) {
                  await pool.query('UPDATE progreso_estudiantes SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE id = $1', [progreso.id]);
                  await sendWhatsAppMessage(from, { type: 'text', text: { body: `🎉 ¡Felicidades! Has terminado la fase: ${nextStep.phase.title}.\n\n${nextStep.phase.deliverable}` } });
                }
              } else {
                await sendMicrotest(from, capsule, qIdx + 1);
              }
            } else {
              const resRes = await pool.query('SELECT intentos FROM resultados_microtest WHERE estudiante_id = $1 AND curso_id = $2 AND capsula_id = $3 AND pregunta_idx = $4', [estudiante.id, progreso.curso_id, capsuleId, qIdx]);
              const intentos = resRes.rows[0].intentos;
              await sendWhatsAppMessage(from, { type: 'text', text: { body: `No es correcto (Intento #${intentos}). ¡Tú puedes, inténtalo de nuevo! 💪` } });
              setTimeout(() => sendMicrotest(from, capsule, qIdx), 2000);
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
