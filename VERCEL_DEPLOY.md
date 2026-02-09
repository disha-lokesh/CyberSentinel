# 🚀 Vercel Deployment Guide

## ✅ Code Pushed to GitHub!

**Repository**: https://github.com/disha-lokesh/CyberSentinel

---

## 🔧 Deploy to Vercel

### Option 1: Auto Deploy (Recommended)

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: **disha-lokesh/CyberSentinel**
4. Click **"Import"**

### Configure Build Settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Add Environment Variable:

In Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - **Environment**: Production, Preview, Development

3. Click **"Save"**
4. Click **"Redeploy"** to apply changes

---

## 🔍 Troubleshooting 404 Errors

### If you see 404 on routes:

The `vercel.json` file is already configured to handle SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes redirect to index.html for client-side routing.

### If build fails:

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (should be 18+)

---

## 📝 Post-Deployment Checklist

After deployment:

1. ✅ Visit your Vercel URL
2. ✅ Check if app loads
3. ✅ Test Red Team attacks
4. ✅ Verify Blue Team responses
5. ✅ Check all navigation links
6. ✅ Test workflow view
7. ✅ Verify reporting page

---

## 🔐 Security Notes

### Environment Variables:

- ✅ `.env.local` is in `.gitignore` (not pushed to GitHub)
- ✅ `.env.example` provided for reference
- ✅ API key must be set in Vercel dashboard

### API Key Setup:

1. Never commit `.env.local` to GitHub
2. Always use Vercel environment variables
3. Regenerate API key if accidentally exposed

---

## 🎯 Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration instructions

---

## 🔄 Auto-Deploy on Push

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build the project
3. Deploy to production
4. Update your live URL

---

## 📊 Monitoring

Check deployment status:
- **Dashboard**: https://vercel.com/dashboard
- **Deployments**: See all builds and logs
- **Analytics**: View traffic and performance

---

## ⚡ Quick Commands

### Local Development:
```bash
npm run dev
```

### Build Locally:
```bash
npm run build
npm run preview
```

### Deploy to Vercel:
```bash
# Just push to GitHub
git push origin main
```

---

## 🆘 Common Issues

### Issue: "Module not found"
**Solution**: Run `npm install` and push `package-lock.json`

### Issue: "Build failed"
**Solution**: Check Vercel build logs for specific error

### Issue: "API key not working"
**Solution**: 
1. Check environment variable name: `VITE_GEMINI_API_KEY`
2. Redeploy after adding env var
3. Verify API key is valid

### Issue: "404 on refresh"
**Solution**: Already fixed with `vercel.json` rewrites

---

## ✅ Deployment Complete!

Your CyberSentinel platform is now:
- ✅ Pushed to GitHub
- ✅ Ready for Vercel deployment
- ✅ Configured for SPA routing
- ✅ Environment variables documented

**Next**: Deploy on Vercel and add your API key! 🚀

---

**GitHub**: https://github.com/disha-lokesh/CyberSentinel
**Vercel**: https://vercel.com/new
