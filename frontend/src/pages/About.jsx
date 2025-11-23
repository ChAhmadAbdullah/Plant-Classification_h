import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  const { t, isUrdu } = useLanguage();

  const features = [
    {
      icon: "bi-robot",
      title: t("aiPowered"),
      description: t("aiPoweredDescription"),
    },
    {
      icon: "bi-translate",
      title: t("bilingualSupport"),
      description: t("bilingualSupportDescription"),
    },
    {
      icon: "bi-camera",
      title: t("imageAnalysis"),
      description: t("imageAnalysisDescription"),
    },
    {
      icon: "bi-mic",
      title: t("voiceProcessing"),
      description: t("voiceProcessingDescription"),
    },
    {
      icon: "bi-whatsapp",
      title: t("whatsappIntegration"),
      description: t("whatsappIntegrationDescription"),
    },
    {
      icon: "bi-phone",
      title: t("mobileFriendly"),
      description: t("mobileFriendlyDescription"),
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: t("step1Title"),
      description: t("step1Description"),
      icon: "bi-chat",
    },
    {
      step: 2,
      title: t("step2Title"),
      description: t("step2Description"),
      icon: "bi-cloud-upload",
    },
    {
      step: 3,
      title: t("step3Title"),
      description: t("step3Description"),
      icon: "bi-robot",
    },
    {
      step: 4,
      title: t("step4Title"),
      description: t("step4Description"),
      icon: "bi-lightbulb",
    },
  ];

  return (
    <div
      className={`min-h-screen bg-gray-50 py-8 ${isUrdu ? "urdu-layout" : ""}`}
    >
      <div className="container">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t("aboutAgriGPT")}
              </h1>
              <p className="text-gray-600">{t("aboutDescription")}</p>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Mission Section */}
        <section className="card p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t("ourMission")}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t("missionDescription")}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("farmersHelped")}
                  </div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-600">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("queriesAnswered")}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">
                    {t("supportAvailable")}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <i className="bi bi-flower1 text-8xl text-white"></i>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("keyFeatures")}
            </h2>
            <p className="text-lg text-gray-600">{t("featuresOverview")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i
                    className={`${feature.icon} text-3xl text-primary-500`}
                  ></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("howItWorks")}
            </h2>
            <p className="text-lg text-gray-600">
              {t("howItWorksDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="card p-6 text-center">
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <i className={`${step.icon} text-3xl text-primary-500`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="card p-8 md:p-12 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t("getInTouch")}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t("contactDescription")}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <i className="bi bi-envelope text-2xl text-primary-500"></i>
                  <div>
                    <strong className="text-gray-900 block">
                      {t("email")}
                    </strong>
                    <span className="text-gray-600">
                      shahshahzaibkazmi@gmail.com
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="bi bi-telephone text-2xl text-primary-500"></i>
                  <div>
                    <strong className="text-gray-900 block">
                      {t("phone")}
                    </strong>
                    <span className="text-gray-600">+92 3217391140</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="bi bi-whatsapp text-2xl text-green-500"></i>
                  <div>
                    <strong className="text-gray-900 block">WhatsApp</strong>
                    <span className="text-gray-600">+92 3217391140</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/chat")}
              >
                <i className="bi bi-chat"></i>
                {t("startChat")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
