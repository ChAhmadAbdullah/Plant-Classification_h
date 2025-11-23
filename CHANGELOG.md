# 📝 Changelog

All notable changes to AgriGPT-PK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project documentation and contribution guidelines

---

## [2.0.0] - 2024-11-24

### 🚀 Major Release: ML Integration & Multi-Modal AI

This release represents a complete transformation of AgriGPT-PK into a comprehensive multi-modal AI agricultural platform.

### Added

#### ML Disease Detection System
- **ResNet50 Integration**: Custom-trained PyTorch model for 38 plant disease classes
- **Disease Prediction API**: `/api/ml/predict` endpoint with confidence thresholding
- **Quick Prediction Endpoint**: `/api/ml/predict/quick` for testing without authentication
- **ML Service Status**: `/api/ml/status` for health monitoring
- **Python Bridge**: Node.js → Python subprocess communication via `mlService.js`
- **Inference Engine**: `backend/ml_model/model.py` with PyTorch inference pipeline
- **Class Labels**: 38 disease categories covering major Pakistani crops
- **Confidence Scoring**: Top-3 predictions with probability scores
- **Disease Prediction UI**: `DiseasePrediction.jsx` with real-time image preview

#### Documentation & Developer Experience
- **Comprehensive README**: Hackathon-ready documentation with:
  - Project overview and problem statement
  - Generative AI model details (4 models)
  - Real-world impact analysis with quantified metrics
  - Architecture diagrams and data flow visualization
  - Complete API documentation with curl examples
  - Setup and installation guides
  - Reproducibility instructions
- **ARCHITECTURE.md**: Detailed system design with ASCII diagrams
- **CONTRIBUTING.md**: Contribution guidelines and coding standards
- **VSCODE_SETUP_GUIDE.md**: Step-by-step VS Code configuration
- **GIT_MERGE_GUIDE.md**: Repository merging instructions
- **INTEGRATION_SUMMARY.md**: Technical integration details
- **CHECKLIST.md**: Quick reference for setup and testing
- **FINAL_REPORT.md**: Complete project summary
- **CHANGELOG.md**: Version history tracking
- **setup.ps1**: Automated PowerShell setup script

#### Enhanced Features
- **Multi-Provider Fallback**: Audio transcription with 4 provider options (fal-ai, hf-inference, together, replicate)
- **Confidence Thresholding**: Configurable threshold (default 60%)
- **Health Status Indicators**: Color-coded visual feedback (green/yellow/red)
- **Alternative Predictions**: Display top-3 disease possibilities
- **Database Persistence**: Save ML predictions to MongoDB for authenticated users
- **Improved Error Handling**: Comprehensive error messages and troubleshooting hints

#### Developer Tools
- **Environment Template**: `.env.example` with all required variables
- **MongoDB Troubleshooting**: Enhanced connection error diagnostics
- **Debug Endpoints**: `/api/debug/ai-status` for AI service monitoring
- **Comprehensive Logging**: Detailed console output for ML predictions

### Changed

#### Backend Improvements
- **Server.js**: Enhanced MongoDB connection handling with detailed error messages
- **Database Connection**: Added reconnection logic and helpful troubleshooting tips
- **CORS Configuration**: Updated to support ML endpoints
- **Request Size Limits**: Increased to 10MB for image uploads
- **Middleware Stack**: Added comprehensive logging and error handling

#### Frontend Enhancements
- **App.jsx**: Added `/predict` route with protected authentication
- **ImageService**: Extended with ML prediction methods (`predictDisease`, `quickPredict`)
- **Navigation**: Updated Header to include disease prediction link
- **UI Polish**: Enhanced loading states and error messages

#### Code Quality
- **Consistent Logging**: Emoji-based console output for better debugging
- **Error Messages**: User-friendly error descriptions with actionable hints
- **Type Safety**: Improved parameter validation
- **Code Comments**: Comprehensive JSDoc and inline documentation

### Fixed
- **MongoDB Connection**: Resolved IPv6/IPv4 dual-stack issues
- **DNS Resolution**: Fixed MongoDB Atlas SRV connection problems
- **File Upload**: Corrected memory storage configuration for Multer
- **Environment Variables**: Proper handling of missing credentials
- **Temp File Cleanup**: Automatic deletion after ML inference
- **OTP Expiration**: UTC timezone consistency for token validation

### Security
- **Helmet.js**: HTTP header security middleware
- **Rate Limiting**: API throttling to prevent abuse
- **JWT Authentication**: Secure token-based auth for ML endpoints
- **Input Validation**: File type and size validation for uploads
- **Error Sanitization**: Production-safe error messages (no stack traces)

### Performance
- **Image Preprocessing**: Optimized resize and normalization pipeline
- **Subprocess Management**: Efficient Python process spawning
- **Memory Management**: Buffer-based file handling (no disk I/O on Node.js side)
- **Response Caching**: Foundation for future Redis integration
- **Database Indexing**: Optimized queries for chat history

### Documentation
- **API Examples**: Curl commands for all ML endpoints
- **Architecture Diagrams**: Visual system design documentation
- **Setup Guides**: Platform-specific installation instructions
- **Troubleshooting**: Common issues and solutions
- **Model Training**: Reproducibility instructions for researchers

---

## [1.0.0] - 2024-10-15

### 🎉 Initial Release

#### Core Features
- **Agricultural Chat System**: Real-time chat interface with AI-powered responses
- **User Authentication**: JWT-based login/signup with OTP verification
- **Image Analysis**: Hugging Face ViT-based image captioning
- **Voice Processing**: Whisper-based audio transcription
- **Multilingual Support**: English, Urdu, and Hindi UI
- **Chat History**: MongoDB-based conversation persistence

#### AI Integration
- **DialoGPT-medium**: Conversational AI for farming advice
- **Whisper-large-v3**: Speech-to-text transcription
- **ViT-base-patch16-224**: Image captioning and analysis
- **Hugging Face API**: Primary AI service provider

#### Tech Stack
- **Frontend**: React 18.2.0, Vite 5.0.8, Tailwind CSS 3.4.18
- **Backend**: Node.js 16+, Express 4.18.2, MongoDB 8.0.3
- **Authentication**: JWT, bcryptjs, nodemailer for OTP
- **AI Services**: Hugging Face Inference API 4.13.3

#### UI/UX
- **Responsive Design**: Mobile-first approach
- **Language Selector**: Easy switching between languages
- **Toast Notifications**: User feedback system
- **Protected Routes**: Auth-guarded pages
- **Loading States**: Smooth UX transitions

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on suggesting changes to this changelog.

---

## Versioning Policy

- **MAJOR** (X.0.0): Breaking changes, major feature additions
- **MINOR** (x.Y.0): New features, backward-compatible
- **PATCH** (x.y.Z): Bug fixes, minor improvements

---

**Repository**: [Plant-Classification_h](https://github.com/ChAhmadAbdullah/Plant-Classification_h)  
**Maintainer**: Ahsan Khizar (ahsankhizar1075@gmail.com)  
**License**: MIT
