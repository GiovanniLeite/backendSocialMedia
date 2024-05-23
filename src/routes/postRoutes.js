import express from 'express';

import PostController from '../controllers/PostController';
import loginRequired from '../middleware/loginRequired';
import { postUpload } from '../middleware/upload';

const router = express.Router();

/* CREATE */
router.post('/:page', loginRequired, postUpload, PostController.store);

/* READ */
router.get('/:userId', loginRequired, PostController.index);

/* UPDATE - toggle like */
router.patch('/toggleLike/:postId', loginRequired, PostController.toggleLike);

export default router;
