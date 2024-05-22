import { body, param } from 'express-validator';

export const validateId = [param('id').isUUID().withMessage('ID is not UUID')];

export const validateCommentPayload = [
  body('name').notEmpty().withMessage('Comment name is empty'),
  body('body').notEmpty().withMessage('Comment body is empty'),
  body('email')
    .notEmpty()
    .withMessage('Comment email is empty')
    .bail()
    .isEmail()
    .withMessage('Comment email is invalid'),
  body('productId')
    .notEmpty()
    .withMessage('Comment productId is empty')
    .bail()
    .isUUID()
    .withMessage('Comment productId is not UUID'),
];

export const validateCreateProductPayload = [
  body('title')
    .notEmpty()
    .withMessage('If you want to create a product, it must have title'),
];

export const validateAddImagesPayload = [
  body('productId')
    .isUUID()
    .withMessage('If you want to add image, product ID must be UUID'),
  body('images')
    .notEmpty()
    .withMessage('If you want to add image, images must not be empty')
    .bail()
    .isArray()
    .withMessage('If you want to add image, images must be an array'),
];

export const validateRemoveImagesPayload = [
  body()
    .isArray({ min: 1 })
    .withMessage(
      'If you want to remove image, images must be a non-empty array',
    ),
];

export const validateUpdateThumbnail = [
  param('id').isUUID().withMessage('Product ID is not UUID'),
  body('newThumbnailId')
    .bail()
    .isUUID()
    .withMessage(
      'If you want to update thumbnail, new thumbnail ID must be UUID',
    ),
];

export const validateSimilarProductsPayload = [
  body('pairs').isArray().withMessage('Pairs must be an array'),
  body('pairs.*')
    .isArray({ min: 2, max: 2 })
    .withMessage('Each pair must be an array with 2 IDs'),
  body('pairs.*.*').isUUID().withMessage('Product ID is not UUID'),
];
