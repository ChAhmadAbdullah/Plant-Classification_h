import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import LanguageSelector from "../components/common/LanguageSelector";

const Signup = () => {
  const { t, isUrdu } = useLanguage();
  const { requestOTP, verifyOTP, signup, isLoading } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Register
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError(t("allFieldsRequired"));
      return;
    }

    const result = await requestOTP(formData.email);
    
    if (result.success) {
      setOtpSent(true);
      setStep(2);
      setCountdown(120); // 2 minutes
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // If OTP is returned in response (development mode), show it
      if (result.otp) {
        console.log('📧 OTP (Development Mode):', result.otp);
        info(`Development Mode: OTP is ${result.otp}`);
      } else {
        success(t("otpSentSuccessfully") || "OTP sent to your email!");
      }
    } else {
      const errorMsg = result.error;
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.otp || formData.otp.length !== 6) {
      setError(t("enterValidOTP"));
      return;
    }

    const result = await verifyOTP(formData.email, formData.otp);
    
    if (result.success) {
      setOtpVerified(true);
      setStep(3);
      success(t("otpVerifiedSuccessfully") || "OTP verified successfully!");
    } else {
      const errorMsg = result.error;
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.password || !formData.confirmPassword) {
      setError(t("allFieldsRequired"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    const language = isUrdu ? 'urdu' : 'english';
    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      language
    );

    if (result.success) {
      success(t("accountCreatedSuccessfully") || "Account created successfully!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } else {
      const errorMsg = result.error || t("signupFailed");
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isUrdu ? "urdu-layout" : ""}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="bi bi-flower1 text-3xl text-white"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("signUp")}</h2>
          <p className="text-gray-600">{t("signupDescription")}</p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 1 ? <i className="bi bi-check"></i> : '1'}
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 2 ? <i className="bi bi-check"></i> : '2'}
          </div>
          <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>

        {/* Signup Form */}
        <div className="card p-8">
          {error && (
            <div className="alert alert-error mb-6">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder={t("enterEmail")}
                    dir="ltr"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("sendingOTP")}</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope-check"></i>
                    <span>{t("sendOTP")}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t("otpSentTo")} {formData.email}
                </p>
                {countdown > 0 && (
                  <p className="text-sm font-semibold text-primary-600">
                    {t("otpExpiresIn")}: {formatTime(countdown)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("enterOTP")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-shield-check text-gray-400"></i>
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className="input-field pl-10 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    dir="ltr"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">{t("otpValidFor2Minutes")}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpSent(false);
                    setFormData({ ...formData, otp: "" });
                  }}
                  className="btn btn-outline-primary flex-1"
                >
                  {t("back")}
                </button>
                <button type="submit" disabled={isLoading || countdown === 0} className="btn btn-primary flex-1">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("verifying")}</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle"></i>
                      <span>{t("verifyOTP")}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={countdown > 0}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400"
                >
                  {t("resendOTP")}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Registration */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("fullName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-person text-gray-400"></i>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder={t("enterFullName")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">{t("passwordRequirements")}</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-lock-fill text-gray-400"></i>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder={t("confirmPassword")}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-outline-primary flex-1"
                >
                  {t("back")}
                </button>
                <button type="submit" disabled={isLoading} className="btn btn-primary flex-1">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("creatingAccount")}</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus"></i>
                      <span>{t("signUp")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
