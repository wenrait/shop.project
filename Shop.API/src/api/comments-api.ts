import { Request, Response, Router } from 'express';
import { CreateCommentPayload, ICommentsRow } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { IComment } from '@Shared/types';
import { ResultSetHeader } from 'mysql2';
import {
  DELETE_COMMENT_BY_ID,
  INSERT_COMMENT_QUERY,
  SELECT_COMMENT_BY_ID_QUERY,
  SELECT_COMMENTS_QUERY,
} from '../services/queries';
import { connection } from '../../index';
import { hasDuplicate, throwServerError } from '../helpers';
import { validationResult } from 'express-validator';
import { isEmpty } from 'lodash';
import { mapCommentsRows } from '../services/mapping';
import { validateCommentPayload, validateId } from '../services/validators';

export const commentsRouter = Router();

commentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const [commentsRows] = await connection.query<ICommentsRow[]>(
      SELECT_COMMENTS_QUERY,
    );

    res.setHeader('Content-Type', 'application/json');
    res.send(mapCommentsRows(commentsRows));
  } catch (e) {
    throwServerError(res, e);
  }
});

commentsRouter.get(
  '/:id',
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const [commentsRows] = await connection.query<ICommentsRow[]>(
        SELECT_COMMENT_BY_ID_QUERY,
        [req.params.id],
      );

      if (isEmpty(commentsRows)) {
        res.status(404).send(`Comment with id ${req.params.id} is not found`);
        return;
      }

      res.send(mapCommentsRows(commentsRows));
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

commentsRouter.post(
  '/',
  validateCommentPayload,
  async (
    req: Request<unknown, unknown, CreateCommentPayload>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, body, email, productId } = req.body;

      if (await hasDuplicate(req.body)) {
        res.status(422);
        res.send('Comment with the same fields already exists');
        return;
      }

      const id = uuidv4();
      await connection.query<ResultSetHeader>(INSERT_COMMENT_QUERY, [
        id,
        email,
        name,
        body,
        productId,
      ]);

      res.status(201).send(`Comment id: ${id} has been added!`);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

commentsRouter.patch(
  '/',
  validateCommentPayload,
  async (req: Request<unknown, unknown, Partial<IComment>>, res: Response) => {
    try {
      let updateQuery = 'UPDATE comments SET ';

      const valuesToUpdate = [];
      ['name', 'body', 'email'].forEach((fieldName) => {
        if (req.body.hasOwnProperty(fieldName)) {
          if (valuesToUpdate.length) {
            updateQuery += ', ';
          }

          updateQuery += `${fieldName} = ?`;
          valuesToUpdate.push(req.body[fieldName]);
        }
      });

      updateQuery += ' WHERE comment_id = ?';
      valuesToUpdate.push(req.body.id);

      const [info] = await connection.query<ResultSetHeader>(
        updateQuery,
        valuesToUpdate,
      );

      if (info.affectedRows === 1) {
        res.send('Comment patched');
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const newComment = req.body as CreateCommentPayload;
      const { name, email, body, productId } = newComment;

      if (await hasDuplicate(newComment)) {
        res.status(422).send('Comment with the same fields already exists');
        return;
      }

      const id = uuidv4();
      await connection.query<ResultSetHeader>(INSERT_COMMENT_QUERY, [
        id,
        email,
        name,
        body,
        productId,
      ]);

      res.status(201).send({ ...newComment, id });
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

commentsRouter.delete(
  '/:id',
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const [info] = await connection.query<ResultSetHeader>(
        DELETE_COMMENT_BY_ID,
        [req.params.id],
      );

      if (info.affectedRows === 0) {
        res.status(404).send(`Comment with id ${req.params.id} is not found`);
        return;
      }

      res.send('Comment deleted');
    } catch (e) {
      throwServerError(res, e);
    }
  },
);
