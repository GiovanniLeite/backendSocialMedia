/* *** API ERROR MESSAGES (Social Media) v1.0 05/06/2024 *** */

// MIDDLEWARE - loginRequired
export const LOGIN_REQUIRED_ERROR = 'Login is required';
export const INVALID_TOKEN_ERROR = 'The token is expired or invalid. Please log out and log in again.';

// MIDDLEWARE - Upload Files - upload
export const IMAGE_PROCESSING_ERROR = 'Error processing the image.';

// LOGIN - TokenController
export const INVALID_CREDENTIALS_ERROR = 'Invalid credentials.';
export const INVALID_EMAIL_OR_USER_NOT_EXIST_ERROR = 'Invalid email or the user does not exist.';
export const INVALID_PASSWORD_ERROR = 'Invalid password.';

// USER - POST - UserController - PostController
export const USER_NOT_FOUND_ERROR = 'User not found.';
export const USERS_NOT_FOUND_ERROR = 'User(s) not found.';
export const EMAIL_ALREADY_IN_USE_ERROR = 'This email address is already in use.';
export const NO_FIELDS_PROVIDED_ERROR = 'No fields provided for the update.';
export const MAX_FRIENDS_REACHED_ERROR = 'You or the other user have reached the maximum number of friends.';
export const POST_NOT_FOUND_ERROR = 'Post not found.';
