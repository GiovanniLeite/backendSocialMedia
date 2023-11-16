import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId não enviado.'],
    },
    firstName: {
      type: String,
      required: [true, 'firstName não enviado.'],
    },
    lastName: {
      type: String,
      required: [true, 'lastName não enviado.'],
    },
    location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

const Post = mongoose.model('Post', PostSchema);

export default Post;
