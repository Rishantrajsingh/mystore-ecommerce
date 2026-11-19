import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const customer = JSON.parse(localStorage.getItem("customer") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");
    navigate("/login");
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/products"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>

            <span className="text-2xl font-bold text-slate-900">
              My<span className="text-blue-600">Store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>

            <NavLink to="/cart" className={navLinkClass}>
              Cart
            </NavLink>

            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          </div>

          {/* Customer and Logout */}
          <div className="hidden md:flex items-center gap-4">
            {customer?.name && (
              <button
                onClick={handleProfileClick}
                className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
              >
                Hi,{" "}
                <span className="font-semibold text-slate-900 hover:text-blue-600">
                  {customer.name}
                </span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-2">
            <NavLink
              to="/products"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Products
            </NavLink>

            <NavLink
              to="/cart"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Cart
            </NavLink>

            <NavLink
              to="/orders"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              My Orders
            </NavLink>

            {customer?.name && (
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                Welcome,{" "}
                <span className="font-semibold text-slate-900">
                  {customer.name}
                </span>
                <span className="block text-xs text-blue-600 mt-1">
                  View Profile →
                </span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
