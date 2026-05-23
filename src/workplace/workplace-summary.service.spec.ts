import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkplaceSummaryService } from './workplace-summary.service.js';
import { WorkplacePlacement, PlacementStatus } from './entities/workplace-placement.entity.js';
import { WorkplaceLog } from './entities/workplace-log.entity.js';
import { SupervisorAssessment } from './entities/supervisor-assessment.entity.js';
import { WorkplaceCompetencySignOff } from './entities/workplace-competency-signoff.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
});

const tenantId = 'tenant-uuid';
const studentProfileId = 'student-uuid';

describe('WorkplaceSummaryService', () => {
  let service: WorkplaceSummaryService;
  let placementRepo: ReturnType<typeof mockRepo>;
  let logRepo: ReturnType<typeof mockRepo>;
  let assessmentRepo: ReturnType<typeof mockRepo>;
  let signOffRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkplaceSummaryService,
        { provide: getRepositoryToken(WorkplacePlacement), useFactory: mockRepo },
        { provide: getRepositoryToken(WorkplaceLog), useFactory: mockRepo },
        { provide: getRepositoryToken(SupervisorAssessment), useFactory: mockRepo },
        { provide: getRepositoryToken(WorkplaceCompetencySignOff), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(WorkplaceSummaryService);
    placementRepo = module.get(getRepositoryToken(WorkplacePlacement));
    logRepo = module.get(getRepositoryToken(WorkplaceLog));
    assessmentRepo = module.get(getRepositoryToken(SupervisorAssessment));
    signOffRepo = module.get(getRepositoryToken(WorkplaceCompetencySignOff));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudentSummary', () => {
    it('should return correct summary shape', async () => {
      const placements = [
        { id: 'p1', status: PlacementStatus.ACTIVE, totalHoursLogged: 40 },
        { id: 'p2', status: PlacementStatus.COMPLETED, totalHoursLogged: 160 },
      ];
      const logs = [{ id: 'l1' }, { id: 'l2' }];
      const assessments = [{ id: 'a1' }];
      const signOffs = [
        { id: 's1', demonstratedLevel: ProficiencyLevel.INTERMEDIATE },
        { id: 's2', demonstratedLevel: ProficiencyLevel.ADVANCED },
        { id: 's3', demonstratedLevel: ProficiencyLevel.INTERMEDIATE },
      ];

      placementRepo.find.mockResolvedValue(placements);
      logRepo.find.mockResolvedValue(logs);
      assessmentRepo.find.mockResolvedValue(assessments);
      signOffRepo.find.mockResolvedValue(signOffs);

      const result = await service.getStudentSummary(tenantId, studentProfileId);

      expect(result.studentProfileId).toBe(studentProfileId);
      expect(result.totalPlacements).toBe(2);
      expect(result.activePlacements).toBe(1);
      expect(result.completedPlacements).toBe(1);
      expect(result.totalHoursLogged).toBe(200);
      expect(result.totalSignOffs).toBe(3);
      expect(result.signOffsByLevel[ProficiencyLevel.INTERMEDIATE]).toBe(2);
      expect(result.signOffsByLevel[ProficiencyLevel.ADVANCED]).toBe(1);
      expect(result.recentLogs).toEqual(logs);
      expect(result.recentAssessments).toEqual(assessments);
    });
  });
});
