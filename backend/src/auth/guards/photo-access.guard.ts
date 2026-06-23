import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../../entities/photo.entity';
import { canViewPhoto } from '../../common/utils/photo-access';

@Injectable()
export class PhotoAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const photoId = request.params.photoId || request.params.id;

    if (!photoId) {
      return true;
    }

    const photo = await this.photoRepository.findOne({ where: { id: photoId } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID "${photoId}" not found`);
    }

    const user = request.user; // populated by OptionalJwtAuthGuard or JwtAuthGuard
    
    const allowed = canViewPhoto(photo, user);
    if (!allowed) {
      throw new ForbiddenException('You do not have permission to view this photo.');
    }

    // Attach photo to request so the controller can reuse it
    request.photo = photo;

    return true;
  }
}
