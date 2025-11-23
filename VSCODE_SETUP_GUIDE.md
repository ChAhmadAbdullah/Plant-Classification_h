# 🚀 Step-by-Step Setup Guide in VS Code

This guide walks you through setting up the integrated Plant Classification application in VS Code.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **VS Code** installed
- [ ] **Node.js 16+** installed ([Download](https://nodejs.org/))
- [ ] **Python 3.8+** installed ([Download](https://www.python.org/))
- [ ] **MongoDB** running (local or Atlas account)
- [ ] **Git** installed
- [ ] **Terminal** access (PowerShell on Windows)

## 🎬 Step 1: Open Project in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Navigate to: `c:\Users\ahsan\Downloads\New folder\Plant-Classification_h`
4. Click **Select Folder**

## 🔧 Step 2: Copy the Model File

**IMPORTANT**: The trained model file needs to be copied manually (it's ~100MB).

### Option A: Manual Copy
```powershell
# In VS Code terminal (Ctrl + `)
Copy-Item "../Plant-Classification/plant_disease_resnet50.pth" "backend/ml_model/"
```

### Option B: Using File Explorer
1. Navigate to: `c:\Users\ahsan\Downloads\New folder\Plant-Classification\`
2. Copy `plant_disease_resnet50.pth` (large file, ~100MB)
3. Paste into: `c:\Users\ahsan\Downloads\New folder\Plant-Classification_h\backend\ml_model\`

### Verify Model File
```powershell
# Check if file exists
Test-Path backend/ml_model/plant_disease_resnet50.pth
# Should return: True
```

## 📦 Step 3: Install Backend Dependencies

### 3.1 Install Node.js Packages

```powershell
# Open terminal in VS Code (Ctrl + `)
cd backend
npm install
```

**Expected output:**
```
added XXX packages in XXs
```

### 3.2 Install Python Packages

**Option A: CPU Only (Faster, Smaller)**
```powershell
# Install PyTorch for CPU
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
pip install -r ml_model/requirements.txt
```

**Option B: GPU Support (If you have NVIDIA GPU)**
```powershell
# Install PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Install other dependencies
pip install -r ml_model/requirements.txt
```

### Verify Python Installation
```powershell
python -c "import torch; import torchvision; print('PyTorch:', torch.__version__); print('TorchVision:', torchvision.__version__)"
```

**Expected output:**
```
PyTorch: 2.7.0+cpu (or +cu118)
TorchVision: 0.22.0+cpu (or +cu118)
```

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Create .env File in Backend

```powershell
# In terminal, from backend/ directory
Copy-Item ../.env.example .env
```

### 4.2 Edit .env File

1. In VS Code, open: `backend/.env`
2. Update these values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/agriculture-chat
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriculture-chat

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_key_change_this_in_production

# Hugging Face Token (get from https://huggingface.co/settings/tokens)
HF_TOKEN=hf_your_token_here

# Groq API Key (optional, get from https://console.groq.com)
GROQ_APIKEY=your_groq_key_here

# Email (for OTP - optional for testing)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4.3 Get API Keys

**Hugging Face Token:**
1. Go to: https://huggingface.co/settings/tokens
2. Create a new token
3. Copy and paste into `HF_TOKEN` in .env

**Groq API Key (Optional):**
1. Go to: https://console.groq.com
2. Sign up and get API key
3. Copy and paste into `GROQ_APIKEY` in .env

## 🗄️ Step 5: Setup MongoDB

### Option A: Local MongoDB

```powershell
# Start MongoDB (if installed locally)
mongod

# Keep this terminal open!
```

### Option B: MongoDB Atlas (Cloud)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in .env

## 🚀 Step 6: Start Backend Server

```powershell
# From backend/ directory
npm start
```

**Expected output:**
```
🚀 Server running on port 5000
📡 API URL: http://localhost:5000/api
✅ MongoDB connected successfully
✅ [ML SERVICE] Model files found and ready
```

**If you see errors:**
- ❌ MongoDB error → Check MongoDB is running or Atlas connection string
- ❌ Python error → Verify Python and PyTorch are installed
- ❌ Model file error → Ensure .pth file is in backend/ml_model/

## 🎨 Step 7: Install Frontend Dependencies

**Open a NEW terminal** (don't close backend terminal):

```powershell
# In VS Code: Terminal → New Terminal (or Ctrl + Shift + `)
cd frontend
npm install
```

## 🌐 Step 8: Start Frontend

```powershell
# From frontend/ directory
npm run dev
```

**Expected output:**
```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## ✅ Step 9: Test the Application

### 9.1 Open Browser
- Navigate to: http://localhost:3000

### 9.2 Test ML Service

**In a NEW terminal:**

```powershell
# Test ML status
curl http://localhost:5000/api/ml/status

# Expected response:
# {"success":true,"data":{"ready":true,"error":null,"modelPath":"..."}}
```

### 9.3 Test Prediction (Command Line)

```powershell
# Quick test with an image file
# Replace with your actual image path
curl -X POST http://localhost:5000/api/ml/predict/quick `
  -F "image=@path/to/plant-image.jpg" `
  -F "threshold=0.60"
```

### 9.4 Test in Browser

1. Go to: http://localhost:3000/signup
2. Create an account
3. Verify OTP (check console logs if email not configured)
4. Navigate to: http://localhost:3000/predict
5. Upload a plant image
6. View prediction results!

## 🐛 Troubleshooting

### Issue: "Python not found"

**Solution:**
```powershell
# Check Python installation
python --version

# If not found, add Python to PATH or specify in .env:
# In backend/.env add:
PYTHON_PATH=C:\Python39\python.exe
```

### Issue: "Module 'torch' not found"

**Solution:**
```powershell
# Reinstall PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Issue: "Model file not found"

**Solution:**
```powershell
# Verify file exists
Test-Path backend/ml_model/plant_disease_resnet50.pth

# If False, copy the file from Plant-Classification folder
Copy-Item "../Plant-Classification/plant_disease_resnet50.pth" "backend/ml_model/"
```

### Issue: "MongoDB connection failed"

**Solution 1 - Local MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB
# Or:
mongod --dbpath="C:\data\db"
```

**Solution 2 - Use MongoDB Atlas:**
- Sign up at mongodb.com/cloud/atlas
- Get connection string
- Update MONGODB_URI in .env

### Issue: "Port already in use"

**Solution:**
```powershell
# Kill process on port 5000 (backend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force

# Kill process on port 3000 (frontend)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Ensure backend is running on port 5000
2. Check CORS settings in `backend/server.js`
3. Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## 📱 Using VS Code Features

### Recommended Extensions

Install these VS Code extensions:

1. **ES7+ React/Redux/React-Native snippets**
   - Extension ID: `dsznajder.es7-react-js-snippets`

2. **Prettier - Code formatter**
   - Extension ID: `esbenp.prettier-vscode`

3. **ESLint**
   - Extension ID: `dbaeumer.vscode-eslint`

4. **Python**
   - Extension ID: `ms-python.python`

5. **MongoDB for VS Code**
   - Extension ID: `mongodb.mongodb-vscode`

### Multi-Root Workspace (Optional)

Create a workspace file to manage both backend and frontend:

1. **File → Save Workspace As...**
2. Save as: `plant-classification.code-workspace`
3. Edit the file:

```json
{
  "folders": [
    {
      "path": "backend",
      "name": "Backend (Node.js)"
    },
    {
      "path": "frontend",
      "name": "Frontend (React)"
    },
    {
      "path": "backend/ml_model",
      "name": "ML Model (Python)"
    }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "python.defaultInterpreterPath": "python"
  }
}
```

### Terminal Layout

1. Split terminal: Click `+` dropdown → `Split Terminal`
2. Run backend in terminal 1
3. Run frontend in terminal 2
4. Use terminal 3 for git/testing commands

## 🎯 Next Steps

Now that everything is running:

1. ✅ **Explore Features**
   - Test disease prediction at `/predict`
   - Try chat interface at `/chat`
   - Upload voice messages at `/upload`

2. ✅ **Customize**
   - Update UI in `frontend/src/`
   - Add more ML endpoints in `backend/controllers/ml.controller.js`
   - Train new models and replace .pth file

3. ✅ **Deploy**
   - See README.md for deployment instructions
   - Consider Heroku, Railway, or AWS

4. ✅ **Git Setup**
   - See GIT_MERGE_GUIDE.md for repository merge instructions
   - Commit your changes
   - Push to GitHub

## 📞 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review terminal error messages carefully
3. Check `backend/ml_model/` has all required files
4. Ensure all environment variables are set
5. Verify Python and Node.js versions

## ✅ Success Checklist

Your setup is complete when you can:

- [ ] Backend server runs on port 5000
- [ ] Frontend runs on port 3000
- [ ] ML status endpoint returns `ready: true`
- [ ] MongoDB connection is successful
- [ ] You can signup/login
- [ ] Image upload works
- [ ] Disease prediction returns results
- [ ] Chat interface responds

**Congratulations! Your integrated plant classification app is ready! 🎉**
