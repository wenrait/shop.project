import { Router, Request, Response, NextFunction } from 'express';
import { IAuthRequisites } from '@Shared/types';
import { verifyRequisites } from '../models/auth.model';
import { throwServerError } from './helpers';

export const authRouter = Router();

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path.includes('/login') || req.path.includes('/authenticate')) {
    next();
    return;
  }

  if (req.session?.username) {
    next();
  } else {
    res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
  }
};

authRouter.get('/login', async (req: Request, res: Response) => {
  try {
    res.render('login');
  } catch (e) {
    throwServerError(res, e);
  }
});

authRouter.post(
  '/authenticate',
  async (req: Request<unknown, unknown, IAuthRequisites>, res: Response) => {
    try {
      const verified = await verifyRequisites(req.body);

      if (verified) {
        req.session.username = req.body.username;
        res.redirect(`/${process.env.ADMIN_PATH}`);
      } else {
        res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
      }
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

authRouter.get('/logout', async (req: Request, res: Response) => {
  try {
    req.session.destroy((e) => {
      if (e) {
        throwServerError(res, e);
      }

      res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
    });
  } catch (e) {
    throwServerError(res, e);
  }
});
