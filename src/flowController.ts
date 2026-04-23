import { COURSES, Course, Phase, Capsule } from './courses';

export class FlowController {
  static getNextStep(courseId: number, phaseId: number, capsuleId: number) {
    const course = COURSES.find(c => Number(c.id) === Number(courseId));
    if (!course) return null;

    const phase = course.phases.find(p => Number(p.id) === Number(phaseId));
    if (!phase) return null;

    const capsule = phase.capsules.find(cap => Number(cap.id) === Number(capsuleId));
    
    if (capsule) {
      return { type: 'CAPSULE', capsule };
    } else {
      return { type: 'PHASE_COMPLETE', phase };
    }
  }

  static getCourseById(id: number | string): Course | undefined {
    return COURSES.find(c => Number(c.id) === Number(id));
  }
}
