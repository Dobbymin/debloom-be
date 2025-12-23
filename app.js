import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';

import { router } from './src/routes/router.js';

const PORT = process.env.PORT || 8081;

const createApp = async () => {
  dotenv.config();

  const app = express();

  // json 포맷을 해독하기 위해 사용하는 미들웨어
  app.use(express.json());

  // x-www-form-urlencoded 포맷을 해독하기 위해 사용하는 미들웨어
  app.use(express.urlencoded({ extended: false }));

  // cors 설정
  app.use(
    cors({
      credentials: true,
      exposedHeaders: ['Authorization', 'Refresh-Token'],
      origin: ['http://localhost:5173', 'http://localhost:3000'],
    })
  );

  // 메인 페이지
  app.get('/', (req, res) => {
    res.send('debloom server 입니다.');
  });

  // API 라우터 등록
  router(app);

  return app;
};

createApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
