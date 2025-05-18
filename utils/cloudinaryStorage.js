import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';
import cloudinary from '../config/cloudinary.js';

export const productImageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

export const userImageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'users',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});
