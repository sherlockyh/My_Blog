import { message } from 'antd';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    message.error('仅支持 PNG、JPG、GIF、WebP 图片');
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    message.error('图片不能超过 5MB');
    return false;
  }
  return true;
}
