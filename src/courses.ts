export const COURSES = [
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
            url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Simulado
            questions: [
              {
                question: '¿Qué es lo más importante al iniciar un proyecto rural?',
                options: ['Tener mucho dinero', 'Tener un propósito claro', 'Comprar maquinaria'],
                answer: 1
              }
            ]
          },
          {
            id: 2,
            title: 'Cápsula 1.2: Mentalidad Empresarial',
            type: 'video',
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                question: 'Un empresario rural se diferencia de un productor tradicional porque...',
                options: ['Vende más caro', 'Planifica y mide resultados', 'Trabaja más horas'],
                answer: 1
              }
            ]
          },
          // Añadiremos las otras 4 cápsulas programáticamente para no saturar el archivo
          { id: 3, title: 'Cápsula 1.3: Análisis del Entorno', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué rodea tu unidad productiva?', options: ['Solo vecinos', 'Oportunidades y riesgos', 'Solo tierra'], answer: 1 }] },
          { id: 4, title: 'Cápsula 1.4: Recursos Disponibles', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Cuál es tu recurso más valioso?', options: ['El tiempo', 'El tractor', 'La semilla'], answer: 0 }] },
          { id: 5, title: 'Cápsula 1.5: Sostenibilidad', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué busca la sostenibilidad?', options: ['Ganar dinero rápido', 'Equilibrio económico y ambiental', 'Solo cuidar el agua'], answer: 1 }] },
          { id: 6, title: 'Cápsula 1.6: El Plan Inicial', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Para qué sirve el plan inicial?', options: ['Para pedir crédito', 'Para guiar el crecimiento', 'Para decorar la oficina'], answer: 1 }] }
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
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Simulado
            questions: [
              {
                question: '¿Qué salvó a la asociación de café en la historia?',
                options: ['La unión de los socios', 'Una donación extranjera', 'Bajar los precios'],
                answer: 0
              }
            ]
          },
          { id: 2, title: 'Cápsula 2.2: Aprendiendo del Fracaso', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: 'El error principal fue...', options: ['No diversificar', 'No llevar cuentas', 'No tener transporte'], answer: 1 }] },
          { id: 3, title: 'Cápsula 2.3: La Fuerza del Colectivo', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Cómo bajaron costos?', options: ['Comprando al por mayor', 'Pagando menos sueldo', 'Vendiendo menos'], answer: 0 }] },
          { id: 4, title: 'Cápsula 2.4: Innovación Tradicional', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Qué innovaron?', options: ['El empaque', 'La semilla', 'El riego'], answer: 0 }] },
          { id: 5, title: 'Cápsula 2.5: Resiliencia Campesina', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', questions: [{ question: '¿Qué es resiliencia?', options: ['Soportar todo', 'Adaptarse y superar', 'Rendirse rápido'], answer: 1 }] }
        ],
        deliverable: '🎙️ Entregable Fase 2: Envía un audio contando un aprendizaje de tu experiencia.'
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
            questions: [
              {
                question: '¿Cuál es un costo variable?',
                options: ['El arriendo', 'Los insumos/semillas', 'El sueldo fijo'],
                answer: 1
              }
            ]
          },
          // ... Simplificado para la simulación: 9 cápsulas técnicas
          { id: 2, title: 'Cápsula 3.2: Precio de Venta', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Cómo fijar el precio?', options: ['Como el vecino', 'Costos + Margen', 'Al azar'], answer: 1 }] },
          { id: 3, title: 'Cápsula 3.3: Canales de Venta', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué es un canal directo?', options: ['Vender en plaza', 'Vender a intermediario', 'Vender a un tío'], answer: 0 }] },
          { id: 4, title: 'Cápsula 3.4: Marketing Rural', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué vende más?', options: ['El precio bajo', 'La historia del producto', 'La cantidad'], answer: 1 }] },
          { id: 5, title: 'Cápsula 3.5: Registro de Datos', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Por qué anotar todo?', options: ['Para no olvidar', 'Para tomar decisiones', 'Para que el bot no se enoje'], answer: 1 }] },
          { id: 6, title: 'Cápsula 3.6: Flujo de Caja', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué mide el flujo de caja?', options: ['La utilidad', 'El dinero disponible', 'Las deudas'], answer: 1 }] },
          { id: 7, title: 'Cápsula 3.7: Inversión vs Gasto', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué es inversión?', options: ['Comprar abono', 'Comprar un televisor', 'Pagar luz'], answer: 0 }] },
          { id: 8, title: 'Cápsula 3.8: Equipo de Trabajo', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Qué hace un buen equipo?', options: ['La confianza', 'El sueldo bajo', 'La distancia'], answer: 0 }] },
          { id: 9, title: 'Cápsula 3.9: Tu Plan de Aceleración', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', questions: [{ question: '¿Cuál es el último paso?', options: ['Descansar', 'Ejecutar y medir', 'Volver a empezar'], answer: 1 }] }
        ],
        deliverable: '📈 Entregable Fase 3: Envía una foto de tu plan de aceleración completo.'
      }
    ]
  },
  {
    id: 2,
    title: 'Finanzas para el Campo',
    phases: [
       // Estructura similar simplificada para la prueba
       { id: 1, title: 'Fase 1: Ahorro', capsules: [], deliverable: '' }
    ]
  }
];
