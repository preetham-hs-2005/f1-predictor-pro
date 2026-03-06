# Hosting F1 Prediction League on Vercel

## Overview

Your app has two parts to deploy:
- **Frontend**: React/Vite (easily deployable on Vercel)
- **Backend**: Express.js API (requires Vercel Functions or separate hosting)

## Option 1: Frontend on Vercel + Backend on Render (Recommended for Free Tier)

### Step 1: Deploy Frontend on Vercel

#### 1.1 Sign up on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Connect your Git repository

#### 1.2 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/f1-prediction-pro.git
git branch -M main
git push -u origin main
```

#### 1.3 Import Project on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`(root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

#### 1.4 Set Environment Variables

After deployment, go to Project Settings:
1. Navigate to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com
   ```
   (We'll create the backend URL in Step 2)

### Step 2: Deploy Backend on Render (Free Alternative)

#### 2.1 Prepare Backend for Render

Create `server/render.yaml`:
```yaml
services:
  - type: web
    name: f1-prediction-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: mongodb
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

Update `server/package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

#### 2.2 Create MongoDB Cluster (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Get connection string from "Connect" → "Drivers"
4. Copy the URI (you'll need it in Step 2.3)

#### 2.3 Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `f1-prediction-api`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free
6. Click "Advanced" and add environment variables:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/f1_prediction_league?retryWrites=true&w=majority
   JWT_SECRET = (generate a random string)
   NODE_ENV = production
   PORT = 10000
   ```
7. Click "Create Web Service"

#### 2.4 Update Frontend Environment

Once Render deployment completes:
1. Copy your Render URL (e.g., `https://f1-prediction-api.onrender.com`)
2. Go to Vercel Dashboard → Your Project
3. Settings → Environment Variables
4. Update `VITE_API_URL = https://f1-prediction-api.onrender.com`
5. Redeploy frontend

### Step 3: Update CORS for Production

**File**: `server/src/server.ts`

```typescript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "https://your-vercel-domain.vercel.app",  // Add your Vercel URL
    "https://www.your-custom-domain.com",      // Add custom domain if applicable
  ],
  credentials: true,
}));
```

---

## Option 2: Full Stack on Vercel with Serverless Functions (Advanced)

### Step 1: Restructure Backend as Vercel Functions

Create `api/` folder in root:
```
api/
├── auth.ts
├── predictions.ts
├── leaderboard.ts
└── admin.ts
```

Create `api/auth.ts`:
```typescript
import { Router, Request, Response } from "express";
import { User } from "../server/src/models/User";
import { generateToken } from "../server/src/utils/jwt";

export default async (req: Request, res: Response) => {
  // Your auth logic here
};
```

### Step 2: Create `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### Step 3: Deploy

Same as Option 1 - Vercel will automatically detect Vercel Functions.

---

## Detailed Step-by-Step (Option 1 - Recommended)

### Step 1: GitHub Setup

```bash
# Initialize git if not already done
git init

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/f1-prediction-pro.git

# Create main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit: F1 Prediction League"

# Push to GitHub
git push -u origin main
```

### Step 2: Vercel Frontend Deployment

1. **Sign up**: Go to vercel.com, click "Sign Up"
2. **GitHub Login**: Choose "Continue with GitHub"
3. **Authorize Vercel**: Click "Authorize"
4. **Import Project**:
   - Go to Dashboard
   - Click "Add New" → "Project"
   - Find your `f1-prediction-pro` repo
   - Click "Import"
5. **Configure**:
   - Framework: Vite ✓
   - Root Directory: ./
   - Build: `npm run build` ✓
   - Output: `dist` ✓
6. **Environment Variables**:
   - Click "Continue to Dashboard"
   - Go to Settings → Environment Variables
   - Add `VITE_API_URL` (we'll update this after backend is deployed)
7. **Deploy**: Click "Deploy"

**Your frontend URL**: `https://f1-prediction-pro.vercel.app` (or custom domain)

### Step 3: MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create Organization & Project
4. Create Cluster (M0 - Free):
   - Choose AWS
   - Select nearest region
   - Click "Create"
5. Add IP to Whitelist:
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allows all - for testing)
6. Create Database User:
   - Click "Database Access"
   - Add User (username & password)
7. Get Connection String:
   - Click "Connect"
   - Choose "Drivers"
   - Copy the URI
   - Replace `<username>` and `<password>`

**Connection String Format**:
```
mongodb+srv://username:password@cluster0.xyz.mongodb.net/f1_prediction_league?retryWrites=true&w=majority
```

### Step 4: Render Backend Deployment

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New Web Service:
   - Connect GitHub repo
   - Select your repo
   - **Name**: `f1-prediction-api`
   - **Environment**: Node
   - **Build Command**: 
     ```
     cd server && npm install
     ```
   - **Start Command**: 
     ```
     cd server && npm start
     ```
   - **Plan**: Free
4. **Environment Variables**:
   - Click "Advanced"
   - Add each variable:
     - `MONGODB_URI`: (from Step 3)
     - `JWT_SECRET`: (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
5. **Deploy**: Click "Create Web Service"

**Your backend URL**: `https://f1-prediction-api.onrender.com`

### Step 5: Connect Frontend to Backend

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `VITE_API_URL`:
   ```
   https://f1-prediction-api.onrender.com
   ```
5. Click "Redeploy" on Deployments tab

### Step 6: Verify Everything Works

1. Open your Vercel URL
2. Register new account
3. Submit a prediction
4. Check leaderboard
5. Monitor logs:
   - **Vercel**: Logs → Function Logs
   - **Render**: Logs tab in dashboard

---

## Domain & DNS Setup

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `f1league.com`)
4. Vercel shows DNS records to add
5. Add records to your registrar (GoDaddy, Namecheap, etc.)
6. Wait for DNS propagation (5-48 hours)

### Email for MongoDB

Render/Vercel may require email verification for services. Use your email in `.env.local` setup.

---

## Environment Variables Checklist

### Vercel (Frontend)
```
VITE_API_URL=https://f1-prediction-api.onrender.com
```

### Render (Backend)
```
MONGODB_URI=mongodb+srv://[username]:[password]@cluster.mongodb.net/f1_prediction_league?retryWrites=true&w=majority
JWT_SECRET=[generate-random-string]
NODE_ENV=production
PORT=10000
```

---

## Troubleshooting

### 401 Unauthorized Errors

**Problem**: Requests to backend return 401

**Solutions**:
1. Check CORS in `server/src/server.ts` includes your Vercel URL
2. Verify JWT_SECRET is same on Render
3. Check MongoDB connection string in Render env vars

### CORS Errors

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution 1**: Update CORS in backend
```typescript
app.use(cors({
  origin: ["https://your-vercel-url.vercel.app"],
  credentials: true,
}));
```

**Solution 2**: Redeploy backend after CORS changes
```bash
git push  # Auto-redeploys on Render
```

### 502 Bad Gateway

**Problem**: Backend returning 502 errors

**Solutions**:
1. Check Render logs for errors
2. Verify MongoDB connection string
3. Check free MongoDB has not exceeded limits (512MB storage)
4. Restart Web Service on Render dashboard

### Cold Start Delays

**Problem**: First request takes 10-30 seconds

**Expected**: Render free tier has cold starts. Subscribe to paid plan to avoid.

---

## Performance Optimization

### Render Paid Tiers
- **Starter**: $7/month (no cold starts)
- **Standard**: $12/month (more resources)

### MongoDB Paid Tiers
- Free: 512MB storage (good for testing)
- M2: $9/month (10GB storage)
- M5: $57/month (100GB storage)

---

## Monitoring

### Vercel Analytics
- Dashboard → Analytics
- Monitor page load times, user count, etc.

### Render Logs
- Web Service → Logs
- Monitor API errors, requests, etc.

### MongoDB Atlas Monitoring
- Dashboard → Metrics
- Monitor database performance, storage usage

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB passwords are secure
- [ ] CORS only allows your domain
- [ ] Environment variables not in code
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Render IP whitelist configured
- [ ] MongoDB IP whitelist configured

---

## Quick Reference Commands

```bash
# Local testing before deployment
npm run build        # Build frontend
cd server
npm run build        # Build backend

# Check if CORS is properly configured
curl -H "Origin: https://your-domain.com" http://localhost:3000/health

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test API endpoint
curl https://f1-prediction-api.onrender.com/health
```

---

## Support Links

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.mongodb.com/manual/
- **Express.js**: https://expressjs.com/

---

**That's it! Your F1 Prediction League is now live on the internet! 🚀**
