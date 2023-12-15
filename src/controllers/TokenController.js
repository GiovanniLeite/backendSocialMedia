import bcrypt from 'bcrypt';

import User from '../models/User';
import generateAuthToken from '../util/generateAuthToken';

class TokenController {
  /**
   * Create a new token for user authentication (login)
   *
   * @returns {Object} - An object containing the generated token and user information
   */
  async store(req, res) {
    try {
      const { email = '', password = '' } = req.body;

      if (!email || !password) {
        return res.status(401).json({ errors: ['Credenciais inválidas'] });
      }

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({
          errors: ['Email inválido ou Usuário não existe'],
        });
      }

      // Compare the provided password with the hashed password stored in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ errors: ['Senha inválida'] });

      // Create a new token for user authentication
      const token = generateAuthToken(user);

      user.password = '';

      return res.status(200).json({ token, user });
    } catch (err) {
      return res.status(500).json({
        errors: [err.message],
      });
    }
  }
}

export default new TokenController();
