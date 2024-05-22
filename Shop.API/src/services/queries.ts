// COMMENTS
export const SELECT_COMMENTS_QUERY = `SELECT * FROM comments`;

export const SELECT_COMMENT_BY_ID_QUERY = `SELECT * FROM comments WHERE product_id = ?`;

export const COMMENT_DUPLICATE_QUERY = `
  SELECT * FROM comments c
  WHERE LOWER(c.email) = ?
  AND LOWER(c.name) = ?
  AND LOWER(c.body) = ?
  AND c.product_id = ?
`;

export const INSERT_COMMENT_QUERY = `
  INSERT INTO comments
  (comment_id, email, name, body, product_id)
  VALUES
  (?, ?, ?, ?, ?)
`;

export const DELETE_COMMENT_BY_ID = `DELETE FROM comments WHERE comment_id = ?`;

// PRODUCTS

export const SELECT_PRODUCTS_QUERY = `SELECT * FROM products`;

export const SELECT_PRODUCT_BY_ID_QUERY =
  'SELECT * FROM products WHERE product_id = ?';

export const INSERT_PRODUCT_QUERY = `
  INSERT INTO products
  (product_id, title, description, price)
  VALUES
  (?, ?, ?, ?)
`;

export const UPDATE_PRODUCT_FIELDS = `
    UPDATE products 
    SET title = ?, description = ?, price = ? 
    WHERE product_id = ?
`;

// IMAGES

export const SELECT_IMAGES_QUERY = `SELECT * FROM images`;

export const SELECT_IMAGE_BY_ID_QUERY =
  'SELECT * FROM images WHERE product_id = ?';

export const INSERT_PRODUCT_IMAGES_QUERY = `
  INSERT INTO images
  (image_id, url, product_id, main)
  VALUES ?
`;

export const DELETE_IMAGES_QUERY = `
  DELETE FROM images 
  WHERE image_id IN ?;
`;

export const REPLACE_PRODUCT_THUMBNAIL = `
  UPDATE images
  SET main = CASE
    WHEN image_id = ? THEN 0
    WHEN image_id = ? THEN 1
    ELSE main
END
WHERE image_id IN (?, ?);
`;
