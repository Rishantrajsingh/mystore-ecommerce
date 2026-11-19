import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  getLowStockProducts,
  restockProduct,
} from "../api/productApi";

import {
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
} from "../api/customerApi";

import { getAllOrders, updateOrderStatus } from "../api/orderApi";

function AdminDashboard() {
  const navigate = useNavigate();

  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  // Add Product State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Manage Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState("");

  // Low Stock Products State
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);
  const [stockThreshold, setStockThreshold] = useState(5);

  // Restock Product State
  const [restockQuantities, setRestockQuantities] = useState({});
  const [restockLoadingId, setRestockLoadingId] = useState("");

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // View Product Details State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailsLoading, setProductDetailsLoading] = useState(false);

  // Dashboard Statistics State
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Manage Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  // Manage Customers State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState("");

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const data = await getAllProducts();

      setProducts(data);
    } catch (error) {
      console.error("Fetch Products Error:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Low Stock Products
  const fetchLowStockProducts = async (threshold = stockThreshold) => {
    try {
      setLowStockLoading(true);

      const data = await getLowStockProducts(threshold);

      setLowStockProducts(data);
    } catch (error) {
      console.error("Fetch Low Stock Products Error:", error);
    } finally {
      setLowStockLoading(false);
    }
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      const [customers, orders] = await Promise.all([
        getAllCustomers(),
        getAllOrders(),
      ]);

      const totalRevenue = orders
        .filter((order) => String(order.status).toUpperCase() !== "CANCELLED")
        .reduce((total, order) => total + Number(order.totalAmount || 0), 0);

      setStats({
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalRevenue,
      });
    } catch (error) {
      console.error("Dashboard Statistics Error:", error);
      setStatsError("Unable to load dashboard statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch All Orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      const data = await getAllOrders();

      setOrders(data);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch All Customers
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);

      const data = await getAllCustomers();

      setCustomers(data);
    } catch (error) {
      console.error("Fetch Customers Error:", error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // View Customer Details
  const handleViewCustomerDetails = async (id) => {
    try {
      setCustomerDetailsLoading(true);
      setSelectedCustomer(null);

      const data = await getCustomerById(id);

      setSelectedCustomer(data);
    } catch (error) {
      console.error("Get Customer By ID Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to fetch customer details. Please try again.",
      );
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeletingCustomerId(id);

      await deleteCustomer(id);

      setCustomers((previousCustomers) =>
        previousCustomers.filter((customer) => customer.id !== id),
      );

      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }

      await fetchDashboardStats();
    } catch (error) {
      console.error("Delete Customer Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete customer. Please try again.",
      );
    } finally {
      setDeletingCustomerId("");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts(5);
    fetchDashboardStats();
    fetchOrders();
    fetchCustomers();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login");
  };

  // Add Product Form Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        stock: Number(formData.stock),
      };

      await addProduct(productData);

      setMessage("Product added successfully!");
      setMessageType("success");

      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "",
      });

      await Promise.all([fetchProducts(), fetchLowStockProducts()]);
    } catch (error) {
      console.error("Add Product Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to add product. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await deleteProduct(id);

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== id),
      );

      setLowStockProducts((previousProducts) =>
        previousProducts.filter((product) => product.id !== id),
      );

      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }

      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Delete Product Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete product. Please try again.",
      );
    } finally {
      setDeleteLoading("");
    }
  };

  // View Product Details
  const handleViewDetails = async (id) => {
    try {
      setProductDetailsLoading(true);
      setSelectedProduct(null);

      const data = await getProductById(id);

      setSelectedProduct(data);
    } catch (error) {
      console.error("Get Product By ID Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to fetch product details. Please try again.",
      );
    } finally {
      setProductDetailsLoading(false);
    }
  };

  // Open Edit Form
  const handleEdit = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
  };

  // Edit Form Change
  const handleEditChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name]: e.target.value,
    });
  };

  // Update Product
  const handleUpdate = async (e) => {
    e.preventDefault();

    setEditLoading(true);

    try {
      const productData = {
        name: editingProduct.name.trim(),
        price: Number(editingProduct.price),
        category: editingProduct.category.trim(),
        stock: Number(editingProduct.stock),
      };

      await updateProduct(editingProduct.id, productData);

      setEditingProduct(null);

      await Promise.all([fetchProducts(), fetchLowStockProducts()]);

      alert("Product updated successfully!");
    } catch (error) {
      console.error("Update Product Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update product. Please try again.",
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Restock Quantity Change
  const handleRestockQuantityChange = (id, value) => {
    setRestockQuantities((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  // Restock Product
  const handleRestock = async (id) => {
    const quantity = Number(restockQuantities[id]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Please enter a valid positive whole number.");
      return;
    }

    try {
      setRestockLoadingId(id);

      await restockProduct(id, quantity);

      setRestockQuantities((previous) => ({
        ...previous,
        [id]: "",
      }));

      await Promise.all([fetchProducts(), fetchLowStockProducts()]);

      alert("Product restocked successfully!");
    } catch (error) {
      console.error("Restock Product Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to restock product. Please try again.",
      );
    } finally {
      setRestockLoadingId("");
    }
  };

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);

      await updateOrderStatus(orderId, status);

      await fetchOrders();
      await fetchDashboardStats();

      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Update Order Status Error:", error);

      alert(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  // Format Revenue
  const formatRevenue = (amount) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            My<span className="text-blue-600">Store</span>
            <span className="text-sm text-slate-500 ml-2">Admin Panel</span>
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-5 py-2 rounded-lg font-semibold hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Dashboard Welcome */}
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome, {customer?.name || "Admin"}!
        </h2>

        <p className="text-slate-500 mt-2">Manage your store from one place.</p>

        {/* Dashboard Statistics */}
        <div className="flex flex-wrap justify-between items-center mt-10 mb-5 gap-3">
          <h3 className="text-xl font-bold text-slate-900">Store Overview</h3>

          <button
            onClick={fetchDashboardStats}
            disabled={statsLoading}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            {statsLoading ? "Refreshing..." : "Refresh Stats"}
          </button>
        </div>

        {statsError && (
          <p className="text-red-600 text-sm mb-4">{statsError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-3">
              {productsLoading ? "..." : products.length}
            </h3>
            <p className="text-sm text-blue-600 mt-2">Products in store</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Total Customers
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-3">
              {statsLoading ? "..." : stats.totalCustomers}
            </h3>
            <p className="text-sm text-green-600 mt-2">Registered customers</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Orders</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-3">
              {statsLoading ? "..." : stats.totalOrders}
            </h3>
            <p className="text-sm text-purple-600 mt-2">All store orders</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-3 break-words">
              {statsLoading ? "..." : formatRevenue(stats.totalRevenue)}
            </h3>
            <p className="text-sm text-emerald-600 mt-2">
              Excluding cancelled orders
            </p>
          </div>
        </div>

        {/* Add Product Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-10 max-w-2xl">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Add New Product
          </h3>

          <p className="text-sm text-slate-500 mb-6">
            Enter product details to add it to your store.
          </p>

          {message && (
            <div
              className={`mb-5 p-4 rounded-xl text-sm font-medium ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0.01"
                step="0.01"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Example: Electronics"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                min="0"
                step="1"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>

        {/* Manage Products Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Manage Products
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                View, edit, delete and restock your store products.
              </p>
            </div>

            <button
              onClick={fetchProducts}
              disabled={productsLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Edit Product Form */}
          {editingProduct && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-5">
                Edit Product
              </h3>

              <form
                onSubmit={handleUpdate}
                className="grid sm:grid-cols-2 gap-4"
              >
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditChange}
                  placeholder="Product Name"
                  required
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />

                <input
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleEditChange}
                  placeholder="Price"
                  min="0.01"
                  step="0.01"
                  required
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />

                <input
                  type="text"
                  name="category"
                  value={editingProduct.category}
                  onChange={handleEditChange}
                  placeholder="Category"
                  required
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />

                <input
                  type="number"
                  name="stock"
                  value={editingProduct.stock}
                  onChange={handleEditChange}
                  placeholder="Stock"
                  min="0"
                  step="1"
                  required
                  className="border border-slate-300 rounded-lg px-4 py-3"
                />

                <div className="sm:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? "Updating..." : "Update Product"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Loading */}
          {productsLoading ? (
            <p className="text-center py-10 text-slate-500">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center py-10 text-slate-500">
              No products found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="py-4 px-3">Product</th>
                    <th className="py-4 px-3">Category</th>
                    <th className="py-4 px-3">Price</th>
                    <th className="py-4 px-3">Stock</th>
                    <th className="py-4 px-3">Restock Quantity</th>
                    <th className="py-4 px-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="py-4 px-3 font-semibold text-slate-800">
                        {product.name}
                      </td>

                      <td className="py-4 px-3 text-slate-600">
                        {product.category}
                      </td>

                      <td className="py-4 px-3 text-slate-600">
                        ₹{product.price}
                      </td>

                      <td className="py-4 px-3 text-slate-600">
                        {product.stock}
                      </td>

                      <td className="py-4 px-3">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={restockQuantities[product.id] ?? ""}
                          onChange={(e) =>
                            handleRestockQuantityChange(
                              product.id,
                              e.target.value,
                            )
                          }
                          placeholder="Quantity"
                          className="w-28 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                        />

                        <button
                          onClick={() => handleRestock(product.id)}
                          disabled={restockLoadingId === product.id}
                          className="ml-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg font-semibold hover:bg-green-100 disabled:opacity-50"
                        >
                          {restockLoadingId === product.id
                            ? "Restocking..."
                            : "Restock"}
                        </button>
                      </td>

                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewDetails(product.id)}
                            disabled={productDetailsLoading}
                            className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 disabled:opacity-50"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleEdit(product)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteLoading === product.id}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 disabled:opacity-50"
                          >
                            {deleteLoading === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Product Details Modal */}
        {(productDetailsLoading || selectedProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Product Details
                </h3>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductDetailsLoading(false);
                  }}
                  className="text-slate-500 hover:text-red-600 text-2xl font-bold"
                  aria-label="Close product details"
                >
                  &times;
                </button>
              </div>

              {productDetailsLoading ? (
                <p className="text-center py-10 text-slate-500">
                  Loading product details...
                </p>
              ) : selectedProduct ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Product ID</p>
                    <p className="font-semibold text-slate-800 break-all">
                      {selectedProduct.id}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Product Name</p>
                    <p className="font-semibold text-slate-800">
                      {selectedProduct.name}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Category</p>
                    <p className="font-semibold text-slate-800">
                      {selectedProduct.category}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="font-semibold text-slate-800">
                      ₹{selectedProduct.price}
                    </p>
                  </div>

                  <div className="pb-2">
                    <p className="text-sm text-slate-500">Available Stock</p>
                    <p className="font-semibold text-slate-800">
                      {selectedProduct.stock}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Low Stock Products Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Low Stock Products
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Products with stock equal to or below the selected limit.
              </p>
            </div>

            <button
              onClick={() => fetchLowStockProducts()}
              disabled={lowStockLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              {lowStockLoading ? "Refreshing..." : "Refresh Low Stock"}
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stockThreshold}
                onChange={(e) => setStockThreshold(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 w-36 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => fetchLowStockProducts(Number(stockThreshold))}
              disabled={lowStockLoading || stockThreshold === ""}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Apply Filter
            </button>
          </div>

          {lowStockLoading ? (
            <p className="text-center py-8 text-slate-500">
              Loading low stock products...
            </p>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-center py-8 text-green-600 font-medium">
              No low stock products found.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Found {lowStockProducts.length} low stock product(s).
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                      <th className="py-4 px-3">Product</th>
                      <th className="py-4 px-3">Category</th>
                      <th className="py-4 px-3">Price</th>
                      <th className="py-4 px-3">Available Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 px-3 font-semibold text-slate-800">
                          {product.name}
                        </td>
                        <td className="py-4 px-3 text-slate-600">
                          {product.category}
                        </td>
                        <td className="py-4 px-3 text-slate-600">
                          ₹{product.price}
                        </td>
                        <td className="py-4 px-3">
                          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                            {product.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Manage Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Manage Orders
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                View all customer orders and update their status.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={ordersLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              {ordersLoading ? "Refreshing..." : "Refresh Orders"}
            </button>
          </div>

          {ordersLoading ? (
            <p className="text-center py-10 text-slate-500">
              Loading orders...
            </p>
          ) : orders.length === 0 ? (
            <p className="text-center py-10 text-slate-500">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="py-4 px-3">Order ID</th>
                    <th className="py-4 px-3">Customer ID</th>
                    <th className="py-4 px-3">Amount</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Update Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-4 px-3 text-sm font-medium text-slate-800">
                        {order.id}
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-600">
                        {order.customerId}
                      </td>
                      <td className="py-4 px-3 text-sm font-semibold text-slate-800">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <select
                          value={order.status}
                          disabled={
                            updatingOrderId === order.id ||
                            order.status === "CANCELLED" ||
                            order.status === "DELIVERED"
                          }
                          onChange={(e) =>
                            handleOrderStatusUpdate(order.id, e.target.value)
                          }
                          className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                        </select>

                        {updatingOrderId === order.id && (
                          <p className="text-xs text-blue-600 mt-1">
                            Updating...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manage Customers Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-10">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Manage Customers
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                View all registered customers.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={customersLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              {customersLoading ? "Refreshing..." : "Refresh Customers"}
            </button>
          </div>

          {customersLoading ? (
            <p className="text-center py-10 text-slate-500">
              Loading customers...
            </p>
          ) : customers.length === 0 ? (
            <p className="text-center py-10 text-slate-500">
              No customers found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="py-4 px-3">Customer ID</th>
                    <th className="py-4 px-3">Name</th>
                    <th className="py-4 px-3">Email</th>
                    <th className="py-4 px-3">Phone</th>
                    <th className="py-4 px-3">Role</th>
                    <th className="py-4 px-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-slate-100">
                      <td className="py-4 px-3 text-sm text-slate-600">
                        {customer.id}
                      </td>
                      <td className="py-4 px-3 font-semibold text-slate-800">
                        {customer.name}
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-600">
                        {customer.email}
                      </td>
                      <td className="py-4 px-3 text-sm text-slate-600">
                        {customer.phone || "-"}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {customer.role}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleViewCustomerDetails(customer.id)
                            }
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 whitespace-nowrap"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={deletingCustomerId === customer.id}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                          >
                            {deletingCustomerId === customer.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Customer Details Modal */}
        {(customerDetailsLoading || selectedCustomer) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Customer Details
                </h3>

                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerDetailsLoading(false);
                  }}
                  className="text-slate-500 hover:text-red-600 text-2xl font-bold"
                  aria-label="Close customer details"
                >
                  &times;
                </button>
              </div>

              {customerDetailsLoading ? (
                <p className="text-center py-10 text-slate-500">
                  Loading customer details...
                </p>
              ) : selectedCustomer ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Customer ID</p>
                    <p className="font-semibold text-slate-800 break-all">
                      {selectedCustomer.id}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-semibold text-slate-800">
                      {selectedCustomer.name}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-800 break-all">
                      {selectedCustomer.email}
                    </p>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold text-slate-800">
                      {selectedCustomer.phone || "-"}
                    </p>
                  </div>

                  <div className="pb-2">
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-semibold text-slate-800">
                      {selectedCustomer.role}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
