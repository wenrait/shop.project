import { configureStore } from '@reduxjs/toolkit';
import { productsApi } from './api/products-api.ts';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { commentsApi } from './api/comments-api.ts';

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      productsApi.middleware,
      commentsApi.middleware,
    );
  },
});

setupListeners(store.dispatch);
