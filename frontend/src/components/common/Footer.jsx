import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "home", path: "/" },
    { label: "chat", path: "/chat" },
    { label: "upload", path: "/upload" },
    { label: "about", path: "/about" },
  ];

  const features = ["textChat", "imageAnalysis", "voiceNotes"];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <i className="bi bi-flower1 text-xl text-white"></i>
              </div>
              <div>
                <h5 className="font-bold text-gray-900">{t("appName")}</h5>
                <p className="text-sm text-gray-600">{t("tagline")}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{t("aboutDescription")}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <i className="bi bi-envelope"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="font-semibold text-gray-900 mb-4">
              {t("navigation")}
            </h6>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h6 className="font-semibold text-gray-900 mb-4">
              {t("features")}
            </h6>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <i className="bi bi-check-circle text-primary-500"></i>
                  {t(feature)}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h6 className="font-semibold text-gray-900 mb-4">{t("contact")}</h6>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="bi bi-telephone text-primary-500"></i>
                <span>+92 3217391140</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="bi bi-envelope text-primary-500"></i>
                <span>shahshahzaibkazmi@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="bi bi-geo-alt text-primary-500"></i>
                <span>Khushab, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} {t("appName")}. {t("allRightsReserved")}
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t("privacyPolicy")}
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t("termsOfService")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
