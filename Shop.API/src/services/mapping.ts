import { IComment, IImage, IProduct } from '@Shared/types';
import { ICommentsRow, IImagesRow, IProductsRow } from '../../types';

export const mapCommentsRow = ({
  comment_id,
  product_id,
  ...rest
}: ICommentsRow): IComment => {
  return {
    id: comment_id,
    productId: product_id,
    ...rest,
  };
};

export const mapCommentsRows = (data: ICommentsRow[]): IComment[] => {
  return data.map(mapCommentsRow);
};

export const mapProductsRows = (data: IProductsRow[]): IProduct[] => {
  return data.map(({ product_id, title, description, price }) => ({
    id: product_id,
    title: title || '',
    description: description || '',
    price: Number(price) || 0,
  }));
};

export const mapImagesRow = ({
  image_id,
  product_id,
  url,
  main,
}: IImagesRow): IImage => {
  return {
    id: image_id,
    productId: product_id,
    main: Boolean(main),
    url,
  };
};

export const mapImagesRows = (data: IImagesRow[]): IImage[] => {
  return data.map(mapImagesRow);
};
