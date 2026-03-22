// Service tests have been split into individual spec files:
// - cohorts.service.spec.ts
// - class-sessions.service.spec.ts
// - cohort-enrollments.service.spec.ts
//
// This file verifies the barrel re-exports still work.

import { CohortsService, ClassSessionsService, CohortEnrollmentsService } from './schedules.service';

describe('SchedulesService (barrel)', () => {
  it('should re-export CohortsService', () => {
    expect(CohortsService).toBeDefined();
  });

  it('should re-export ClassSessionsService', () => {
    expect(ClassSessionsService).toBeDefined();
  });

  it('should re-export CohortEnrollmentsService', () => {
    expect(CohortEnrollmentsService).toBeDefined();
  });
});
