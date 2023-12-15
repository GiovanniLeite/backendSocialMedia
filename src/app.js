import express from 'express';
import delay from 'express-delay';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import connectDatabase from './config/mongoDB';

import tokenRoutes from './routes/tokenRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';

dotenv.config();

const whiteList = [process.env.APP_URL, process.env.FRONT_URL];
const corsOptions = {
  origin(origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed by CORS'));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.manageDB();
    this.middlewares();
    this.routes();
  }

  manageDB() {
    connectDatabase();
  }

  middlewares() {
    const bodyParserOptions = { limit: '30mb', extended: true };

    this.app.use(express.json(bodyParserOptions));
    this.app.use(express.urlencoded(bodyParserOptions));
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );
    this.app.use(morgan('common'));
    this.app.use(cors(corsOptions));
    this.app.use(delay(2000));

    this.app.use(
      '/assets/',
      express.static(path.join(__dirname, '../public/assets')),
    );
    this.app.use(
      '/images/',
      express.static(path.join(__dirname, '../public/uploads/images')),
    );
  }

  routes() {
    this.app.use('/tokens/', tokenRoutes);
    this.app.use('/users/', userRoutes);
    this.app.use('/posts/', postRoutes);
  }
}

export default new App().app;
