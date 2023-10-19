import express from 'express';

import loginRequired from '../middleware/loginRequired';
import PostController from '../controllers/PostController';

const router = express.Router();

/* CREATE */
router.post('/', loginRequired, PostController.store);

/* READ */
router.get('/', loginRequired, PostController.index);
router.get('/:userId/posts', loginRequired, PostController.indexByUser);

/* UPDATE - toggle like */
router.patch('/:id/like', loginRequired, PostController.updateToggleLike);

export default router;
