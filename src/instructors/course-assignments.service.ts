import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CourseAssignment,
  AssignmentStatus,
} from './entities/course-assignment.entity.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { UpdateCourseAssignmentStatusDto } from './dto/update-course-assignment-status.dto.js';
import { InstructorProfile } from './entities/instructor-profile.entity.js';

@Injectable()
export class CourseAssignmentsService {
  constructor(
    @InjectRepository(CourseAssignment)
    private readonly assignmentRepo: Repository<CourseAssignment>,
    @InjectRepository(InstructorProfile)
    private readonly instructorRepo: Repository<InstructorProfile>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateCourseAssignmentDto,
  ): Promise<CourseAssignment> {
    // Check for duplicate assignment
    const existing = await this.assignmentRepo.findOne({
      where: {
        tenantId,
        instructorProfileId: dto.instructorProfileId,
        courseId: dto.courseId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'This instructor is already assigned to this course',
      );
    }

    // Validate course load
    const instructor = await this.instructorRepo.findOne({
      where: { id: dto.instructorProfileId, tenantId },
    });
    if (!instructor) {
      throw new NotFoundException('Instructor profile not found');
    }

    if (instructor.maxCourseLoad > 0) {
      const activeCount = await this.assignmentRepo.count({
        where: {
          tenantId,
          instructorProfileId: dto.instructorProfileId,
          status: AssignmentStatus.ACTIVE,
        },
      });
      if (activeCount >= instructor.maxCourseLoad) {
        throw new BadRequestException(
          `Instructor has reached maximum course load of ${instructor.maxCourseLoad}`,
        );
      }
    }

    const assignment = this.assignmentRepo.create({
      ...dto,
      tenantId,
      assignedAt: new Date(),
    } as Partial<CourseAssignment>);
    return this.assignmentRepo.save(assignment);
  }

  async findByInstructor(
    tenantId: string,
    instructorProfileId: string,
  ): Promise<CourseAssignment[]> {
    return this.assignmentRepo.find({
      where: { tenantId, instructorProfileId },
      relations: ['course'],
      order: { assignedAt: 'DESC' },
    });
  }

  async findByCourse(
    tenantId: string,
    courseId: string,
  ): Promise<CourseAssignment[]> {
    return this.assignmentRepo.find({
      where: { tenantId, courseId },
      relations: ['instructorProfile', 'instructorProfile.user'],
      order: { assignedAt: 'DESC' },
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateCourseAssignmentStatusDto,
  ): Promise<CourseAssignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, tenantId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Course assignment with id "${id}" not found`,
      );
    }

    assignment.status = dto.status as AssignmentStatus;
    if (dto.status === 'completed') {
      assignment.completedAt = new Date();
    }
    return this.assignmentRepo.save(assignment);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id, tenantId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Course assignment with id "${id}" not found`,
      );
    }
    await this.assignmentRepo.remove(assignment);
  }
}
