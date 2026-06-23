import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UserRole, Visibility } from '../common/enums';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, createdById: string): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      ...createAnnouncementDto,
      createdById,
    });
    return this.announcementRepository.save(announcement);
  }

  async findAll(userRole?: UserRole): Promise<Announcement[]> {
    // Admin gets everything
    if (userRole === UserRole.ADMIN) {
      return this.announcementRepository.find({
        order: { publishedAt: 'DESC' },
      });
    }

    // Determine query conditions based on role
    const query = this.announcementRepository.createQueryBuilder('announcement')
      .where('announcement.isActive = :isActive', { isActive: true });

    if (userRole === UserRole.TEACHER) {
      query.andWhere('announcement.visibility IN (:...visibilities)', {
        visibilities: [Visibility.PUBLIC, Visibility.TEACHER_ONLY],
      });
    } else if (userRole === UserRole.PARENT) {
      query.andWhere('announcement.visibility IN (:...visibilities)', {
        visibilities: [Visibility.PUBLIC, Visibility.PARENT_ONLY],
      });
    } else {
      // Guest / Unauthenticated
      query.andWhere('announcement.visibility = :visibility', {
        visibility: Visibility.PUBLIC,
      });
    }

    return query.orderBy('announcement.publishedAt', 'DESC').getMany();
  }

  async findOne(id: string, userRole?: UserRole): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }

    // Check visibility permissions
    if (userRole === UserRole.ADMIN) {
      return announcement;
    }

    if (!announcement.isActive) {
      throw new NotFoundException(`Announcement with ID "${id}" not found`);
    }

    if (announcement.visibility === Visibility.PUBLIC) {
      return announcement;
    }

    if (announcement.visibility === Visibility.TEACHER_ONLY && userRole === UserRole.TEACHER) {
      return announcement;
    }

    if (announcement.visibility === Visibility.PARENT_ONLY && userRole === UserRole.PARENT) {
      return announcement;
    }

    throw new NotFoundException(`Announcement with ID "${id}" not found`);
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.findOne(id, UserRole.ADMIN);
    Object.assign(announcement, updateAnnouncementDto);
    return this.announcementRepository.save(announcement);
  }

  async remove(id: string): Promise<void> {
    const announcement = await this.findOne(id, UserRole.ADMIN);
    await this.announcementRepository.remove(announcement);
  }
}
