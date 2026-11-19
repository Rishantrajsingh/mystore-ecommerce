import axiosInstance from "./axiosInstance";

export const loginCustomer = async (email, password) => {
  const response = await axiosInstance.post("/customers/login", {
    email,
    password,
  });

  const data = response.data;

  localStorage.setItem("token", data.token);

  localStorage.setItem(
    "customer",
    JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    }),
  );

  return data;
};

// Register new customer
export const registerCustomer = async (customerData) => {
  const response = await axiosInstance.post(
    "/customers/register",
    customerData,
  );

  return response.data;
};
