// TODO: Для всех трёх запросов нужно добавить валидацию входных данных при помощи express-validator.
//  Проверок может быть несколько: на наличие массива в body, на структуру массива, на структуру данных и т.д.

import { Request, Response, Router } from 'express';
import { connection } from '../../index';
import { v4 as uuidv4 } from 'uuid';
import {
  AddImagesPayload,
  CreateProductPayload,
  ICommentsRow,
  IImagesRow,
  IProductsRow,
  ISimilarProductsRow,
  RemoveImagesPayload,
} from '../../types';
import {
  mapCommentsRows,
  mapImagesRows,
  mapProductsRows,
} from '../services/mapping';
import {
  addComments,
  addImages,
  getProductsFilterQuery,
  throwServerError,
} from '../helpers';
import { ResultSetHeader } from 'mysql2';
import {
  DELETE_IMAGES_QUERY,
  INSERT_PRODUCT_IMAGES_QUERY,
  INSERT_PRODUCT_QUERY,
  REPLACE_PRODUCT_THUMBNAIL,
  SELECT_COMMENT_BY_ID_QUERY,
  SELECT_COMMENTS_QUERY,
  SELECT_IMAGE_BY_ID_QUERY,
  SELECT_IMAGES_QUERY,
  SELECT_PRODUCT_BY_ID_QUERY,
  SELECT_PRODUCTS_QUERY,
  UPDATE_PRODUCT_FIELDS,
} from '../services/queries';
import { IFilter, IProduct } from '@Shared/types';
import { validationResult } from 'express-validator';
import { isEmpty } from 'lodash';
import {
  validateAddImagesPayload,
  validateCreateProductPayload,
  validateId,
  validateRemoveImagesPayload,
  validateSimilarProductsPayload,
  validateUpdateThumbnail,
} from '../services/validators';

export const productsRouter = Router();

productsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [productsRows] = await connection.query<IProductsRow[]>(
      SELECT_PRODUCTS_QUERY,
    );
    const [commentsRows] = await connection.query<ICommentsRow[]>(
      SELECT_COMMENTS_QUERY,
    );
    const [imagesRows] =
      await connection.query<IImagesRow[]>(SELECT_IMAGES_QUERY);

    const products = mapProductsRows(productsRows);
    const withComments = addComments(products, commentsRows);
    const withImages = addImages(withComments, imagesRows);

    res.send(withImages);
  } catch (e) {
    throwServerError(res, e);
  }
});

productsRouter.get(
  '/search',
  async (req: Request<unknown, unknown, unknown, IFilter>, res: Response) => {
    try {
      if (isEmpty(req.query)) {
        res.status(400).send(`Filter is empty ${req.query}`);
        return;
      }

      const [query, values] = getProductsFilterQuery(req.query);
      const [productsRows] = await connection.query<IProductsRow[]>(
        query,
        values,
      );

      if (isEmpty(productsRows)) {
        res.send([]);
        return;
      }

      const [commentsRows] = await connection.query<ICommentsRow[]>(
        SELECT_COMMENTS_QUERY,
      );
      const [imagesRows] =
        await connection.query<IImagesRow[]>(SELECT_IMAGES_QUERY);

      const products = mapProductsRows(productsRows);
      const withComments = addComments(products, commentsRows);
      const withImages = addImages(withComments, imagesRows);

      res.send(withImages);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.get(
  '/:id',
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
      }

      const [productsRows] = await connection.query<IProductsRow[]>(
        SELECT_PRODUCT_BY_ID_QUERY,
        [req.params.id],
      );

      if (isEmpty(productsRows)) {
        res.status(404).send(`Product with id ${req.params.id} is not found`);
        return;
      }

      const [commentsRows] = await connection.query<ICommentsRow[]>(
        SELECT_COMMENT_BY_ID_QUERY,
        [req.params.id],
      );

      const [imagesRows] = await connection.query<IImagesRow[]>(
        SELECT_IMAGE_BY_ID_QUERY,
        [req.params.id],
      );

      const product = mapProductsRows(productsRows)[0];

      if (commentsRows.length) {
        product.comments = mapCommentsRows(commentsRows);
      }

      if (imagesRows.length) {
        product.images = mapImagesRows(imagesRows);
        product.thumbnail =
          product.images.find((image) => image.main) || product.images[0];
      }

      res.send(product);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/',
  validateCreateProductPayload,
  async (
    req: Request<unknown, unknown, CreateProductPayload>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
      }

      const { title, description, price } = req.body;
      const id = uuidv4();
      await connection.query<ResultSetHeader>(INSERT_PRODUCT_QUERY, [
        id,
        title,
        description || null,
        price || null,
      ]);

      const [productsRows] = await connection.query<IProductsRow[]>(
        SELECT_PRODUCT_BY_ID_QUERY,
        [id],
      );

      const product = mapProductsRows(productsRows)[0];

      res.status(201).json(product);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.patch(
  '/:id',
  async (
    req: Request<{ id: string }, unknown, CreateProductPayload>,
    res: Response,
  ) => {
    try {
      const { id } = req.params;

      const [productsRows] = await connection.query<IProductsRow[]>(
        SELECT_PRODUCT_BY_ID_QUERY,
        [id],
      );

      if (isEmpty(productsRows)) {
        res.status(404);
        res.send(`Product with id ${id} is not found`);
        return;
      }

      const currentProduct = productsRows[0];
      const updatedProduct = {
        title: req.body.title || currentProduct.title,
        description: req.body.description || currentProduct.description,
        price: req.body.price || currentProduct.price,
      };

      await connection.query<ResultSetHeader>(UPDATE_PRODUCT_FIELDS, [
        updatedProduct.title,
        updatedProduct.description,
        updatedProduct.price,
        id,
      ]);

      res.send(`Product id:${id} has been added!`);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.delete(
  '/:id',
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
      }

      const [productsRows] = await connection.query<IProductsRow[]>(
        SELECT_PRODUCT_BY_ID_QUERY,
        [req.params.id],
      );

      if (isEmpty(productsRows)) {
        res.status(404).send(`Product with id ${req.params.id} is not found`);
        return;
      }

      await connection.query<ResultSetHeader>(
        'DELETE FROM images WHERE product_id = ?',
        [req.params.id],
      );

      await connection.query<ResultSetHeader>(
        'DELETE FROM comments WHERE product_id = ?',
        [req.params.id],
      );

      await connection.query<ResultSetHeader>(
        `DELETE FROM similar_products WHERE product_id = ? OR similar_product_id = ?`,
        [req.params.id, req.params.id],
      );

      await connection.query<ResultSetHeader>(
        'DELETE FROM products WHERE product_id = ?',
        [req.params.id],
      );

      res.end();
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/add-images',
  validateAddImagesPayload,
  async (req: Request<unknown, unknown, AddImagesPayload>, res: Response) => {
    try {
      console.log('ADDING IMAGE');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
      }

      const { productId, images } = req.body;

      const values = images.map((image) => [
        uuidv4(),
        image.url,
        productId,
        image.main,
      ]);

      console.log(values);
      await connection.query<ResultSetHeader>(INSERT_PRODUCT_IMAGES_QUERY, [
        values,
      ]);

      res.status(201);
      res.send(`Images for a product id:${productId} have been added!`);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/remove-images',
  validateRemoveImagesPayload,
  async (
    req: Request<unknown, unknown, RemoveImagesPayload>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
      }

      const imagesToRemove = req.body;

      const [imagesRows] = await connection.query<IImagesRow[]>(
        'SELECT * FROM images WHERE image_id IN (?)',
        [imagesToRemove],
      );

      const mainImages = imagesRows.filter((image) => image.main);
      if (mainImages.length > 0) {
        res.status(400).send('Cannot remove main image.');
        return;
      }

      const [info] = await connection.query<ResultSetHeader>(
        DELETE_IMAGES_QUERY,
        [[imagesToRemove]],
      );

      if (info.affectedRows === 0) {
        res.status(404).send('No one image has been removed');
        return;
      }

      res.send(`Images have been removed!`);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/update-thumbnail/:id',
  validateUpdateThumbnail,
  async (
    req: Request<{ id: string }, unknown, { newThumbnailId: string }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400);
        res.json({ errors: errors.array() });
        return;
      }

      const [currentThumbnailRows] = await connection.query<IImagesRow[]>(
        'SELECT * FROM images WHERE product_id=? AND main=?',
        [req.params.id, 1],
      );

      if (!currentThumbnailRows?.length || currentThumbnailRows.length > 1) {
        res.status(400);
        res.send('Incorrect product id');
        return;
      }

      const [newThumbnailRows] = await connection.query<IImagesRow[]>(
        'SELECT * FROM images WHERE product_id=? AND image_id=?',
        [req.params.id, req.body.newThumbnailId],
      );

      if (newThumbnailRows?.length !== 1) {
        res.status(400);
        res.send('Incorrect new thumbnail id');
        return;
      }

      const currentThumbnailId = currentThumbnailRows[0].image_id;
      const [info] = await connection.query<ResultSetHeader>(
        REPLACE_PRODUCT_THUMBNAIL,
        [
          currentThumbnailId,
          req.body.newThumbnailId,
          currentThumbnailId,
          req.body.newThumbnailId,
        ],
      );

      if (info.affectedRows === 0) {
        res.status(404);
        res.send('No one image has been updated');
        return;
      }

      res.status(200);
      res.send('New product thumbnail has been set!');
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.get(
  '/similar/:id',
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [similarProductsRows] = await connection.query<
        ISimilarProductsRow[]
      >(
        `SELECT similar_product_id FROM similar_products WHERE product_id = ?`,
        [req.params.id],
      );

      if (isEmpty(similarProductsRows)) {
        return res.send([]);
      }

      const similarProductsIds = similarProductsRows.map(
        (row) => row.similar_product_id,
      );

      const [productsRows] = await connection.query<IProductsRow[]>(
        `SELECT * FROM products WHERE product_id IN (?)`,
        [similarProductsIds],
      );

      const products: IProduct[] = productsRows.map(
        ({ product_id, ...rest }) => {
          return {
            id: product_id,
            ...rest,
          };
        },
      );

      res.send(products);
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/add-similar',
  validateSimilarProductsPayload,
  async (
    req: Request<unknown, unknown, { pairs: [string, string][] }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pairs } = req.body;

      if (!pairs || pairs.length === 0) {
        res.status(400).send('No similar products to add');
        return;
      }

      const values = pairs.map((pair) => [uuidv4(), pair[0], pair[1]]);

      await connection.query<ResultSetHeader>(
        `INSERT INTO similar_products (id, product_id, similar_product_id) VALUES ?`,
        [values],
      );

      res.status(201).send('Similar products have been added!');
    } catch (e) {
      throwServerError(res, e);
    }
  },
);

productsRouter.post(
  '/remove-similar',
  validateSimilarProductsPayload,
  async (
    req: Request<unknown, unknown, { pairs: [string, string][] }>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pairs } = req.body;

      if (!pairs || pairs.length === 0) {
        res.status(400).send('No similar products to remove');
        return;
      }

      const [info] = await connection.query<ResultSetHeader>(
        'DELETE FROM similar_products WHERE (product_id, similar_product_id) IN (?)',
        [pairs],
      );

      if (info.affectedRows === 0) {
        res.status(404).send('No similar products have been removed');
        return;
      }

      res.status(201).send('Deleted');
    } catch (e) {
      throwServerError(res, e);
    }
  },
);
