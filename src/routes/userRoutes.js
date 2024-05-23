import express from 'express';

import UserController from '../controllers/UserController';
import loginRequired from '../middleware/loginRequired';
import { userUpload } from '../middleware/upload';

const router = express.Router();

/* CREATE */
router.post('/register', UserController.store);

/* READ */
router.get('/:id', loginRequired, UserController.show);
router.get('/:id/friends', loginRequired, UserController.listUserFriends);

/* UPDATE */
router.patch('/update', loginRequired, userUpload, UserController.update); // update atributes
router.patch(
  '/update-friend/:friendId',
  loginRequired,
  UserController.toggleFriend,
); // toggle friends

export default router;
