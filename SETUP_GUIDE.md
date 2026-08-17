# Complete Setup Guide - Strategic Alignment Tool

This guide walks you through deploying your Strategic Alignment Tool portal from zero to live in ~15 minutes.

## Prerequisites

- GitHub account (you already have this)
- Firebase project (you already created this)
- Vercel account (optional, but recommended)

## Step 1: Prepare the Code (You Do This)

### Option A: Copy to Your Computer
1. Download the project files to your computer
2. Open Terminal and navigate to the project folder
3. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Strategic Alignment Tool"
   ```

### Option B: I Push to GitHub for You
Send me the go-ahead and I can create the repo directly.

## Step 2: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository called `strategic-alignment-tool`
3. Make it **Private** (optional, but recommended)
4. Do NOT initialize with README, .gitignore, or license (we have these)
5. Click "Create repository"

## Step 3: Push Code to GitHub

In your Terminal, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/strategic-alignment-tool.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4: Set Firestore Security Rules

This is CRITICAL. Without these rules, the app won't work.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `strategic-alignment-tool` project
3. Click "Firestore Database" in the left sidebar
4. Click "Rules" tab at the top
5. Replace ALL the text with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tools collection
    match /tools/{toolId} {
      // Owner can do anything
      allow read, write: if request.auth.uid == resource.data.ownerId;
      
      // Users with permission can read/write
      allow read: if request.auth.uid != null && 
        exists(/databases/$(database)/documents/tools/$(toolId)) &&
        request.auth.uid in resource.data.permissions[*].userId;
      
      allow write: if request.auth.uid != null && 
        exists(/databases/$(database)/documents/tools/$(toolId));
      
      // Allow creation for authenticated users
      allow create: if request.auth.uid != null && 
        request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

6. Click "Publish" (blue button, top-right)
7. Wait for confirmation (usually instant)

## Step 5: Deploy to Vercel

### Option A: Auto-Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Click "Import Git Repository"
4. Paste your GitHub repo URL
5. Click "Import"
6. Leave all settings as defaults
7. Click "Deploy"

**Vercel will auto-build and deploy in ~2 minutes.** That's it!

Your app will be live at: `https://<project-name>.vercel.app`

### Option B: Manual Deployment

If you prefer to deploy locally:

```bash
npm install -g vercel
vercel
```

Follow the prompts. You'll get a live URL.

## Step 6: Test Your App

1. Go to your Vercel URL (e.g., `https://strategic-alignment-tool.vercel.app`)
2. Sign up with any email/password
3. Create a test tool
4. Add some critical success factors
5. Create a test project
6. Score it
7. Click "Save"
8. Click "Sharing" tab and invite another user

If everything works, you're done! 🎉

## Troubleshooting

### "Authentication failed" on login
- **Fix**: Check that Firebase Authentication is enabled
  - Go to Firebase Console → Authentication
  - Click "Sign-in method" tab
  - Make sure "Email/Password" is enabled

### "Permission denied" when saving
- **Fix**: Firestore security rules aren't set. Go back to Step 4 and make sure you published them.

### "Too many requests"
- **Fix**: This happens if you're hammering save quickly. It's normal. Wait a few seconds and try again.

### App is blank/won't load
- **Fix**: Open your browser's Developer Tools (F12) and check the Console for errors
- Look for Firebase config issues or CORS errors
- If you see Firebase errors, your credentials might be wrong

## Production Checklist

Before sharing with your coaching clients:

- [ ] Test login/signup works
- [ ] Test creating a tool works
- [ ] Test saving works
- [ ] Test sharing works
- [ ] Set a custom domain (optional, Vercel docs for this)
- [ ] Enable HTTPS (Vercel does this automatically)

## Costs

**This setup is FREE.**

- Firebase: Free tier covers 100+ users
- Vercel: Free tier covers unlimited deployments
- GitHub: Free for public and private repos

If you scale to 1000s of users, costs might appear—but you'll have plenty of warning.

## Next Steps

1. Share the app URL with your coaching clients
2. They sign up and create their own tools
3. You can view their tools if they grant access
4. Use version history to track changes over time

## Need Help?

Check these resources:
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [React Router Docs](https://reactrouter.com)

---

**You're set!** Your Strategic Alignment Tool is now live. 🚀
