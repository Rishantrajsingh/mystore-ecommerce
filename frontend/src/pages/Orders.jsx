import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, cancelMyOrder } from "../api/orderApi";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setCancellingOrder(orderId);
      setMessage("");
      setError("");

      await cancelMyOrder(orderId);

      setMessage("Order cancelled successfully!");

      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-green-100 text-green-700";

      case "SHIPPED":
        return "bg-blue-100 text-blue-700";

      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Separate Active Orders and Order History
  const activeOrders = orders.filter(
    (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
  );

  const orderHistory = orders.filter(
    (order) => order.status === "DELIVERED" || order.status === "CANCELLED",
  );

  const displayedOrders = activeTab === "active" ? activeOrders : orderHistory;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-lg font-medium text-slate-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Your purchases
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            My Orders
          </h1>

          <p className="text-slate-500 mt-3">
            Track your active orders and view your order history.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Order Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              activeTab === "active"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Active Orders
            <span className="ml-2">({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Order History
            <span className="ml-2">({orderHistory.length})</span>
          </button>
        </div>

        {/* Empty State */}
        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
            <div className="text-6xl mb-5">
              {activeTab === "active" ? "📦" : "📋"}
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === "active" ? "No active orders" : "No order history"}
            </h2>

            <p className="text-slate-500 mt-3 mb-8">
              {activeTab === "active"
                ? "You don't have any active orders right now."
                : "Your delivered and cancelled orders will appear here."}
            </p>

            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section Heading */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === "active" ? "Active Orders" : "Order History"}
              </h2>

              <span className="text-sm text-slate-500">
                {displayedOrders.length}{" "}
                {displayedOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {/* Order Cards */}
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Order ID
                      </p>

                      <h3 className="font-bold text-slate-800 break-all">
                        #{order.id}
                      </h3>

                      <p className="text-sm text-slate-500 mt-2">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5 sm:p-6">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-5">
                    Order Items
                  </h4>

                  <div className="space-y-5">
                    {order.items?.map((item, index) => (
                      <div
                        key={item.productId || index}
                        className="flex items-center gap-4"
                      >
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-3xl">📦</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-slate-800 truncate">
                            {item.productName}
                          </h5>

                          <p className="text-sm text-slate-500 mt-1">
                            ₹{formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900">
                            ₹{formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="border-t border-slate-200 p-5 sm:p-6 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <p className="text-sm text-slate-500">Total Amount</p>

                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        ₹{formatPrice(order.totalAmount)}
                      </p>
                    </div>

                    {order.status === "PLACED" && activeTab === "active" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder !== null}
                        className="bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingOrder === order.id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
