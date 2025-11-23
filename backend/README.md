# Agriculture Chat Backend API

Backend API for Agriculture Chat Assistant with JWT authentication and OTP verification.

## Features

- 🔐 JWT Authentication
- 📧 OTP Email Verification (2 minutes validity)
- 🚦 Rate Limiting (5 OTP requests per day)
- 💬 Chat Messaging System
- 📤 File Upload Support
- 🛡️ Security Middleware (Helmet, CORS)
- 📊 MongoDB Database

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Email account for OTP (Gmail recommended)

## Installation

1. **Clone the repository and navigate to backend folder:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file:**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/agriculture-chat
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   OTP_EXPIRE_MINUTES=2
   OTP_MAX_REQUESTS_PER_DAY=5
   
   # Hugging Face API (for AI models) - Optional
   # Get your API key from https://huggingface.co/settings/tokens
   HUGGINGFACE_API_KEY=your-huggingface-api-key
   
   # Email Configuration (optional for development)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@agriculturechat.com
   ```

## Email Setup (Gmail)

### Option 1: Configure Gmail (Production)
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

### Option 2: Development Mode (No Email Config Required)
If you don't configure email settings, the system will automatically:
- Return OTP in API response (development mode only)
- Log OTP to console
- Allow testing without email service

**Note:** In production, email configuration is required.

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Request OTP

```
POST /api/auth/request-otp
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "OTP sent to your email successfully" }
```

#### Verify OTP

```
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "success": true, "message": "OTP verified successfully" }
```

#### Register

```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "language": "english"
}
Response: {
  "success": true,
  "token": "jwt-token",
  "user": { ... }
}
```

#### Login

```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Response: {
  "success": true,
  "token": "jwt-token",
  "user": { ... }
}
```

#### Get Profile

```
GET /api/auth/profile
Headers: { "Authorization": "Bearer jwt-token" }
Response: { "success": true, "user": { ... } }
```

#### Update Profile

```
PUT /api/auth/profile
Headers: { "Authorization": "Bearer jwt-token" }
Body: { "name": "New Name", "language": "urdu" }
Response: { "success": true, "user": { ... } }
```

### Chat

#### Send Message

```
POST /api/chat/send
Headers: { "Authorization": "Bearer jwt-token" }
Body: {
  "content": "How to treat rust fungus?",
  "type": "text",
  "language": "english"
}
Response: { "success": true, "data": { ... } }
```

#### Get Messages

```
GET /api/chat/messages?type=text&page=1&limit=50
Headers: { "Authorization": "Bearer jwt-token" }
Response: { "success": true, "data": { "messages": [...], "pagination": {...} } }
```

#### Get Message by ID

```
GET /api/chat/messages/:id
Headers: { "Authorization": "Bearer jwt-token" }
Response: { "success": true, "data": { ... } }
```

#### Clear Messages

```
DELETE /api/chat/messages
Headers: { "Authorization": "Bearer jwt-token" }
Response: { "success": true, "message": "Messages cleared successfully" }
```

### Upload

#### Upload Image

```
POST /api/upload/image
Headers: { "Authorization": "Bearer jwt-token" }
Body: { "fileUrl": "...", "language": "english" }
Response: { "success": true, "data": { "advice": "...", "analysis": {...} } }
```

#### Upload Voice

```
POST /api/upload/voice
Headers: { "Authorization": "Bearer jwt-token" }
Body: { "fileUrl": "...", "language": "english" }
Response: { "success": true, "data": { "transcription": "...", "advice": "...", "analysis": {...} } }
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse (5 OTP requests per day)
- **OTP Expiration**: 2 minutes validity
- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Input Validation**: Express-validator for all inputs

## Project Structure

```
backend/
├── controllers/       # Route controllers
│   ├── auth.controller.js
│   ├── chat.controller.js
│   └── upload.controller.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── models/          # MongoDB models
│   ├── User.js
│   ├── OTP.js
│   └── ChatMessage.js
├── routes/          # API routes
│   ├── auth.routes.js
│   ├── chat.routes.js
│   └── upload.routes.js
├── utils/           # Utility functions
│   ├── generateToken.js
│   ├── generateOTP.js
│   ├── sendEmail.js
│   └── mockData.js
├── .env.example     # Environment variables template
├── .gitignore
├── package.json
├── server.js        # Entry point
└── README.md
```

## Error Handling

All errors are handled by the error handler middleware and return consistent JSON responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Development Notes

- OTP is sent via email (configure email settings in `.env`)
- In development mode, OTP may be returned in response for testing
- All chat routes require authentication
- Messages are stored in MongoDB with user association
- Rate limiting prevents abuse

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper `MONGODB_URI`
4. Set up proper email service
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up monitoring and logging

## License

ISC
