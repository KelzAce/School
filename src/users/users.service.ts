import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
    tenantId?: string,
  ): Promise<PaginatedResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async updateProfile(
    id: string,
    dto: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async updateRole(
    id: string,
    role: UserRole,
    requester: User,
  ): Promise<User> {
    if (
      requester.role !== UserRole.SUPER_ADMIN &&
      requester.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    // Prevent non-super-admins from granting super admin
    if (role === UserRole.SUPER_ADMIN && requester.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can assign the super_admin role');
    }

    const user = await this.findOne(id);
    user.role = role;
    return this.userRepository.save(user);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    requester: User,
  ): Promise<User> {
    if (
      requester.role !== UserRole.SUPER_ADMIN &&
      requester.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Only admins can change user status');
    }

    const user = await this.findOne(id);
    user.status = status;
    return this.userRepository.save(user);
  }
}
