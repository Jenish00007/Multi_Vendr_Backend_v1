import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user";
import { sellerReducer } from "./reducers/seller";
import { productReducer } from "./reducers/product";
import { eventReducer } from "./reducers/event";
import { cartReducer } from "./reducers/cart";
import { wishlistReducer } from "./reducers/wishlist";
import { orderReducer } from "./reducers/order";
import adminBannerReducer from "./reducers/adminBanner";
import bannerReducer from "./reducers/banner";

const Store = configureStore({
  reducer: {
    // Reducers
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    events: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    adminBanner: adminBannerReducer,
    banner: bannerReducer,
  },
});

export default Store;
