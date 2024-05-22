export interface IComment {
  id: string;
  name: string;
  email: string;
  body: string;
  productId: string;
}
export interface IImage {
  id: string;
  url: string;
  main: boolean;
  productId: string;
}
export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: IImage;
  comments?: IComment[];
  images?: IImage[];
}

export interface IFilter {
  title?: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
}

export interface IAuthRequisites {
  username: string;
  password: string;
}
