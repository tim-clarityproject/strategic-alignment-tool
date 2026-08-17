# Strategic Alignment Tool Portal

A collaborative web application for managing strategic alignment tools with real-time sync, user permissions, and version history.

## Features

- 🔐 **User Authentication** - Email/password sign-up and login via Firebase
- 📊 **Strategic Alignment Matrix** - Create and manage alignment tools
- 👥 **Permission Management** - Share tools with owners/editors/viewers
- 🔄 **Real-time Sync** - See changes instantly (via polling)
- 📜 **Version History** - Track and restore previous versions
- 🚀 **Free Hosting** - Deploy to Vercel (frontend) and Firebase (backend)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: Vercel (frontend), Firebase (database)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd strategic-alignment-tool
npm install
```

### 2. Configure Firebase

Update `src/config/firebase.js` with your Firebase credentials from the console. (Already done in this project)

### 3. Set Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only accessible to auth users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Tools collection
    match /tools/{toolId} {
      // Owner can do anything
      allow read, write: if request.auth.uid == resource.data.ownerId;
      
      // Users with permission can read/write
      allow read: if request.auth.uid != null && 
        exists(/databases/$(database)/documents/tools/$(toolId)) &&
        request.auth.uid in resource.data.permissions[*].userId;
      
      allow write: if request.auth.uid != null && 
        exists(/databases/$(database)/documents/tools/$(toolId)) &&
        get(/databases/$(database)/documents/tools/$(toolId)).data.permissions.find(p, p.userId == request.auth.uid && (p.role == "editor" || p.role == "owner")).size() > 0;
      
      // Allow creation for authenticated users
      allow create: if request.auth.uid != null && 
        request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### 4. Enable Firebase Authentication

In Firebase Console:
- Go to Authentication → Sign-in Methods
- Enable "Email/Password"

### 5. Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Go to https://vercel.com
# Import your GitHub repo
# Vercel will auto-build and deploy
```

Your app will be live at: `https://<your-project>.vercel.app`

## Usage

1. **Sign Up** - Create a new account with email/password
2. **Create Tool** - Click "Create New Tool" on dashboard
3. **Edit** - Fill in objective, critical success factors, and projects
4. **Score Projects** - Rate each project against each CSF (0-2)
5. **Share** - Invite others with viewer/editor permissions
6. **Track Progress** - Monitor project scores over time
7. **Version History** - Restore previous versions anytime

## Data Model

### Tools Collection
```
{
  name: string,
  ownerId: string,
  objective: string,
  criticalSuccessFactors: [
    { id: number, text: string }
  ],
  projects: [
    {
      id: number,
      name: string,
      scores: number[] // 0-2 for each CSF
    }
  ],
  permissions: [
    {
      userId: string,
      email: string,
      role: "owner" | "editor" | "viewer",
      addedAt: timestamp
    }
  ],
  versions: [
    {
      timestamp: timestamp,
      userId: string,
      userName: string,
      data: { objective, criticalSuccessFactors, projects }
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Cost

- **Firebase**: Free tier covers 100+ users comfortably
- **Vercel**: Free tier for static builds
- **Total Cost**: $0/month (while under free tier limits)

## Troubleshooting

**"Tool not found"** - Check that you have permission to access the tool

**"Failed to save"** - Ensure Firestore security rules are set correctly

**"Login failed"** - Check that Firebase Authentication is enabled

## Support

For issues or questions, check the Firebase console for error logs.

---

Built with ❤️ for strategic coaches and leaders.
