import { CreateCommentPayload, ICommentsRow, IImagesRow } from '../types';
import { IComment, IFilter, IImage, IProduct } from '@Shared/types';
import { mapCommentsRow, mapImagesRow } from './services/mapping';
import { connection } from '../index';
import { COMMENT_DUPLICATE_QUERY } from './services/queries';
import { Response } from 'express';

export const throwServerError = (res: Response, e: Error) => {
  console.debug(e.message);
  res.status(500);
  res.json({ error: e.message });
};
export async function hasDuplicate(comment: CreateCommentPayload) {
  const { name, body, email, productId } = comment;
  const [duplicate] = await connection.query<ICommentsRow[]>(
    COMMENT_DUPLICATE_QUERY,
    [email.toLowerCase(), name.toLowerCase(), body.toLowerCase(), productId],
  );

  return duplicate.length > 0;
}

export const addComments = (
  products: IProduct[],
  commentsRows: ICommentsRow[],
): IProduct[] => {
  const commentsByProductId = new Map<string, IComment[]>();

  for (const commentsRow of commentsRows) {
    const comment = mapCommentsRow(commentsRow);
    if (!commentsByProductId.has(comment.productId)) {
      commentsByProductId.set(comment.productId, []);
    }

    const list = commentsByProductId.get(comment.productId);
    commentsByProductId.set(comment.productId, [...list, comment]);
  }

  for (const product of products) {
    if (commentsByProductId.has(product.id)) {
      product.comments = commentsByProductId.get(product.id);
    }
  }

  return products;
};


export const addImages = (
  products: IProduct[],
  imagesRows: IImagesRow[],
): IProduct[] => {
  const imagesByProductId = new Map<string, IImage[]>();
  const thumbnailsByProductId = new Map<string, IImage>();

  for (const imagesRow of imagesRows) {
    const image = mapImagesRow(imagesRow);
    if (!imagesByProductId.has(image.productId)) {
      imagesByProductId.set(image.productId, []);
    }

    const list = imagesByProductId.get(image.productId);
    imagesByProductId.set(image.productId, [...list, image]);

    if (image.main) {
      thumbnailsByProductId.set(image.productId, image);
    }
  }

  for (const product of products) {
    product.thumbnail = thumbnailsByProductId.get(product.id);

    if (imagesByProductId.has(product.id)) {
      product.images = imagesByProductId.get(product.id);
      // setThumbnail(product);

      if (!product.thumbnail) {
        product.thumbnail = product.images[0];
      }
    }
  }

  return products;
};

export const getProductsFilterQuery = (filter: IFilter): [string, string[]] => {
  const { title, description, priceFrom, priceTo } = filter;

  let query = 'SELECT * FROM products WHERE ';
  const values = [];

  if (title) {
    query += 'title LIKE ? ';
    values.push(`%${title}%`);
  }

  if (description) {
    if (values.length) {
      query += ' OR ';
    }

    query += 'description LIKE ? ';
    values.push(`%${description}%`);
  }

  if (priceFrom || priceTo) {
    if (values.length) {
      query += ' OR ';
    }

    query += `(price > ? AND price < ?)`;
    values.push(priceFrom || 0);
    values.push(priceTo || 999999);
  }

  return [query, values];
};
