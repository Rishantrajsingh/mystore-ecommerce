import axiosInstance from "./axiosInstance";

export const addToCart = async (productId, quantity) => {
  const response = await axiosInstance.post("/cart/add", {
    productId,
    quantity,
  });

  return response.data;
};

export const getMyCart = async () => {
  const response = await axiosInstance.get("/cart");

  return response.data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await axiosInstance.put(
    `/cart/${productId}?quantity=${quantity}`,
  );

  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/cart/${productId}`);

  return response.data;
};
