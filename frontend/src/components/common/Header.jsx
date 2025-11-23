import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const { t, isUrdu } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const navItems = [
    { path: "/", label: "home", icon: "bi-house" },
    { path: "/chat", label: "chat", icon: "bi-chat" },
    { path: "/history", label: "history", icon: "bi-clock" },
    { path: "/about", label: "about", icon: "bi-info-circle" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <nav className="container">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="bi bi-flower1 text-2xl text-white"></i>
            </div>
            <span className="text-xl font-bold text-gradient">
              {t("appName")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(item.path)
                    ? "bg-primary-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className={item.icon}></i>
                <span>{t(item.label)}</span>
              </button>
            ))}
            <div className="ml-4 flex items-center gap-2">
              <LanguageSelector />
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <i className="bi bi-person text-white text-sm"></i>
                    </div>
                    <span className="hidden lg:block text-sm font-medium">
                      {user?.name || user?.email}
                    </span>
                    <i className="bi bi-chevron-down text-xs"></i>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {t("login")}
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="btn btn-primary btn-sm"
                  >
                    {t("signUp")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <i className="bi bi-person text-white text-sm"></i>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="btn btn-primary btn-sm"
                >
                  {t("signUp")}
                </button>
              </>
            )}
            <LanguageSelector />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation"
            >
              <i
                className={`bi text-2xl ${isMenuOpen ? "bi-x" : "bi-list"}`}
              ></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-left ${
                    isActive(item.path)
                      ? "bg-primary-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <i className={item.icon}></i>
                  <span>{t(item.label)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
