import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(customer?.role)) {
    return (
      <Navigate
        to={customer?.role === "ADMIN" ? "/admin" : "/products"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
