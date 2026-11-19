import axiosInstance from "./axiosInstance";

// Get all customers (Admin)
export const getAllCustomers = async () => {
  const response = await axiosInstance.get("/customers/all");
  return response.data;
};

// Get customer by ID (Admin)
export const getCustomerById = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
};

// Delete customer by ID (Admin)
export const deleteCustomer = async (id) => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response.data;
};

// Get logged-in customer profile
export const getMyProfile = async () => {
  const response = await axiosInstance.get("/customers/profile");
  return response.data;
};

// Update logged-in customer profile
export const updateMyProfile = async (customerData) => {
  const response = await axiosInstance.put("/customers/profile", customerData);
  return response.data;
};

// Change customer password
export const changeMyPassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/customers/change-password",
    passwordData,
  );
  return response.data;
};
