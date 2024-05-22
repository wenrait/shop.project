import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IComment } from '@Shared/types.ts';

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `http://localhost:3000/api/comments`,
  }),
  endpoints: (builder) => ({
    createComment: builder.mutation<unknown, Partial<IComment>>({
      query: (comment) => ({
        url: '/',
        method: 'POST',
        body: comment,
      }),
    }),
    getCommentsByProductId: builder.query<IComment[], string>({
      query: (id) => `/${id}`,
    }),
  }),
});

export const { useCreateCommentMutation, useGetCommentsByProductIdQuery } =
  commentsApi;
