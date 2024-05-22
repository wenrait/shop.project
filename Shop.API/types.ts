import { RowDataPacket } from 'mysql2';
import { IAuthRequisites, IComment, IImage, IProduct } from '@Shared/types';

export type CreateCommentPayload = Omit<IComment, 'id'>;

export type CreateImagePayload = Omit<IImage, 'id' | 'productId'>;

export type CreateProductPayload = Omit<
  IProduct,
  'id' | 'comments' | 'thumbnail' | 'images'
>;
//& { images: CreateImagePayload[]
export interface ICommentsRow extends IComment, RowDataPacket {
  comment_id: string;
  product_id: string;
}

export interface IImagesRow extends IImage, RowDataPacket {
  image_id: string;
  product_id: string;
}

export interface IProductsRow extends IProduct, RowDataPacket {
  product_id: string;
}

export interface ISimilarProductsRow extends RowDataPacket {
  product_id: string;
  similar_product_id: string;
}

export interface AddImagesPayload {
  productId: string;
  images: CreateImagePayload[];
}

export type RemoveImagesPayload = string[];

export interface IUserRequisitesRow extends IAuthRequisites, RowDataPacket {
  id: number;
}

export type ActionSimilarProductsPayload = ISimilarProductsRow[];
