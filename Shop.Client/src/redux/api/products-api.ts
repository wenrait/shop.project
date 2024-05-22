import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IFilter, IProduct } from '@Shared/types.ts';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:3000/api/products`,
  }),
  endpoints: (builder) => ({
    getAllProducts: builder.query<IProduct[], unknown>({
      query: () => '/',
    }),
    getProductsBySearch: builder.query<IProduct[], IFilter>({
      query: (filters) => ({
        url: '/search',
        params: filters,
      }),
    }),
    getProductById: builder.query<IProduct, string>({
      query: (id) => `/${id}`,
    }),
    getSimilarProducts: builder.query<IProduct[], string>({
      query: (id) => `/similar/${id}`,
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductsBySearchQuery,
  useGetProductByIdQuery,
  useGetSimilarProductsQuery,
} = productsApi;
