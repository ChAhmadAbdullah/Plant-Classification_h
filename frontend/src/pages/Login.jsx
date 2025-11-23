import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import LanguageSelector from "../components/common/LanguageSelector";

const Login = () => {
  const { t, isUrdu } = useLanguage();
  const { login, isLoading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError(t("allFieldsRequired"));
      showError(t("allFieldsRequired"));
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      success(t("loginSuccessful") || "Login successful!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } else {
      const errorMsg = result.error || t("invalidCredentials");
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isUrdu ? "urdu-layout" : ""
      }`}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="bi bi-flower1 text-3xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("login")}
          </h2>
          <p className="text-gray-600">{t("loginDescription")}</p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          {error && (
            <div className="alert alert-error mb-6">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bi bi-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder={t("enterEmail")}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bi bi-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder={t("enterPassword")}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  {t("rememberMe")}
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("loggingIn")}</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>{t("login")}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("or")}</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t("signUp")}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
      </div>
    </div>
  );
};

export default Login;
