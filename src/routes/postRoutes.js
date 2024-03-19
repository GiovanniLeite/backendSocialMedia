import express from 'express';

import loginRequired from '../middleware/loginRequired';
import PostController from '../controllers/PostController';

const router = express.Router();

/* CREATE */
router.post('/:page', loginRequired, PostController.store);

/* READ */
router.get('/:userId', loginRequired, PostController.index);

/* UPDATE - toggle like */
router.patch('/toggleLike/:postId', loginRequired, PostController.toggleLike);

export default router;
