import multer from 'multer';

import multerConfig from '../config/multerConfig';
import { IMAGE_PROCESSING_ERROR } from '../constants/apiErrorMessages';

// Function to create a middleware for handling file uploads
const createUploadMiddleware = (configPath, fields) => {
  // Initialize multer with the given configuration path
  const upload = multer(multerConfig(configPath)).fields(fields);

  return (req, res, next) => {
    // Use multer to handle the file upload
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          errors: [IMAGE_PROCESSING_ERROR, err.message],
        });
      }

      next();
    });
  };
};

export const userUpload = createUploadMiddleware('images/user', [
  { name: 'picturePath', maxCount: 1 },
  { name: 'coverPath', maxCount: 1 },
]);

export const postUpload = createUploadMiddleware('images/posts', [{ name: 'picture', maxCount: 1 }]);
