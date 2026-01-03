# SkillProof Deployment - Complete Step-by-Step Guide
## From Emergent to Live Website (30 Minutes Total)

**You are here:** Code is on Emergent and pushed to GitHub ✅

**You'll end up with:** Live website URL you can share with anyone! 🎉

---

## Overview - What We're Doing

We'll set up 4 free services in this order:
1. **MongoDB Atlas** (Database - stores users/posts) - 5 minutes
2. **Cloudinary** (Video storage) - 5 minutes  
3. **Render** (Backend API server) - 10 minutes
4. **Vercel** (Frontend website) - 5 minutes
5. **UptimeRobot** (Keeps it fast) - 5 minutes

**Total: 30 minutes → You'll have a live website!**

---

# STEP 1: Set Up MongoDB Atlas (Database)
## Time: 5 minutes

### 1.1 - Create Account
1. Open new tab
2. Go to: https://www.mongodb.com/cloud/atlas/register
3. Fill in:
   - **Email:** your email
   - **Password:** create a password (write it down!)
   - Click "Create your Atlas account"
4. Check your email and click the verification link
5. Log back in

### 1.2 - Create a Free Cluster
1. You'll see "Deploy a cloud database"
2. Click the **"M0 FREE"** option (left side)
3. Settings to choose:
   - **Provider:** AWS (already selected)
   - **Region:** Choose closest to you (any will work)
   - **Cluster Name:** Keep default or type "SkillProof"
4. Click **"Create Deployment"** (green button at bottom)
5. Wait 2-3 minutes (you'll see "Creating cluster...")

### 1.3 - Create Database User
1. A popup appears: "Create Database User"
2. Fill in:
   - **Username:** `skillproof` (write this down!)
   - **Password:** Click "Autogenerate Secure Password" 
   - **IMPORTANT:** Click the "Copy" button next to the password
   - **Paste it somewhere safe** (you'll need it in Step 3!)
3. Click **"Create Database User"**

### 1.4 - Allow All IP Addresses
1. You'll see "Choose a connection method"
2. Click **"Close"** for now
3. On the left menu, click **"Network Access"**
4. Click **"+ ADD IP ADDRESS"** (green button)
5. Click **"ALLOW ACCESS FROM ANYWHERE"** 
6. It will show: `0.0.0.0/0`
7. Click **"Confirm"**

### 1.5 - Get Connection String
1. On the left menu, click **"Database"**
2. You'll see your cluster (green dot = ready)
3. Click **"Connect"** button
4. Click **"Connect your application"**
5. You'll see a connection string like:
   ```
   mongodb+srv://skillproof:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. **COPY THIS STRING**
7. Replace `<password>` with the password you copied earlier
8. Your final string looks like:
   ```
   mongodb+srv://skillproof:Ax7K9mP2nQ5w@cluster0.xxxxx.mongodb.net/
   ```
9. **Save this complete string** - you'll need it in Step 3!

**✅ CHECKPOINT:** You have a MongoDB connection string that starts with `mongodb+srv://`

---

# STEP 2: Set Up Cloudinary (Video Storage)
## Time: 5 minutes

### 2.1 - Create Account
1. Open new tab
2. Go to: https://cloudinary.com/users/register/free
3. Fill in:
   - **Email:** your email
   - **Password:** create a password
   - **Cloud name:** choose a name (like "skillproof-videos")
   - Check the checkbox
4. Click **"Sign up for free"**
5. Check email and verify

### 2.2 - Get API Credentials
1. You'll land on the Cloudinary dashboard
2. You'll see a section called "Account Details" with:
   - **Cloud Name:** (like "skillproof-videos")
   - **API Key:** (numbers like "123456789012345")
   - **API Secret:** (hidden - click "eye" icon to reveal)
3. **Copy these 3 values and save them:**
   ```
   Cloud Name: skillproof-videos
   API Key: 123456789012345
   API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
   ```

**✅ CHECKPOINT:** You have 3 Cloudinary values saved

---

# STEP 3: Deploy Backend on Render
## Time: 10 minutes

### 3.1 - Create Render Account
1. Open new tab
2. Go to: https://dashboard.render.com/register
3. Click **"Sign up with GitHub"** (easiest way)
4. Authorize Render to access your GitHub

### 3.2 - Create Web Service
1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** next to GitHub if needed
4. Find your repository: **"andrel4-space/killproof-platform"**
5. Click **"Connect"**

### 3.3 - Configure Service
Fill in these settings EXACTLY:

**Name:**
```
skillproof-backend
```

**Region:**
```
Oregon (US West) - or closest to you
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Python 3
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn server:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Free
```

### 3.4 - Add Environment Variables
Scroll down to "Environment Variables" section.

Click **"Add Environment Variable"** for each one below:

**Variable 1:**
- Key: `MONGO_URL`
- Value: (paste your MongoDB connection string from Step 1.5)
- Example: `mongodb+srv://skillproof:Ax7K9mP2nQ5w@cluster0.xxxxx.mongodb.net/`

**Variable 2:**
- Key: `DB_NAME`
- Value: `skillproof`

**Variable 3:**
- Key: `JWT_SECRET`
- Value: (make up a random long string, like: `my-super-secret-key-2024-skillproof-platform`)

**Variable 4:**
- Key: `CORS_ORIGINS`
- Value: `*` (just an asterisk)

**Variable 5:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Value: (paste your Cloud Name from Step 2.2)

**Variable 6:**
- Key: `CLOUDINARY_API_KEY`
- Value: (paste your API Key from Step 2.2)

**Variable 7:**
- Key: `CLOUDINARY_API_SECRET`
- Value: (paste your API Secret from Step 2.2)

### 3.5 - Deploy!
1. Click **"Create Web Service"** (big button at bottom)
2. Wait 5-10 minutes while it deploys
3. You'll see logs scrolling (it's installing Python packages)
4. When you see "Live ✓" at the top - it's ready!

### 3.6 - Copy Your Backend URL
1. At the top, you'll see a URL like:
   ```
   https://skillproof-backend.onrender.com
   ```
2. **COPY THIS URL** - you need it for Step 4!
3. Test it: Click the URL, add `/api/health` to the end:
   ```
   https://skillproof-backend.onrender.com/api/health
   ```
4. You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "service": "skillproof-backend",
     "database": "connected"
   }
   ```

**✅ CHECKPOINT:** Your backend URL works and shows "healthy" status

---

# STEP 4: Deploy Frontend on Vercel
## Time: 5 minutes

### 4.1 - Create Vercel Account
1. Open new tab
2. Go to: https://vercel.com/signup
3. Click **"Continue with GitHub"**
4. Authorize Vercel

### 4.2 - Import Your Project
1. Click **"Add New..."** (top right)
2. Select **"Project"**
3. Find **"andrel4-space/killproof-platform"**
4. Click **"Import"**

### 4.3 - Configure Project
Fill in these settings:

**Framework Preset:**
```
Create React App
```

**Root Directory:**
- Click "Edit" 
- Type: `frontend`
- Click the folder icon

**Build Command:**
```
yarn build
```
(Should be auto-filled)

**Output Directory:**
```
build
```
(Should be auto-filled)

### 4.4 - Add Environment Variable
1. Click **"Environment Variables"** section to expand
2. Add ONE variable:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** (paste your Render backend URL from Step 3.6)
   - Example: `https://skillproof-backend.onrender.com`
   - **DO NOT** add `/api` at the end!

### 4.5 - Deploy!
1. Click **"Deploy"** (big button)
2. Wait 2-3 minutes
3. You'll see "Building..." then "Deploying..."
4. When done, you'll see: 🎉 **"Congratulations!"**

### 4.6 - Visit Your Live Website!
1. Click **"Visit"** button or **"Continue to Dashboard"**
2. You'll see your project with a URL like:
   ```
   https://killproof-platform.vercel.app
   ```
3. **Click the URL** - your website is LIVE! 🎉

### 4.7 - Test It!
1. Click "Register"
2. Create an account
3. Try uploading a video
4. It should work!

**✅ CHECKPOINT:** You can visit your website and create an account

---

# STEP 5: Set Up UptimeRobot (Keep It Fast)
## Time: 5 minutes

### 5.1 - Create Account
1. Go to: https://uptimerobot.com/signUp
2. Enter your email
3. Create a password
4. Click "Sign up - It's free!"
5. Check email and verify

### 5.2 - Add Monitor
1. Click **"+ Add New Monitor"** (green button)
2. Fill in:

**Monitor Type:**
```
HTTP(s)
```

**Friendly Name:**
```
SkillProof Backend
```

**URL (or IP):**
```
https://skillproof-backend.onrender.com/api/health
```
(Use YOUR backend URL from Step 3.6, add `/api/health`)

**Monitoring Interval:**
```
5 minutes
```

3. Click **"Create Monitor"**

### 5.3 - Verify It's Working
1. Wait 5 minutes
2. Refresh the page
3. You should see: ✅ **"Up"** status
4. Response time: ~200-500ms

**✅ CHECKPOINT:** Monitor shows "Up" status

---

# STEP 6: Update CORS (Important!)
## Time: 2 minutes

Your backend needs to know about your Vercel URL.

### 6.1 - Get Your Vercel URL
1. Go to your Vercel dashboard
2. Copy your full URL, example:
   ```
   https://killproof-platform.vercel.app
   ```

### 6.2 - Update Render Environment Variable
1. Go back to Render dashboard: https://dashboard.render.com/
2. Click your **"skillproof-backend"** service
3. Click **"Environment"** in the left menu
4. Find the **"CORS_ORIGINS"** variable
5. Click "Edit" (pencil icon)
6. Change value from `*` to your Vercel URL:
   ```
   https://killproof-platform.vercel.app
   ```
7. Click "Save Changes"
8. Wait 2 minutes for backend to restart

**✅ CHECKPOINT:** CORS updated with your Vercel URL

---

# 🎉 YOU'RE DONE!

## Your Live Website:
```
https://killproof-platform.vercel.app
```
(or whatever your Vercel URL is)

## What Works:
- ✅ User registration and login
- ✅ Video uploads (stored on Cloudinary)
- ✅ Feed displays videos
- ✅ Validation system
- ✅ Profile stats
- ✅ Leaderboard
- ✅ Search and filters
- ✅ Fast responses (no cold starts thanks to UptimeRobot)

---

# Testing Checklist

Visit your website and test:

- [ ] Homepage loads
- [ ] Register new account
- [ ] Login works
- [ ] Upload a short video (works!)
- [ ] Video plays in feed
- [ ] Click "I Learned This" button
- [ ] Visit profile page
- [ ] Check leaderboard
- [ ] Search for posts
- [ ] Everything works!

---

# Troubleshooting

## Problem: "CORS error" in browser console
**Solution:** Make sure you updated CORS_ORIGINS in Step 6

## Problem: Videos don't upload
**Solution:** Check Cloudinary credentials in Render (Step 3.4)

## Problem: "Database connection failed"
**Solution:** Check MONGO_URL in Render (Step 3.4)

## Problem: Backend is slow
**Solution:** Make sure UptimeRobot monitor is active (Step 5)

## Problem: Can't login
**Solution:** Wait 2 minutes for backend to wake up, try again

---

# Share Your Website!

Your SkillProof platform is now live at:
```
https://YOUR-URL.vercel.app
```

Share this URL with anyone! They can:
- Register accounts
- Upload skill proof videos
- Validate each other
- Build their profiles

---

# What Did You Just Deploy?

**Free Tier Stack:**
- Frontend: Vercel (global CDN, unlimited)
- Backend: Render (750 hours/month, always on with UptimeRobot)
- Database: MongoDB Atlas (512MB storage)
- Videos: Cloudinary (25GB storage + 25GB bandwidth)
- Monitoring: UptimeRobot (keeps backend awake)

**Total Cost: $0/month** 🎉

**Need Help?**
If anything doesn't work, tell me which step number you're on and what error you see!

---

**Congratulations! You just deployed a full-stack social platform! 🚀**
