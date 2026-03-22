import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

const tenantId = 'tenant-uuid-1';
const studentProfileId = 'student-uuid-1';
const courseId = 'course-uuid-1';

const mockService = {
  getStudentProgress: jest.fn(),
  getCourseProgress: jest.fn(),
  getMasteryTimeline: jest.fn(),
};

describe('ProgressController', () => {
  let controller: ProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: mockService }],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStudentProgress', () => {
    it('should delegate to service.getStudentProgress', async () => {
      const expected = { studentProfileId, totalSkillsTracked: 5 };
      mockService.getStudentProgress.mockResolvedValue(expected);

      const result = await controller.getStudentProgress(
        tenantId,
        studentProfileId,
      );
      expect(mockService.getStudentProgress).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getCourseProgress', () => {
    it('should delegate to service.getCourseProgress', async () => {
      const expected = { courseId, progressPercent: 80 };
      mockService.getCourseProgress.mockResolvedValue(expected);

      const result = await controller.getCourseProgress(
        tenantId,
        studentProfileId,
        courseId,
      );
      expect(mockService.getCourseProgress).toHaveBeenCalledWith(
        tenantId,
        courseId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getMasteryTimeline', () => {
    it('should delegate to service.getMasteryTimeline', async () => {
      const expected = [{ id: 'mr-1' }];
      mockService.getMasteryTimeline.mockResolvedValue(expected);

      const result = await controller.getMasteryTimeline(
        tenantId,
        studentProfileId,
      );
      expect(mockService.getMasteryTimeline).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });
});
