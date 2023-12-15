import express from 'express';

import UserController from '../controllers/UserController';
import loginRequired from '../middleware/loginRequired';

const router = express.Router();

/* CREATE */
router.post('/register', UserController.store);

/* READ */
router.get('/:id', loginRequired, UserController.show);
router.get('/:id/friends', loginRequired, UserController.listUserFriends);

/* UPDATE - toggle friends */
router.patch('/:friendId', loginRequired, UserController.toggleFriend);

export default router;
