import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import productReducer from "./slices/productSlice"
import categoryReducer from "./slices/categorySlice"
import bannerReducer from "./slices/bannerSlice"
import cartReducer from "./slices/cartSlice"
import orderReducer from "./slices/orderSlice"
import wishlistReducer from "./slices/wishlistSlice"
import reviewReducer from "./slices/reviewSlice"
import couponReducer from "./slices/couponSlice"
import returnReducer from "./slices/returnSlice"
import adminReducer from "./slices/adminSlice"
import digitalMarketerReducer from "./slices/digitalMarketerSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    banners: bannerReducer,
    cart: cartReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    reviews: reviewReducer,
    coupons: couponReducer,
    returns: returnReducer,
    admin: adminReducer,
    digitalMarketer: digitalMarketerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

