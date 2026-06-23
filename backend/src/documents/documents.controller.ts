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
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as path from 'path';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: any,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: any,
  ) {
    const uploader = {
      userId: req.user.userId,
      role: req.user.role,
    };
    return this.documentsService.create(file, createDocumentDto, uploader);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findAll(@Req() req: any) {
    const user = {
      userId: req.user.userId,
      role: req.user.role,
    };
    return this.documentsService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const user = {
      userId: req.user.userId,
      role: req.user.role,
    };
    return this.documentsService.findOne(id, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.documentsService.remove(id);
  }

  @Get(':id/file')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getDocumentFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const user = {
      userId: req.user.userId,
      role: req.user.role,
    };
    const document = await this.documentsService.findOne(id, user);
    const filePath = path.join(process.cwd(), document.filePath);
    return res.sendFile(filePath);
  }
}
