import axiosInstance from "./axiosInstance";

export const getAllProducts = async () => {
  const response = await axiosInstance.get("/all-products");
  return response.data;
};

export const searchProducts = async (name) => {
  const response = await axiosInstance.get("/products/search", {
    params: { name },
  });
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await axiosInstance.get("/products/category", {
    params: { category },
  });
  return response.data;
};

export const getProductsByPriceRange = async (minPrice, maxPrice) => {
  const response = await axiosInstance.get("/products/filter", {
    params: {
      minPrice,
      maxPrice,
    },
  });
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await axiosInstance.post("/add-product", productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const getProductsSortedByPrice = async (direction) => {
  const response = await axiosInstance.get("/products/sort", {
    params: { direction },
  });

  return response.data;
};

export const getProductsByPage = async (page, size) => {
  const response = await axiosInstance.get("/products/page", {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

export const getProductsPageSorted = async (page, size, direction) => {
  const response = await axiosInstance.get("/products/page-sorted", {
    params: {
      page,
      size,
      direction,
    },
  });

  return response.data;
};

// Get low stock products
export const getLowStockProducts = async (stock = 5) => {
  const response = await axiosInstance.get("/products/low-stock", {
    params: { stock },
  });

  return response.data;
};

// Restock Product
export const restockProduct = async (id, quantity) => {
  const response = await axiosInstance.patch(`/products/${id}/restock`, null, {
    params: { quantity },
  });

  return response.data;
};

// Get Product By ID
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};
