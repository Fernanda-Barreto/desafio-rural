import { configureStore } from '@reduxjs/toolkit';
import producersReducer from './producersSlice';

export const store = configureStore({
  reducer: {
    producers: producersReducer, // <-- ADICIONADO O REDUCER
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;