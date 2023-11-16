import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'O campo "Nome" é obrigatório.'],
      min: [3, 'O campo "Nome" deve ter pelo menos 3 caracteres.'],
      max: [50, 'O campo "Nome" deve ter no máximo 50 caracteres.'],
    },
    lastName: {
      type: String,
      required: [true, 'O campo "Sobrenome" é obrigatório.'],
      min: [3, 'O campo "Sobrenome" deve ter pelo menos 3 caracteres.'],
      max: [50, 'O campo "Sobrenome" deve ter no máximo 50 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'O campo "Email" é obrigatório.'],
      unique: [true, 'O endereço de Email já está em uso.'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'O campo "Email" deve ser um endereço de email válido.',
      ],
      max: [50, 'O campo "Email" deve ter no máximo 50 caracteres.'],
    },
    password: {
      type: String,
      required: [true, 'O campo "Senha" é obrigatório.'],
      min: [8, 'O campo "Senha" deve ter pelo menos 8 caracteres.'],
      max: [50, 'O campo "Senha" deve ter no máximo 50 caracteres.'],
    },
    picturePath: {
      type: String,
      default: '',
    },
    friends: {
      type: Array,
      default: [],
    },
    location: {
      type: String,
      required: [true, 'O campo "Localização" é obrigatório.'],
      min: [3, 'O campo "Localização" deve ter pelo menos 3 caracteres.'],
      max: [50, 'O campo "Localização" deve ter no máximo 50 caracteres.'],
    },
    occupation: {
      type: String,
      required: [true, 'O campo "Ocupação" é obrigatório.'],
      min: [3, 'O campo "Ocupação" deve ter pelo menos 3 caracteres.'],
      max: [50, 'O campo "Ocupação" deve ter no máximo 50 caracteres.'],
    },
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);

export default User;
