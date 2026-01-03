# SkillProof Platform - Vercel Deployment Guide

## 🎯 100% Free Deployment Stack

- **Frontend**: Vercel (free, unlimited)
- **Backend**: Render.com (free tier - 750 hours/month)
- **Database**: MongoDB Atlas (free 512MB)
- **Video Storage**: Cloudinary (free 25GB storage + 25GB bandwidth/month)

---

## Step-by-Step Deployment

### Part 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new **FREE cluster** (M0 Sandbox)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. **Save this** - you'll need it for backend deployment

---

### Part 2: Set Up Cloudinary (Video Storage)

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Create a free account
3. Go to Dashboard → Copy these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. **Save these** - you'll need them for backend

---

### Part 3: Deploy Backend on Render

1. Go to [Render.com](https://render.com/) and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `andrel4-space/killproof-platform`
5. Configure:
   - **Name**: `skillproof-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   MONGO_URL=mongodb+srv://your-connection-string-from-atlas
   DB_NAME=skillproof
   JWT_SECRET=your-random-secret-key-here
   CORS_ORIGINS=*
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. **Copy your backend URL** (e.g., `https://skillproof-backend.onrender.com`)

---

### Part 4: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com/) and sign up with GitHub
2. Click "Add New..." → "Project"
3. Import `andrel4-space/killproof-platform`
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   - Key: `REACT_APP_BACKEND_URL`
   - Value: `https://skillproof-backend.onrender.com` (your Render URL)

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. **Get your live URL!** (e.g., `https://skillproof.vercel.app`)

---

## Post-Deployment Setup

### Update CORS on Backend

1. Go to Render Dashboard → Your Service
2. Environment Variables
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-vercel-url.vercel.app
   ```
4. Save changes (backend will redeploy)

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Upload a video
4. Videos will be stored on Cloudinary (not local server)
5. All features should work!

---

## Important Notes

### Free Tier Limitations

**Render.com Free Tier:**
- ✅ 750 hours/month (always on)
- ⚠️ Spins down after 15 minutes of inactivity (cold starts ~30 seconds)
- ✅ 512MB RAM
- ✅ Shared CPU

**MongoDB Atlas Free:**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Perfect for MVP

**Cloudinary Free:**
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25,000 transformations/month

**Vercel Free:**
- ✅ Unlimited bandwidth
- ✅ Unlimited projects
- ✅ Automatic HTTPS

### Backend Sleep Mode

Render free tier **sleeps after 15 minutes of inactivity**. Solutions:
1. Use [UptimeRobot](https://uptimerobot.com/) to ping your backend every 5 minutes (keeps it awake)
2. Accept 30-second cold start on first request
3. Upgrade to Render paid tier ($7/month) for always-on

---

## Troubleshooting

### Videos Not Uploading
- Check Cloudinary credentials in Render environment variables
- Verify API key is correct

### CORS Errors
- Ensure `CORS_ORIGINS` includes your Vercel URL
- Check backend is running (visit backend URL directly)

### Backend Not Responding
- Render free tier may be sleeping - wait 30 seconds and retry
- Check Render logs for errors

### Database Connection Failed
- Verify MongoDB Atlas connection string
- Ensure IP whitelist includes `0.0.0.0/0` (allow all)

---

## Custom Domain (Optional)

### Vercel Frontend:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render Backend:
1. Go to Render Dashboard → Your Service → Settings
2. Add custom domain (requires paid plan)

---

## Cost Summary

| Service | Free Tier | Paid Upgrade |
|---------|-----------|--------------|
| Vercel | ✅ Unlimited | $20/month (Pro) |
| Render | ✅ 750hrs/month | $7/month (Starter) |
| MongoDB Atlas | ✅ 512MB | $9/month (M10) |
| Cloudinary | ✅ 25GB | $89/month (Plus) |
| **Total** | **$0/month** | ~$25/month (all paid) |

---

## Deployment Checklist

Before deploying:
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account created
- [ ] Render backend deployed and running
- [ ] Environment variables configured
- [ ] Vercel frontend deployed
- [ ] CORS updated with Vercel URL
- [ ] Test registration and login
- [ ] Test video upload
- [ ] Test video playback

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Cloudinary**: https://cloudinary.com/documentation

---

**🎉 You now have a fully functional, free, production-ready SkillProof platform!**
