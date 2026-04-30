# GitHub Deployment Quick Start

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in to your account
2. Click the **+** icon (top right) → **New repository**
3. Enter repository name: `AI_Filteration`
4. Add description: `AI Resume Filtering & Recruitment Management System`
5. Choose **Public** or **Private**
6. Click **Create repository**

## Step 2: Push Code to GitHub

After creating the empty GitHub repository, run these commands:

```bash
cd c:\Users\abhin\Desktop\AI_filteration

# Add GitHub as remote (replace USERNAME/REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/AI_Filteration.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Verify Upload

1. Go to your GitHub repository URL
2. You should see all your files uploaded
3. The repository is now ready for deployment

## Next Steps: Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to:
- **Render.com** (Free tier available)
- **Railway.app** 
- **Heroku** (Paid)
- Other hosting platforms

## Important: Configure Environment Variables

Before deploying, create `.env` files with your actual API keys:

**Backend (`backend/.env`)**:
```env
MONGO_URI=your-mongodb-atlas-connection-string
MONGO_DB=ai_filter
SECRET_KEY=your-32-char-random-secret
JWT_SECRET_KEY=your-32-char-random-jwt-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
SIMILARITY_THRESHOLD=0.65
GEMINI_API_KEY=your-google-gemini-api-key
PORT=5000
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Making Updates

After initial deployment, use this workflow:

```bash
# Make your changes...

git add .
git commit -m "Your commit message"
git push origin main

# Your deployment platform will automatically redeploy
```

## Troubleshooting

**Error: "fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/AI_Filteration.git
```

**Error: "Permission denied (publickey)"**
- Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**Error: "Not a git repository"**
```bash
cd c:\Users\abhin\Desktop\AI_filteration
git init
```

## Support

For detailed deployment help, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [README.md](./README.md) - Project documentation
- [GitHub Docs](https://docs.github.com)

---

**You're all set! Your project is now version controlled and ready for deployment! 🚀**
