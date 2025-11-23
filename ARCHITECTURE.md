# 🏗️ System Architecture

## Overview

The Plant Classification application uses a hybrid architecture combining Node.js backend with Python ML inference, React frontend, and MongoDB database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                      http://localhost:3000                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Vite)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Home Page     │  │ Disease Predict│  │  Chat Page     │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Upload Page   │  │  Login/Signup  │  │  History       │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
│  Services:                                                       │
│  • imageService.js   • chatService.js   • api.js               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Axios HTTP Requests
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              NODE.JS EXPRESS BACKEND (Port 5000)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Routes Layer                           │  │
│  │  /api/auth  /api/chat  /api/upload  /api/ml             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Middleware Layer                         │  │
│  │  • auth.js (JWT)   • errorHandler.js   • rateLimiter.js │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Controllers Layer                        │  │
│  │  auth.controller    chat.controller    upload.controller │  │
│  │  ml.controller  ◄─── NEW                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                │                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Services Layer                          │  │
│  │  • aiService.js (Hugging Face)                           │  │
│  │  • mlService.js (Python Bridge) ◄─── NEW                │  │
│  │  • emailService, tokenService, etc.                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                                           │
           │                                           │
           ▼                                           ▼
┌─────────────────────┐              ┌──────────────────────────────┐
│   MongoDB Database   │              │   Python ML Subprocess       │
│   Port: 27017       │              │                              │
│                     │              │  ┌────────────────────────┐ │
│  Collections:       │              │  │    model.py            │ │
│  • users            │              │  │  (PyTorch Inference)   │ │
│  • chatmessages     │              │  └────────────────────────┘ │
│  • otps             │              │            │                 │
└─────────────────────┘              │            ▼                 │
                                     │  ┌────────────────────────┐ │
                                     │  │  ResNet50 Model        │ │
                                     │  │  plant_disease_        │ │
                                     │  │  resnet50.pth (~100MB) │ │
                                     │  └────────────────────────┘ │
                                     │            │                 │
                                     │            ▼                 │
                                     │  ┌────────────────────────┐ │
                                     │  │  38 Disease Classes    │ │
                                     │  │  class_labels.txt      │ │
                                     │  └────────────────────────┘ │
                                     └──────────────────────────────┘
```

## Data Flow: ML Prediction

```
┌──────────┐
│  User    │
│  Uploads │
│  Image   │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend (DiseasePrediction.jsx)                         │
│    • User selects image file                                │
│    • Creates preview                                         │
│    • Calls ImageService.predictDisease(file)                │
└────┬────────────────────────────────────────────────────────┘
     │ POST /api/ml/predict
     │ FormData: { image: File, threshold: 0.60 }
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Router (ml.routes.js)                            │
│    • Multer middleware intercepts upload                    │
│    • Stores in memory buffer                                │
│    • Passes to ml.controller.predictDisease()               │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ML Controller (ml.controller.js)                         │
│    • Validates image buffer                                 │
│    • Calls mlService.predictDisease(buffer, threshold)      │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ML Service (mlService.js)                                │
│    • Saves buffer to temp file                              │
│    • Spawns Python subprocess                               │
│    • Executes: python -c "from model import predict..."     │
│    • Reads JSON output from stdout                          │
│    • Cleans up temp file                                    │
│    • Formats prediction result                              │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Python ML Model (model.py)                               │
│    • Loads image from bytes                                 │
│    • Preprocesses: resize, normalize, tensor                │
│    • Runs inference with ResNet50                           │
│    • Applies softmax to get probabilities                   │
│    • Returns top predictions with confidence                │
└────┬────────────────────────────────────────────────────────┘
     │ JSON Output:
     │ {
     │   "predicted_class": "Tomato___Late_blight",
     │   "confidence": 0.8945,
     │   "all_predictions": [...]
     │ }
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Response Flow Back                                        │
│    mlService → ml.controller → Router → Frontend            │
│    • Formats as user-friendly response                      │
│    • Saves to database (if authenticated)                   │
│    • Returns to frontend                                    │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend Display                                          │
│    • Shows plant name                                        │
│    • Shows disease name                                      │
│    • Shows confidence percentage                            │
│    • Displays top 3 predictions                             │
│    • Color-codes health status                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
```
React 18.2.0
├── Vite (Build tool)
├── React Router (Navigation)
├── Axios (HTTP client)
├── Tailwind CSS (Styling)
└── Context API (State management)
```

### Backend (Node.js)
```
Express 4.18.2
├── Mongoose (MongoDB ODM)
├── JWT (Authentication)
├── Multer (File uploads)
├── Bcrypt (Password hashing)
├── Nodemailer (Email/OTP)
├── Helmet (Security)
├── Morgan (Logging)
└── Child Process (Python bridge)
```

### ML Layer (Python)
```
PyTorch 2.7.0
├── TorchVision (Image processing)
├── Pillow (Image handling)
├── NumPy (Numerical operations)
└── Pre-trained ResNet50 model
```

### Database
```
MongoDB 4.4+
├── Users collection
├── ChatMessages collection
└── OTPs collection
```

### External Services
```
Hugging Face API
└── Image captioning & text generation

Groq API (Optional)
└── Advanced chat completions
```

## File Structure (Detailed)

```
Plant-Classification_h/
│
├── backend/                          # Node.js Express Server
│   ├── server.js                     # Entry point
│   │
│   ├── ml_model/                     # ◄── NEW: ML Integration
│   │   ├── model.py                  # PyTorch inference
│   │   ├── class_labels.txt          # 38 disease classes
│   │   ├── requirements.txt          # Python deps
│   │   └── plant_disease_resnet50.pth # Model weights (~100MB)
│   │
│   ├── controllers/                  # Request handlers
│   │   ├── auth.controller.js
│   │   ├── chat.controller.js
│   │   ├── upload.controller.js
│   │   └── ml.controller.js          # ◄── NEW
│   │
│   ├── services/                     # Business logic
│   │   ├── aiService.js              # Hugging Face
│   │   └── mlService.js              # ◄── NEW: Python bridge
│   │
│   ├── routes/                       # API endpoints
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── upload.routes.js
│   │   └── ml.routes.js              # ◄── NEW
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js
│   │   ├── ChatMessage.js
│   │   └── OTP.js
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── utils/                        # Helper functions
│   │   ├── generateToken.js
│   │   ├── generateOTP.js
│   │   └── sendEmail.js
│   │
│   ├── package.json                  # Node dependencies
│   └── .env                          # Environment config
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Main app component
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── History.jsx
│   │   │   ├── About.jsx
│   │   │   └── DiseasePrediction.jsx # ◄── NEW
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── LanguageSelector.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── MessageBubble.jsx
│   │   │   ├── upload/
│   │   │   │   ├── ImageUpload.jsx
│   │   │   │   └── VoiceUpload.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/                 # API clients
│   │   │   ├── api.js
│   │   │   ├── chatService.js
│   │   │   └── imageService.js       # ◄── UPDATED
│   │   │
│   │   ├── contexts/                 # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── LanguageContext.jsx
│   │   │   └── ToastContext.jsx
│   │   │
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useApi.js
│   │   │   ├── useChat.js
│   │   │   └── useLanguage.js
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   └── index.css                 # Global styles
│   │
│   ├── package.json                  # React dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind config
│   └── index.html                    # HTML template
│
├── Documentation/                    # ◄── NEW
│   ├── README.md                     # Main documentation
│   ├── VSCODE_SETUP_GUIDE.md        # Setup instructions
│   ├── GIT_MERGE_GUIDE.md           # Git merge guide
│   ├── INTEGRATION_SUMMARY.md       # Integration details
│   ├── ARCHITECTURE.md              # This file
│   └── CHECKLIST.md                 # Quick reference
│
├── .env.example                      # Environment template
├── setup.ps1                         # Automated setup script
└── .gitignore                        # Git ignore rules
```

## Component Communication

### Authentication Flow
```
Login Page → AuthContext → API → JWT Token → LocalStorage → Header
```

### Chat Flow
```
ChatInterface → ChatInput → chatService → API → aiService → Groq/HF → Response
```

### Upload Flow (Existing)
```
ImageUpload → imageService → upload API → aiService → HF API → Analysis
```

### Disease Prediction Flow (NEW)
```
DiseasePrediction → imageService → ml API → mlService → Python → PyTorch → Result
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend                                                  │
│    • Input validation                                        │
│    • File type checking                                      │
│    • Size limits                                             │
│    • Protected routes (auth required)                        │
├─────────────────────────────────────────────────────────────┤
│ 2. Backend Middleware                                        │
│    • Helmet (HTTP headers)                                   │
│    • CORS policy                                             │
│    • Rate limiting                                           │
│    • JWT verification                                        │
│    • Request validation                                      │
├─────────────────────────────────────────────────────────────┤
│ 3. Authentication                                            │
│    • Bcrypt password hashing                                 │
│    • JWT tokens (30-day expiry)                             │
│    • OTP verification                                        │
│    • Secure cookie handling                                  │
├─────────────────────────────────────────────────────────────┤
│ 4. Database                                                  │
│    • MongoDB authentication                                  │
│    • Connection encryption                                   │
│    • Schema validation                                       │
├─────────────────────────────────────────────────────────────┤
│ 5. File Handling                                             │
│    • Multer file filtering                                   │
│    • Size limits (10MB)                                      │
│    • Temporary file cleanup                                  │
│    • MIME type validation                                    │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Current Architecture (Development)
- Single Node.js instance
- Single MongoDB instance
- Python subprocess per request
- No caching layer

### Production Recommendations
```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (nginx)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌────────────────────────┐  ┌────────────────────────┐
│  Node.js Instance 1    │  │  Node.js Instance 2    │
│  (PM2 Cluster Mode)    │  │  (PM2 Cluster Mode)    │
└────────────────────────┘  └────────────────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                ┌─────────────────────┐
                │   Redis Cache       │
                │   (Predictions)     │
                └─────────────────────┘
                            │
                            ▼
                ┌─────────────────────┐
                │  MongoDB Replica    │
                │  Set (3 nodes)      │
                └─────────────────────┘
```

### Optimization Strategies

1. **Caching**
   - Redis for prediction results
   - Cache based on image hash
   - TTL: 1 hour for predictions

2. **ML Model**
   - Use ONNX Runtime (faster inference)
   - Implement model result queue
   - Consider GPU deployment
   - Batch predictions

3. **Database**
   - Index frequently queried fields
   - Use MongoDB Atlas auto-scaling
   - Implement connection pooling

4. **Frontend**
   - CDN for static assets
   - Image compression before upload
   - Progressive Web App (PWA)
   - Service Worker caching

## Deployment Architecture

### Recommended Deployment (AWS Example)

```
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend)
    ↓
ALB (Load Balancer)
    ↓
EC2 Instances (Backend)
    ├── Node.js Application
    ├── Python Environment
    └── Model Files
    ↓
DocumentDB / MongoDB Atlas (Database)
    ↓
S3 (Model Backups & Uploads)
```

### Alternative: Containerized Deployment

```
Docker Compose / Kubernetes
├── frontend-container (nginx)
├── backend-container (node:16)
│   └── python:3.9 (embedded)
├── mongodb-container
└── redis-container (optional)
```

## Monitoring & Observability

### Metrics to Track
- API response times
- ML inference latency
- Prediction accuracy (user feedback)
- Error rates
- Database query performance
- Memory usage (Python/Node.js)
- CPU usage during predictions

### Tools
- **Logging**: Winston, Morgan
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Performance**: New Relic / DataDog
- **Uptime**: UptimeRobot

---

**This architecture provides a solid foundation for a production-ready plant disease detection system with room for scaling and optimization as needed.**
