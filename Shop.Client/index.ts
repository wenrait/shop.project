import express, { Express } from 'express';
import bodyParser from 'body-parser';
import path from 'node:path';

export default function (): Express {
  const app = express();

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname + '/dist')));

  app.get('*', (req, res) => {
    console.log('Request received for:', req.url);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  return app;
}
