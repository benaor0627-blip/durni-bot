export interface Question {
  question: string;
  options: string[];
  answer: number;
}

export interface Capsule {
  id: number;
  title: string;
  type: 'video' | 'audio';
  url: string;
  questions: Question[];
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  capsules: Capsule[];
  deliverable: string;
}

export interface Course {
  id: number;
  title: string;
  phases: Phase[];
}

export const COURSES: Course[] = [
  {
    id: 1,
    title: 'Aceleración Rural - Programa Completo',
    phases: [
      {
        id: 1,
        title: 'Fase 1: Puente Conceptual',
        description: 'Sentando las bases de tu propósito productivo.',
        capsules: [
          {
            id: 1,
            title: 'Cápsula 1.1: El Sueño del Productor',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                question: '¿Qué es lo más importante al iniciar un proyecto rural?',
                options: ['Tener mucho dinero', 'Tener un propósito claro', 'Comprar maquinaria'],
                answer: 1
              }
            ]
          },
          { id: 2, title: 'Cápsula 1.2: Mentalidad Empresarial', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Un empresario rural se diferencia de un productor...', options: ['Vende más caro', 'Planifica y mide', 'Trabaja más'], answer: 1 }] },
          { id: 3, title: 'Cápsula 1.3: Análisis del Entorno', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué rodea tu unidad?', options: ['Solo vecinos', 'Riesgos y oportunidades', 'Solo tierra'], answer: 1 }] },
          { id: 4, title: 'Cápsula 1.4: Recursos Disponibles', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Recurso más valioso?', options: ['El tiempo', 'El tractor', 'La semilla'], answer: 0 }] },
          { id: 5, title: 'Cápsula 1.5: Sostenibilidad', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Sostenibilidad es...', options: ['Ganar dinero', 'Equilibrio ambiental/económico', 'Cuidar agua'], answer: 1 }] },
          { id: 6, title: 'Cápsula 1.6: El Plan Inicial', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'El plan sirve para...', options: ['Pedir crédito', 'Guiar el crecimiento', 'Decorar'], answer: 1 }] }
        ],
        deliverable: '📜 Entregable Fase 1: Envía una foto de tu mapa de propósito y recursos.'
      },
      {
        id: 2,
        title: 'Fase 2: Espejo de Experiencias',
        description: 'Aprendiendo de historias reales del campo.',
        capsules: [
          {
            id: 1,
            title: 'Cápsula 2.1: Historia de Éxito - Café',
            type: 'audio',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            questions: [{ question: '¿Qué salvó a la asociación?', options: ['Unión de socios', 'Donación', 'Precios bajos'], answer: 0 }]
          },
          { id: 2, title: 'Cápsula 2.2: Aprendiendo del Fracaso', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: 'Error principal:', options: ['No diversificar', 'No llevar cuentas', 'No transporte'], answer: 1 }] },
          { id: 3, title: 'Cápsula 2.3: La Fuerza del Colectivo', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Cómo bajaron costos?', options: ['Compra al por mayor', 'Menos sueldo', 'Vender menos'], answer: 0 }] },
          { id: 4, title: 'Cápsula 2.4: Innovación Tradicional', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Qué innovaron?', options: ['Empaque', 'Semilla', 'Riego'], answer: 0 }] },
          { id: 5, title: 'Cápsula 2.5: Resiliencia Campesina', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Qué es resiliencia?', options: ['Soportar todo', 'Adaptarse', 'Rendirse'], answer: 1 }] }
        ],
        deliverable: '🎙️ Entregable Fase 2: Envía un audio contando un aprendizaje.'
      },
      {
        id: 3,
        title: 'Fase 3: Herramienta de Poder',
        description: 'Técnicas avanzadas para la aceleración.',
        capsules: [
          {
            id: 1,
            title: 'Cápsula 3.1: Estructura de Costos',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [{ question: '¿Costo variable?', options: ['Arriendo', 'Insumos', 'Sueldo fijo'], answer: 1 }]
          },
          { id: 2, title: 'Cápsula 3.2: Precio de Venta', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Fijar precio:', options: ['Vecino', 'Costos + Margen', 'Azar'], answer: 1 }] },
          { id: 3, title: 'Cápsula 3.3: Canales de Venta', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Canal directo:', options: ['Vender en plaza', 'Intermediario', 'Vender a un tío'], answer: 0 }] },
          { id: 4, title: 'Cápsula 3.4: Marketing Rural', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Vende más:', options: ['Precio bajo', 'Historia del producto', 'Cantidad'], answer: 1 }] },
          { id: 5, title: 'Cápsula 3.5: Registro de Datos', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Por qué anotar?', options: ['No olvidar', 'Tomar decisiones', 'Para el bot'], answer: 1 }] },
          { id: 6, title: 'Cápsula 3.6: Flujo de Caja', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué mide?', options: ['Utilidad', 'Disponibilidad', 'Deudas'], answer: 1 }] },
          { id: 7, title: 'Cápsula 3.7: Inversión vs Gasto', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Inversión:', options: ['Comprar abono', 'Televisor', 'Luz'], answer: 0 }] },
          { id: 8, title: 'Cápsula 3.8: Equipo de Trabajo', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Buen equipo:', options: ['Confianza', 'Sueldo bajo', 'Distancia'], answer: 0 }] },
          { id: 9, title: 'Cápsula 3.9: Tu Plan Final', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: 'Último paso:', options: ['Descansar', 'Ejecutar y medir', 'Empezar de nuevo'], answer: 1 }] }
        ],
        deliverable: '📈 Entregable Fase 3: Envía una foto de tu plan de aceleración completo.'
      }
    ]
  },
  {
    id: 2,
    title: 'Finanzas del Campo',
    phases: [
      {
        id: 1,
        title: 'Fase 1: Salud Financiera',
        description: 'Aprende a controlar los números de tu proyecto rural.',
        capsules: [
          {
            id: 1,
            title: 'Cápsula 1.1: Ingresos vs Egresos',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                question: '¿Qué es un egreso?',
                options: ['Dinero que entra', 'Dinero que sale', 'Dinero ahorrado'],
                answer: 1
              }
            ]
          },
          {
            id: 2,
            title: 'Cápsula 1.2: Presupuesto Básico',
            type: 'audio',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            questions: [
              {
                question: 'El presupuesto te ayuda a...',
                options: ['Gastar más', 'Planificar el futuro', 'Endeudarte'],
                answer: 1
              }
            ]
          }
        ],
        deliverable: '📊 Entregable Fase 1: Envía una foto de tus ingresos y egresos del último mes.'
      }
    ]
  }
];
