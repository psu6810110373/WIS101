import { Photo } from '../../entities/photo.entity';
import { UserRole, Visibility, GenderAccess, Gender } from '../enums';

export function canViewPhoto(photo: Photo, user: { role: string; gender?: string } | null): boolean {
  if (photo.visibility === Visibility.PUBLIC) return true;
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;
  if (photo.visibility === Visibility.PARENT_ONLY && user.role === UserRole.PARENT) {
    if (photo.genderAccess === GenderAccess.ALL) return true;
    if (photo.genderAccess === GenderAccess.MALE_ONLY && user.gender === Gender.MALE) return true;
    if (photo.genderAccess === GenderAccess.FEMALE_ONLY && user.gender === Gender.FEMALE) return true;
    return false;
  }
  return false;
}
