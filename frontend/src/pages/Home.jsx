import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { SAMPLE_QUESTIONS } from "../utils/constants";

const Home = () => {
  const { t, isUrdu, language } = useLanguage();

  const features = [
    { icon: "bi-chat-text", title: t("textChat"), description: t("textChatDescription"), path: "/chat", color: "primary" },
    { icon: "bi-camera", title: t("imageAnalysis"), description: t("imageAnalysisDescription"), path: "/upload", color: "success" },
    { icon: "bi-mic", title: t("voiceNotes"), description: t("voiceNotesDescription"), path: "/upload", color: "info" },
  ];

  const stats = [
    { number: "10K+", label: t("farmersHelped") },
    { number: "50K+", label: t("queriesAnswered") },
    { number: "95%", label: t("accuracyRate") },
    { number: "24/7", label: t("supportAvailable") },
  ];

  const sampleQuestions = SAMPLE_QUESTIONS[language] || SAMPLE_QUESTIONS.english;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 ${isUrdu ? "urdu-layout" : ""}`}>
      {/* Hero Section */}
      <section className="container py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient">{t("appName")}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">{t("welcome")} - {t("tagline")}</p>
            <p className="text-lg text-gray-600">{t("description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/chat" className="btn btn-primary btn-lg">
                <i className="bi bi-chat"></i>
                {t("startChat")}
              </Link>
              <Link to="/upload" className="btn btn-outline-primary btn-lg">
                <i className="bi bi-cloud-upload"></i>
                {t("uploadImage")}
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <i className="bi bi-flower1 text-6xl md:text-8xl text-white"></i>
              </div>
            </div>
            <div className="absolute top-4 right-4 md:top-8 md:right-8 card p-4 animate-float" style={{ animationDelay: "0.5s" }}>
              <i className="bi bi-robot text-2xl text-primary-500 mb-2"></i>
              <span className="text-sm font-semibold">{t("aiPowered")}</span>
            </div>
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 card p-4 animate-float" style={{ animationDelay: "1s" }}>
              <i className="bi bi-translate text-2xl text-secondary-500 mb-2"></i>
              <span className="text-sm font-semibold">{t("bilingual")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-8 border-y border-gray-200">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("features")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("featuresDescription")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const colorClasses = {
              primary: "bg-gradient-to-br from-primary-500 to-primary-600",
              success: "bg-gradient-to-br from-green-500 to-green-600",
              info: "bg-gradient-to-br from-blue-500 to-blue-600"
            };
            return (
              <Link key={index} to={feature.path} className="feature-card group">
                <div className={`w-16 h-16 ${colorClasses[feature.color] || colorClasses.primary} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow mx-auto`}>
                  <i className={`${feature.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-primary-600 font-medium group-hover:translate-x-1 transition-transform justify-center">
                  <span>Learn more</span>
                  <i className={`bi bi-arrow-right ml-2 ${isUrdu ? "rotate-180" : ""}`}></i>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sample Questions Section */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("sampleQuestions")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("sampleQuestionsDescription")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleQuestions.map((question, index) => (
              <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
                <i className="bi bi-chat-square-question text-3xl text-primary-500 mb-3"></i>
                <p className="text-gray-700 font-medium">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-20">
        <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-primary-50 to-secondary-50">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("readyToStart")}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t("ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chat" className="btn btn-primary btn-lg">
              <i className="bi bi-chat"></i>
              {t("startChatNow")}
            </Link>
            <Link to="/about" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-info-circle"></i>
              {t("learnMore")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
