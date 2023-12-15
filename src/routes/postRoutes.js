import express from 'express';

import loginRequired from '../middleware/loginRequired';
import PostController from '../controllers/PostController';

const router = express.Router();

/* CREATE */
router.post('/', loginRequired, PostController.store);

/* READ */
router.get('/:userId', loginRequired, PostController.index);

/* UPDATE - toggle like */
router.patch('/:id/like', loginRequired, PostController.toggleLike);

export default router;
