import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PhotoAccessGuard } from '../auth/guards/photo-access.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Req() req: any) {
    const user = req.user; // Contains { userId, username, role, gender } or null
    return this.activitiesService.findAll(user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const user = req.user;
    return this.activitiesService.findOne(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createActivityDto: CreateActivityDto, @Req() req: any) {
    const createdById = req.user.userId;
    return this.activitiesService.create(createActivityDto, createdById);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.activitiesService.remove(id);
  }

  // --- Photo Management ---

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Array<any>,
    @Body() uploadPhotoDto: UploadPhotoDto,
  ) {
    return this.activitiesService.addPhotos(id, files, uploadPhotoDto);
  }

  @Put('photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePhoto(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.activitiesService.updatePhoto(photoId, updatePhotoDto);
  }

  @Delete('photos/:photoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removePhoto(@Param('photoId', ParseUUIDPipe) photoId: string) {
    await this.activitiesService.removePhoto(photoId);
  }

  @Get('photos/:photoId/file')
  @UseGuards(OptionalJwtAuthGuard, PhotoAccessGuard)
  async getPhotoFile(
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const photo = req.photo; // Retrieved by PhotoAccessGuard
    const filePath = path.join(process.cwd(), photo.filePath);
    return res.sendFile(filePath);
  }
}
