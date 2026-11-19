import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkoutOrder } from "../api/orderApi";

function Checkout() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      await checkoutOrder();

      setMessage("Your order has been placed successfully!");
      setSuccess(true);

      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error("Checkout Error:", error);

      setMessage(
        error.response?.data?.message || "Unable to place your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Checkout Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-10 text-center">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-5">
              <span className="text-3xl">🛍️</span>
            </div>

            <h1 className="text-3xl font-bold text-white">Checkout</h1>

            <p className="text-blue-100 mt-2">You're just one step away!</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">
                Confirm Your Order
              </h2>

              <p className="text-slate-500 mt-2 text-sm">
                Please make sure your cart is ready before placing your order.
              </p>
            </div>

            {/* Information */}
            <div className="bg-slate-50 rounded-xl p-5 space-y-4 mb-7">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>

                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Secure Checkout
                  </p>

                  <p className="text-xs text-slate-500">
                    Your account is protected with authentication.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200"></div>

              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>

                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Order Tracking
                  </p>

                  <p className="text-xs text-slate-500">
                    View your order details in My Orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 rounded-xl p-4 text-sm font-medium ${
                  success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* Place Order */}
            {!success && (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-95 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Your Order..." : "Place Order →"}
              </button>
            )}

            {success && (
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                View My Orders
              </button>
            )}

            {/* Back to Cart */}
            {!success && (
              <button
                onClick={() => navigate("/cart")}
                disabled={loading}
                className="w-full mt-3 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                ← Back to Cart
              </button>
            )}

            <p className="text-xs text-center text-slate-400 mt-6">
              Thank you for shopping with MyStore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
