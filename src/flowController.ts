import { COURSES, Course, Phase, Capsule } from './courses';

export class FlowController {
  static getNextStep(courseId: string, faseActual: number, capsulaActual: number) {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return null;

    const phase = course.phases.find(p => p.id === faseActual);
    if (!phase) return null;

    const capsule = phase.capsules.find(c => c.id === capsulaActual);
    if (!capsule) {
      // Si no hay más cápsulas en esta fase, pasar al entregable práctico o siguiente fase
      return { type: 'PHASE_COMPLETE', phase };
    }

    return { type: 'CAPSULE', capsule };
  }

  static getCourse(id: string) {
    return COURSES.find(c => c.id === id);
  }
}
