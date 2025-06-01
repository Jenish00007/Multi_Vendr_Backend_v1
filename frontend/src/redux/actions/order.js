import axios from "axios";
import { server } from "../../server";

// create order
export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({
      type: "createOrderRequest",
    });

    const { data } = await axios.post(
      `${server}/order/create-order`,
      orderData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    dispatch({
      type: "createOrderSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "createOrderFailed",
      payload: error.response?.data?.message || "Failed to create order",
    });
  }
};

// get all orders of user
export const getAllOrdersOfUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersUserRequest",
    });

    console.log("Fetching orders...");
    const { data } = await axios.get(
      `${server}/order/get-all-orders`,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Orders response:", data);

    if (data.success) {
      dispatch({
        type: "getAllOrdersUserSuccess",
        payload: data.orders,
      });
    } else {
      dispatch({
        type: "getAllOrdersUserFailed",
        payload: "Failed to fetch orders",
      });
    }
  } catch (error) {
    console.error("Error in getAllOrdersOfUser:", error);
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.response?.data?.message || "Failed to fetch orders",
    });
  }
};

// Get all orders of seller
export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-seller-all-orders/${shopId}`
    );

    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.response.data.message,
    });
  }
};

// get all orders of Admin
export const getAllOrdersOfAdmin = () => async (dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    const { data } = await axios.get(`${server}/order/admin-all-orders`, {
      withCredentials: true,
    });

    dispatch({
      type: "adminAllOrdersSuccess",
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.response.data.message,
    });
  }
};

// get order by id
export const getOrderById = (orderId) => async (dispatch) => {
  try {
    dispatch({
      type: "getOrderByIdRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-order/${orderId}`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    dispatch({
      type: "getOrderByIdSuccess",
      payload: data.order,
    });
  } catch (error) {
    dispatch({
      type: "getOrderByIdFailed",
      payload: error.response?.data?.message || "Failed to fetch order",
    });
  }
};
