import bcrypt from 'bcrypt';

/**
 * Generate a password hash using bcrypt
 *
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - A promise that resolves to the generated password hash
 */
const generatePasswordHash = async (password) => {
  // Generate a salt and hash the user's password
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  return passwordHash;
};

export default generatePasswordHash;
