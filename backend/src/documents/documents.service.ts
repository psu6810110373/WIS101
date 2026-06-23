import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Document } from '../entities/document.entity';
import { Teacher } from '../entities/teacher.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UserRole, AccessRole } from '../common/enums';

@Injectable()
export class DocumentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'documents');

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(
    file: any, // Express.Multer.File
    createDocumentDto: CreateDocumentDto,
    uploader: { userId: string; role: UserRole },
  ): Promise<Document> {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    let uploadedById: string | null = null;

    if (uploader.role === UserRole.TEACHER) {
      // Find teacher profile
      const teacher = await this.teacherRepository.findOne({
        where: { userId: uploader.userId },
      });
      if (!teacher) {
        throw new ForbiddenException('Teacher profile not found for this user account.');
      }
      uploadedById = teacher.id;
    }

    // Generate unique name
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const relativePath = `uploads/documents/${filename}`;
    const fullPath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(fullPath, file.buffer);

    const document = this.documentRepository.create({
      title: createDocumentDto.title,
      filePath: relativePath,
      accessRole: createDocumentDto.accessRole,
      uploadedById,
    });

    return this.documentRepository.save(document);
  }

  async findAll(user: { role: UserRole; userId: string }): Promise<Document[]> {
    if (user.role === UserRole.ADMIN) {
      // Admin sees all documents
      return this.documentRepository.find({
        order: { uploadedAt: 'DESC' },
      });
    }

    if (user.role === UserRole.TEACHER) {
      // Teachers see TEACHER or ALL
      return this.documentRepository.find({
        where: [
          { accessRole: AccessRole.TEACHER },
          { accessRole: AccessRole.ALL },
        ],
        order: { uploadedAt: 'DESC' },
      });
    }

    // Parents/Guests don't have access
    throw new ForbiddenException('Access to school documents is restricted.');
  }

  async findOne(id: string, user: { role: UserRole; userId: string }): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    if (user.role === UserRole.ADMIN) {
      return document;
    }

    if (user.role === UserRole.TEACHER) {
      if (document.accessRole === AccessRole.TEACHER || document.accessRole === AccessRole.ALL) {
        return document;
      }
    }

    throw new ForbiddenException('Access to this document is restricted.');
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    // Delete file
    const fullPath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.documentRepository.remove(document);
  }
}
