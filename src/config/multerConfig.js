import multer from 'multer';
import { extname, resolve } from 'path';

// Returns a value between 10k and 20k
const randomNumber = () => Math.floor(Math.random() * 10000 + 10000);

const createMulterConfig = (destinationFolder) => ({
  // Make sure the file is PNG or JPG
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
      return cb(new multer.MulterError('Arquivo precisa ser PNG ou JPG.'));
    }
    return cb(null, true);
  },
  // Upload the image
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolve(__dirname, '..', '..', 'public', 'uploads', destinationFolder));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${randomNumber()}${extname(file.originalname)}`);
    },
  }),
});

export default createMulterConfig;
