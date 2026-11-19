import { useEffect, useState } from "react";
import {
  searchProducts,
  getProductsByCategory,
  getProductsByPriceRange,
  getProductsByPage,
  getProductsPageSorted,
} from "../api/productApi";
import { addToCart } from "../api/cartApi";

function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(null);

  const [searchName, setSearchName] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryActive, setIsCategoryActive] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isPriceActive, setIsPriceActive] = useState(false);

  const [sortDirection, setSortDirection] = useState("");
  const [isSortActive, setIsSortActive] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 10;

  useEffect(() => {
    fetchProducts(0);
  }, []);

  const resetActiveFilters = () => {
    setIsSearchActive(false);
    setIsCategoryActive(false);
    setIsPriceActive(false);
    setIsSortActive(false);
    setSortDirection("");
  };

  const fetchProducts = async (page) => {
    try {
      const data = await getProductsByPage(page, pageSize);

      setProducts(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);

      resetActiveFilters();
    } catch (error) {
      console.error("Fetch Products Error:", error);
      setMessage("Unable to load products.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Pagination with or without sorting
  const handlePageChange = async (page) => {
    setMessage("");
    setSearchLoading(true);

    try {
      let data;

      if (isSortActive && sortDirection) {
        data = await getProductsPageSorted(page, pageSize, sortDirection);
      } else {
        data = await getProductsByPage(page, pageSize);
      }

      setProducts(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Pagination Error:", error);
      setMessage("Unable to load products.");
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Search Products
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchName.trim()) {
      setMessage("Please enter a product name.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setSearchLoading(true);

    try {
      const data = await searchProducts(searchName.trim());

      setProducts(data);
      setIsSearchActive(true);
      setIsCategoryActive(false);
      setIsPriceActive(false);
      setIsSortActive(false);
      setSortDirection("");

      setSelectedCategory("");
      setMinPrice("");
      setMaxPrice("");
    } catch (error) {
      console.error("Search Products Error:", error);
      setMessage(error.response?.data?.message || "Unable to search products.");
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Category Filter
  const handleCategoryFilter = async () => {
    if (!selectedCategory) {
      setMessage("Please select a category.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setSearchLoading(true);

    try {
      const data = await getProductsByCategory(selectedCategory);

      setProducts(data);
      setIsCategoryActive(true);
      setIsSearchActive(false);
      setIsPriceActive(false);
      setIsSortActive(false);
      setSortDirection("");

      setSearchName("");
      setMinPrice("");
      setMaxPrice("");
    } catch (error) {
      console.error("Category Filter Error:", error);
      setMessage(error.response?.data?.message || "Unable to filter products.");
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Price Range Filter
  const handlePriceFilter = async () => {
    if (minPrice === "" || maxPrice === "") {
      setMessage("Please enter both minimum and maximum prices.");
      setMessageType("error");
      return;
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setMessage("Please enter valid prices.");
      setMessageType("error");
      return;
    }

    if (min < 0 || max < 0) {
      setMessage("Price cannot be negative.");
      setMessageType("error");
      return;
    }

    if (min > max) {
      setMessage("Minimum price cannot be greater than maximum price.");
      setMessageType("error");
      return;
    }

    setMessage("");
    setSearchLoading(true);

    try {
      const data = await getProductsByPriceRange(min, max);

      setProducts(data);
      setIsPriceActive(true);
      setIsSearchActive(false);
      setIsCategoryActive(false);
      setIsSortActive(false);
      setSortDirection("");

      setSearchName("");
      setSelectedCategory("");
    } catch (error) {
      console.error("Price Filter Error:", error);
      setMessage(
        error.response?.data?.message || "Unable to filter products by price.",
      );
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Sorting with Pagination
  const handleSort = async (direction) => {
    setMessage("");
    setSearchLoading(true);

    try {
      const data = await getProductsPageSorted(0, pageSize, direction);

      setProducts(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);

      setSortDirection(direction);
      setIsSortActive(true);

      setIsSearchActive(false);
      setIsCategoryActive(false);
      setIsPriceActive(false);

      setSearchName("");
      setSelectedCategory("");
      setMinPrice("");
      setMaxPrice("");
    } catch (error) {
      console.error("Sort Products Error:", error);
      setMessage(error.response?.data?.message || "Unable to sort products.");
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear Filters
  const handleClearFilters = async () => {
    setSearchName("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortDirection("");
    setMessage("");
    setSearchLoading(true);

    try {
      const data = await getProductsByPage(0, pageSize);

      setProducts(data.content);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);

      resetActiveFilters();
    } catch (error) {
      console.error("Fetch Products Error:", error);
      setMessage("Unable to load products.");
      setMessageType("error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async (productId) => {
    setMessage("");
    setAddingProduct(productId);

    try {
      await addToCart(productId, 1);
      setMessage("Product added to cart successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Add to Cart Error:", error);
      setMessage(
        error.response?.data?.message || "Unable to add product to cart.",
      );
      setMessageType("error");
    } finally {
      setAddingProduct(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-500">
          Loading products...
        </p>
      </div>
    );
  }

  const hasActiveFilter =
    isSearchActive || isCategoryActive || isPriceActive || isSortActive;

  // Sorting should still show pagination.
  const showPagination =
    !isSearchActive && !isCategoryActive && !isPriceActive && totalPages > 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Discover our collection
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Our Products
          </h1>

          <p className="text-slate-500 mt-3">
            Explore our collection and find something you love.
          </p>
        </div>

        {/* Search Products */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 mb-5"
        >
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search products by name..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={searchLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            Search
          </button>
        </form>

        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Mobile">Mobile</option>
            <option value="Laptop">Laptop</option>
          </select>

          <button
            onClick={handleCategoryFilter}
            disabled={searchLoading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:bg-slate-400"
          >
            Filter Category
          </button>
        </div>

        {/* Price Range Filter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Filter by Price Range
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Minimum Price (₹)"
              className="px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Maximum Price (₹)"
              className="px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handlePriceFilter}
              disabled={searchLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:bg-slate-400"
            >
              Filter Price
            </button>
          </div>
        </div>

        {/* Sort Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Sort by Price (with Pagination)
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleSort("asc")}
              disabled={searchLoading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition disabled:bg-slate-400 ${
                sortDirection === "asc"
                  ? "bg-green-700 text-white"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Price: Low to High
            </button>

            <button
              onClick={() => handleSort("desc")}
              disabled={searchLoading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition disabled:bg-slate-400 ${
                sortDirection === "desc"
                  ? "bg-orange-700 text-white"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              Price: High to Low
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilter && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={searchLoading}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition disabled:opacity-50"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Product Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 font-medium">
            {isSearchActive
              ? "Search Results"
              : isCategoryActive
                ? "Category Results"
                : isPriceActive
                  ? "Price Filter Results"
                  : isSortActive
                    ? sortDirection === "asc"
                      ? "Price: Low to High"
                      : "Price: High to Low"
                    : "Showing All Products"}
            - {products.length}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Products */}
        {searchLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-5xl mb-4">📦</p>

            <h2 className="text-xl font-semibold text-slate-800">
              {hasActiveFilter
                ? "No matching products found"
                : "No products available"}
            </h2>

            <p className="text-slate-500 mt-2">
              {hasActiveFilter
                ? "Try another search or filter."
                : "Please check back later."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                      📦
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {product.category}
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                      {product.stock > 0
                        ? `${product.stock} units available`
                        : "Currently unavailable"}
                    </p>

                    <div className="mt-5 mb-4">
                      <p className="text-xs text-slate-400 font-medium">
                        PRICE
                      </p>

                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={
                        product.stock <= 0 || addingProduct === product.id
                      }
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                      {addingProduct === product.id
                        ? "Adding..."
                        : product.stock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || searchLoading}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <p className="text-slate-700 font-semibold">
                  Page {currentPage + 1} of {totalPages}
                </p>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || searchLoading}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
