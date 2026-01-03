# UptimeRobot Setup Guide - Keep Backend Awake 24/7 (FREE)

## What is UptimeRobot?

UptimeRobot is a **FREE** monitoring service that:
- ✅ Pings your backend every 5 minutes
- ✅ Keeps Render free tier from sleeping
- ✅ Monitors uptime (99.9% expected)
- ✅ Sends alerts if backend goes down
- ✅ Completely free for up to 50 monitors

**Result:** Your backend stays awake 24/7, no cold starts, instant responses!

---

## Step-by-Step Setup (5 Minutes)

### Step 1: Deploy Backend to Render First

Before setting up UptimeRobot, you need your backend URL from Render:
- Example: `https://skillproof-backend.onrender.com`

If you haven't deployed yet, follow `VERCEL_DEPLOYMENT.md` first.

---

### Step 2: Sign Up for UptimeRobot (FREE)

1. Go to: **https://uptimerobot.com/signUp**
2. Enter your email
3. Create a password
4. Verify email
5. Login to dashboard

**No credit card required!**

---

### Step 3: Create a Monitor

1. Click **"+ Add New Monitor"** button
2. Fill in the form:

**Monitor Type:** 
- Select: `HTTP(s)`

**Friendly Name:**
- Enter: `SkillProof Backend Health`

**URL (or IP):**
- Enter: `https://YOUR-BACKEND-URL.onrender.com/api/health`
- Example: `https://skillproof-backend.onrender.com/api/health`
- ⚠️ **IMPORTANT:** Must include `/api/health` at the end!

**Monitoring Interval:**
- Select: `5 minutes` (default, keeps Render awake)
- ✅ This is the sweet spot (prevents sleep, stays in free tier)

**Monitor Timeout:**
- Keep default: `30 seconds`

**HTTP Method:**
- Select: `GET (default)`

**Alert Contacts:**
- Add your email to get notified if backend goes down
- Click "Add Alert Contact" → Enter your email

3. Click **"Create Monitor"**

---

### Step 4: Verify It's Working

1. Wait 5 minutes
2. Check UptimeRobot dashboard:
   - Status should show: ✅ **Up**
   - Response time: ~200-500ms
   - Uptime: 100%

3. Check your backend directly:
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-12-26T10:30:00.000000+00:00",
     "service": "skillproof-backend",
     "database": "connected"
   }
   ```

---

## What You'll See

### UptimeRobot Dashboard:
```
Monitor Name: SkillProof Backend Health
Status: ✅ Up (100.00%)
Response Time: ~300ms
Last Check: 2 minutes ago
```

### Email Alerts (if backend goes down):
```
Subject: [Alert] SkillProof Backend Health is DOWN

Your monitor "SkillProof Backend Health" is currently DOWN.
Reason: Connection timeout
Started: Dec 26, 2024 10:35 AM
```

---

## Benefits of This Setup

### 🚀 **No More Cold Starts**
- Backend pings every 5 minutes
- Render never sleeps (15-minute timeout bypassed)
- Users get instant responses (no 30-second wait)

### 📊 **Free Monitoring**
- Track uptime percentage
- See response times
- Get downtime alerts
- All 100% free

### 💰 **Saves Money**
- Keeps free tier features working like paid
- No need to upgrade Render to $7/month
- Professional uptime monitoring included

---

## Advanced Configuration (Optional)

### Add Multiple Alert Contacts

1. Click "Alert Contacts"
2. Add:
   - Email alerts
   - SMS alerts (limited on free)
   - Slack webhooks
   - Discord webhooks

### Set Up Public Status Page (FREE)

1. Go to "Public Status Pages"
2. Click "Add Public Status Page"
3. Select your monitor
4. Get a public URL to share uptime with users
5. Example: `https://stats.uptimerobot.com/your-page`

### Configure Advanced Alerts

1. Edit monitor → "Notifications"
2. Set custom alert intervals:
   - Alert after: 2 down checks (recommended)
   - Re-alert every: 30 minutes
   - Send "up" notification when back online

---

## Troubleshooting

### Monitor Shows "DOWN"

**Check 1: Health endpoint accessible**
```bash
curl https://your-backend.onrender.com/api/health
```
If this fails, your backend has an issue.

**Check 2: Correct URL**
- Must be: `https://your-backend.onrender.com/api/health`
- NOT: `https://your-backend.onrender.com/health` ❌
- NOT: `https://your-backend.onrender.com/api` ❌

**Check 3: Render service running**
- Login to Render dashboard
- Check service status
- Review logs for errors

### Response Time > 1000ms

**Cause:** Backend might be in a cold start
**Solution:** Wait 2-3 minutes, UptimeRobot will keep it warm

### "Connection Timeout"

**Cause:** Backend taking too long to respond
**Solution:** 
- Check Render logs
- May need to upgrade Render plan
- Database connection issue (check MongoDB Atlas)

---

## Alternative Free Options

If you don't want to use UptimeRobot:

### Option 1: Cron-Job.org
- https://cron-job.org/
- Similar to UptimeRobot
- Pings every 5 minutes
- Free tier available

### Option 2: Better Uptime (Paid but Better)
- https://betteruptime.com/
- More features
- $10/month
- Professional monitoring

### Option 3: GitHub Actions (Advanced)
Create a workflow that pings your backend:

```yaml
# .github/workflows/keep-alive.yml
name: Keep Backend Alive
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: curl https://your-backend.onrender.com/api/health
```

---

## Cost Comparison

| Solution | Cost | Features |
|----------|------|----------|
| **UptimeRobot Free** | $0 | 50 monitors, 5-min intervals |
| **Upgrade Render** | $7/month | Always on, no monitoring |
| **Better Uptime** | $10/month | Advanced monitoring |
| **UptimeRobot + Render Free** | $0 | Best of both! ✅ |

---

## Expected Results

### Before UptimeRobot:
```
User visits site after 20 minutes:
→ Backend asleep
→ Wait 30-60 seconds (cold start) 😞
→ Site works
```

### After UptimeRobot:
```
User visits site anytime:
→ Backend always awake
→ Instant response ⚡
→ Site works perfectly 😊
```

---

## Quick Reference

**Health Check URL Format:**
```
https://[YOUR-BACKEND-NAME].onrender.com/api/health
```

**Recommended Settings:**
- Interval: 5 minutes
- Timeout: 30 seconds
- Alert after: 2 failures
- Method: GET

**Free Tier Limits:**
- Monitors: 50
- Check interval: 5 minutes minimum
- Alert contacts: Unlimited emails

---

## Final Checklist

- [ ] Backend deployed on Render
- [ ] Health endpoint working (`/api/health`)
- [ ] UptimeRobot account created (free)
- [ ] Monitor added with correct URL
- [ ] Monitor status shows "Up"
- [ ] Email alert contact added
- [ ] Tested after 10 minutes (still awake)

---

**🎉 Congratulations!** Your backend now stays awake 24/7 for FREE, providing instant responses to all users!

**Next Step:** Deploy your frontend on Vercel following `VERCEL_DEPLOYMENT.md`
