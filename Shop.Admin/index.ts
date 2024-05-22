import express, { Express } from 'express';
import { productsRouter } from './controllers/products.controller';
import layouts from 'express-ejs-layouts';
import bodyParser from 'body-parser';
import { authRouter, validateSession } from './controllers/auth.controller';
import session from 'express-session';

export default function (): Express {
  const app = express();
  app.use(
    session({
      secret: process.env.SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
    }),
  );

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(layouts);
  app.use(express.static(__dirname + '/public'));

  app.set('view engine', 'ejs');
  app.set('views', 'Shop.Admin/views');

  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session && req.session.username;
    res.locals.location = req.headers.host + req.originalUrl;
    res.locals.username = req.session.username;
    next();
  });

  app.use(validateSession);
  app.use('/auth', authRouter);
  app.use('/', productsRouter);

  return app;
}
