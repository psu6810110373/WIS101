import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Activity } from '../entities/activity.entity';
import { Photo } from '../entities/photo.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UserRole, Visibility } from '../common/enums';
import { canViewPhoto } from '../common/utils/photo-access';

@Injectable()
export class ActivitiesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'photos');

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(createActivityDto: CreateActivityDto, createdById: string): Promise<Activity> {
    const activity = this.activityRepository.create({
      ...createActivityDto,
      createdById,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(user: { role: string; gender?: string } | null): Promise<Activity[]> {
    const userRole = user?.role;

    // Fetch activities from DB with their photos
    let query = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.photos', 'photo');

    // Filter activities by visibility first
    if (userRole === UserRole.ADMIN) {
      // Admin sees everything
    } else if (userRole === UserRole.PARENT) {
      query = query.where('activity.visibility IN (:...visibilities)', {
        visibilities: [Visibility.PUBLIC, Visibility.PARENT_ONLY],
      });
    } else {
      // Guest, Teacher, etc. see PUBLIC only
      query = query.where('activity.visibility = :visibility', {
        visibility: Visibility.PUBLIC,
      });
    }

    const activities = await query.orderBy('activity.activityDate', 'DESC').getMany();

    // Now filter the photos inside each activity based on user role/gender
    activities.forEach((activity) => {
      if (activity.photos) {
        activity.photos = activity.photos.filter((photo) => canViewPhoto(photo, user));
      }
    });

    return activities;
  }

  async findOne(id: string, user: { role: string; gender?: string } | null): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['photos'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }

    // Check if the user is authorized to see the activity
    const userRole = user?.role;
    if (userRole !== UserRole.ADMIN) {
      if (activity.visibility === Visibility.PARENT_ONLY && userRole !== UserRole.PARENT) {
        throw new NotFoundException(`Activity with ID "${id}" not found`);
      }
      if (activity.visibility === Visibility.TEACHER_ONLY && userRole !== UserRole.TEACHER) {
        throw new NotFoundException(`Activity with ID "${id}" not found`);
      }
    }

    // Filter photos
    if (activity.photos) {
      activity.photos = activity.photos.filter((photo) => canViewPhoto(photo, user));
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.activityRepository.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }
    Object.assign(activity, updateActivityDto);
    return this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }

    // Delete photo files from disk first
    if (activity.photos) {
      for (const photo of activity.photos) {
        const fullPath = path.join(process.cwd(), photo.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
        await this.photoRepository.remove(photo);
      }
    }

    await this.activityRepository.remove(activity);
  }

  // --- Photo Management ---

  async addPhotos(
    activityId: string,
    files: Array<any>, // Express.Multer.File[]
    uploadPhotoDto: UploadPhotoDto,
  ): Promise<Photo[]> {
    const activity = await this.activityRepository.findOne({ where: { id: activityId } });
    if (!activity) {
      throw new NotFoundException(`Activity with ID "${activityId}" not found`);
    }

    const savedPhotos: Photo[] = [];

    for (const file of files) {
      // Generate unique name
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      const relativePath = `uploads/photos/${filename}`;
      const fullPath = path.join(this.uploadDir, filename);

      // Save file
      fs.writeFileSync(fullPath, file.buffer);

      const photo = this.photoRepository.create({
        activityId,
        filePath: relativePath,
        genderAccess: uploadPhotoDto.genderAccess,
        visibility: uploadPhotoDto.visibility,
      });

      const savedPhoto = await this.photoRepository.save(photo);
      savedPhotos.push(savedPhoto);
    }

    return savedPhotos;
  }

  async updatePhoto(photoId: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID "${photoId}" not found`);
    }
    Object.assign(photo, updatePhotoDto);
    return this.photoRepository.save(photo);
  }

  async removePhoto(photoId: string): Promise<void> {
    const photo = await this.photoRepository.findOne({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID "${photoId}" not found`);
    }

    // Delete file
    const fullPath = path.join(process.cwd(), photo.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.photoRepository.remove(photo);
  }
}
