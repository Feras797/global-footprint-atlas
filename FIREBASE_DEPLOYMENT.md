# 🔥 Firebase Deployment Guide

## 📋 Prerequisites

1. **Use correct Node.js version:**
   ```bash
   nvm use 22.15.0
   ```

2. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase:**
   ```bash
   firebase login
   ```

4. **Install Function Dependencies:**
   ```bash
   npm run firebase:functions:install
   ```

## 🚀 Commands to Run Everything

### **Local Development:**
```bash
# Option 1: Run local proxy + frontend (current setup)
npm run dev:full

# Option 2: Run Firebase emulators (test Firebase setup locally)
npm run firebase:emulator
```

### **Firebase Deployment:**
```bash
# Deploy everything to Firebase
npm run firebase:deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## 🔧 Firebase Setup Steps

1. **Initialize Firebase (first time only):**
   ```bash
   firebase init
   ```
   - Select: Hosting, Functions
   - Choose your Firebase project
   - Use existing files (don't overwrite)

2. **Configure Google Cloud Authentication:**
   - Your Firebase Functions will automatically have access to Google Cloud APIs
   - No need for service account keys in Firebase environment
   - The functions use Application Default Credentials

## 🌐 How It Works

### **Local Development:**
- Frontend: `http://localhost:8080` (Vite dev server)
- Backend: `http://localhost:3001` (Local Express server)
- Gemini calls: Local server → Google Cloud

### **Production (Firebase):**
- Frontend: `https://your-project.web.app` (Firebase Hosting)
- Backend: `https://your-project.web.app/api/*` (Firebase Functions)
- Gemini calls: Firebase Function → Google Cloud (automatic auth)

## 📁 File Structure

```
/
├── dist/                    # Built frontend (auto-generated)
├── functions/               # Firebase Functions
│   ├── src/index.ts        # Gemini proxy function
│   ├── package.json        # Function dependencies
│   └── tsconfig.json       # TypeScript config
├── firebase.json           # Firebase configuration
├── server.js              # Local development server
└── src/                   # Frontend React app
```

## 🔑 Environment Variables

Firebase Functions automatically handle Google Cloud authentication. No environment variables needed!

## 🧪 Testing

1. **Test locally with emulators:**
   ```bash
   npm run firebase:emulator
   ```

2. **Test deployed functions:**
   ```bash
   curl -X POST https://your-project.web.app/api/gemini \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"role":"user","parts":[{"text":"Hello Gemini!"}]}]}'
   ```

## 🚨 Troubleshooting

- **Function timeouts:** Increase timeout in `functions/src/index.ts`
- **CORS issues:** Check CORS configuration in Firebase Function
- **Auth issues:** Ensure your Firebase project has access to Vertex AI
- **Build issues:** Run `npm run build` locally first

## 💡 Deployment Flow

1. `npm run build` → Builds React app to `dist/`
2. `firebase deploy` → Deploys both hosting and functions
3. Frontend served from Firebase Hosting
4. API calls routed to Firebase Functions
5. Functions authenticate and call Gemini API

**That's it! Pure Firebase deployment with Gemini 1.5 Pro! 🎉**
