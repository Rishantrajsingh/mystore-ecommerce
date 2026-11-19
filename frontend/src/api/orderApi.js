import axiosInstance from "./axiosInstance";

// Place order
export const checkoutOrder = async () => {
  const response = await axiosInstance.post("/orders/checkout");
  return response.data;
};

// Get logged-in customer's orders
export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders");
  return response.data;
};

// Get single order details
export const getMyOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

// Cancel an order
export const cancelMyOrder = async (orderId) => {
  const response = await axiosInstance.put(`/orders/${orderId}/cancel`);
  return response.data;
};

// Get all orders (Admin)
export const getAllOrders = async () => {
  const response = await axiosInstance.get("/orders/admin");
  return response.data;
};

// Update order status (Admin)
export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(`/orders/${orderId}/status`, null, {
    params: { status },
  });

  return response.data;
};
