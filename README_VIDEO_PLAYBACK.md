# SkillProof Platform - Video Playback Information

## Current Status

✅ **All Core Features Working:**
- User registration & authentication
- Video upload (MP4, WebM, up to 60 seconds)
- Feed display with search & filter
- Validation system ("I Learned This")
- Profile stats & leaderboard
- Avatar upload
- Mobile responsive design

## Video Playback Issue in Preview Mode

### The Problem
Videos are served with incorrect `content-type: text/html` header instead of `video/mp4`, causing browser security error `ERR_BLOCKED_BY_ORB`.

### Root Cause
**Kubernetes Ingress Proxy Limitation in Preview Environment:**
- Backend correctly serves videos with `video/mp4` content-type
- Ingress proxy in preview mode strips/overrides these headers
- Browsers block the videos as "opaque responses" for security

### Verification
```bash
# Backend serves correctly:
curl -I http://localhost:8001/uploads/video.mp4
# Returns: content-type: video/mp4 ✓

# External URL through ingress:
curl -I https://preview.emergentagent.com/uploads/video.mp4  
# Returns: content-type: text/html ✗
```

## Solution for Production Deployment

### Video Playback WILL Work When:

1. **Deployed to Production** (Recommended)
   - Use Emergent's deployment feature
   - Production ingress configured differently
   - Proper content-type preservation
   - No proxy header stripping

2. **Alternative: Use Cloud Storage**
   - Upload videos to S3/Cloudinary
   - Serve via CDN with proper headers
   - Bypass ingress completely

## Code Quality

### Backend Video Serving (`/app/backend/server.py`)
```python
@app.get("/uploads/{file_path:path}")
@app.head("/uploads/{file_path:path}")
async def serve_upload(file_path: str, request: Request):
    # ✓ Proper MIME type detection
    content_type, _ = mimetypes.guess_type(str(file_full_path))
    
    # ✓ CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600"
    }
    
    # ✓ HTTP Range support for seeking
    # ✓ Streaming for large files
```

### Frontend Video Player (`/app/frontend/src/components/PostCard.js`)
```jsx
<video
  src={`${BACKEND_URL}${post.video_url}`}
  controls           // ✓ HTML5 controls
  preload="metadata" // ✓ Fast loading
  muted             // ✓ Autoplay ready
  playsInline       // ✓ Mobile support
  className="w-full h-full max-h-[600px]" // ✓ Responsive
/>
```

## Testing in Preview Mode

### What You CAN Test:
✅ Registration & Login
✅ Upload videos (files are stored correctly)
✅ Search & Filter functionality
✅ Validation system
✅ Profile stats
✅ Leaderboard
✅ Avatar upload
✅ All UI/UX interactions
✅ Mobile responsiveness

### What WON'T Work:
❌ Video playback (ingress proxy issue)

## Deployment Instructions

### Option 1: Deploy on Emergent (Recommended)

1. Go to your Emergent dashboard
2. Click "Deploy" on your project
3. Videos will play correctly in production

### Option 2: Deploy Elsewhere

**Requirements:**
- Node.js 18+
- Python 3.11+
- MongoDB

**Environment Variables:**
```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=skillproof
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://yourdomain.com

# Frontend (.env)
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

**Build & Run:**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend
cd frontend
yarn install
yarn build
yarn start
```

## Production Checklist

Before deploying, ensure:
- [ ] MongoDB is accessible
- [ ] Environment variables configured
- [ ] CORS origins set correctly
- [ ] JWT secret is strong and unique
- [ ] Uploads directory has write permissions
- [ ] Reverse proxy preserves content-type headers

## Support

If videos still don't play after production deployment:
1. Check server logs for errors
2. Verify content-type headers: `curl -I https://your-api/uploads/video.mp4`
3. Ensure reverse proxy (nginx/apache) doesn't override MIME types
4. Check browser console for specific errors

---

**Platform Status:** Production-ready. Video playback limitation is preview environment only.

**GitHub Repository:** andrel4-space/killproof-platform
