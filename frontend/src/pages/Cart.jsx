import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCart, updateCartQuantity, removeFromCart } from "../api/cartApi";

import { getAllProducts } from "../api/productApi";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const [cartData, productsData] = await Promise.all([
        getMyCart(),
        getAllProducts(),
      ]);

      const items = cartData.items || [];

      const detailedItems = items.map((item) => {
        const product = productsData.find(
          (product) => String(product.id) === String(item.productId),
        );

        return {
          ...item,
          product,
        };
      });

      setCartItems(detailedItems);
    } catch (error) {
      console.error("Fetch Cart Error:", error);
      setMessage("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setUpdatingItem(productId);
      setMessage("");

      await updateCartQuantity(productId, quantity);
      await fetchCart();

      setMessage("Cart updated successfully!");
    } catch (error) {
      console.error("Update Cart Error:", error);

      setMessage(error.response?.data?.message || "Unable to update quantity.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingItem(productId);
      setMessage("");

      await removeFromCart(productId);
      await fetchCart();

      setMessage("Product removed from cart!");
    } catch (error) {
      console.error("Remove Cart Error:", error);

      setMessage(error.response?.data?.message || "Unable to remove product.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-500">
          Loading your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Your shopping bag
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            My Shopping Cart
          </h1>

          <p className="text-slate-500 mt-3">
            Review your items before placing your order.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
            <div className="text-6xl mb-5">🛒</div>

            <h2 className="text-2xl font-bold text-slate-800">
              Your cart is empty
            </h2>

            <p className="text-slate-500 mt-3 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Cart Items</h2>

                <span className="text-sm text-slate-500">
                  {totalItems} items
                </span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Product Icon */}
                    <div className="w-full sm:w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-5xl">📦</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        {item.product?.name || "Product unavailable"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {item.product?.category || "Product"}
                      </p>

                      <p className="text-lg font-bold text-blue-600 mt-3">
                        ₹{formatPrice(item.product?.price)}
                      </p>
                    </div>

                    {/* Quantity and Subtotal */}
                    <div className="sm:text-right">
                      <p className="text-xs font-semibold text-slate-400 mb-2">
                        QUANTITY
                      </p>

                      <div className="flex items-center gap-3 sm:justify-end">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity - 1,
                            )
                          }
                          disabled={
                            item.quantity <= 1 ||
                            updatingItem === item.productId
                          }
                          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors"
                        >
                          -
                        </button>

                        <span className="font-bold text-slate-800 min-w-5 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.quantity + 1,
                            )
                          }
                          disabled={updatingItem === item.productId}
                          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 mt-4">SUBTOTAL</p>

                      <p className="text-lg font-bold text-slate-900 mt-1">
                        ₹
                        {formatPrice(
                          (item.product?.price || 0) * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="border-t border-slate-100 mt-5 pt-4 flex justify-end">
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={updatingItem === item.productId}
                      className="text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                      {updatingItem === item.productId
                        ? "Please wait..."
                        : "Remove Item"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-28">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Order Summary
                </h2>

                <div className="flex justify-between text-slate-600 mb-4">
                  <span>Total Items</span>
                  <span className="font-semibold text-slate-900">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 mb-4">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{formatPrice(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 mb-5">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      Total Amount
                    </span>

                    <span className="text-2xl font-bold text-blue-600">
                      ₹{formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-7 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Proceed to Checkout →
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="w-full mt-3 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Continue Shopping
                </button>

                <p className="text-xs text-center text-slate-400 mt-5">
                  Secure checkout powered by MyStore
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
