# Deployment Guide

## GitHub Setup

### 1. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `AI_Filteration` (or your preferred name)
   - **Description**: AI Resume Filtering & Recruitment Management System
   - **Visibility**: Choose `Public` or `Private` based on your preference
   - Leave other options as default
5. Click **Create repository**

### 2. Initialize Git Locally

```bash
cd c:\Users\abhin\Desktop\AI_filteration

# Initialize git repository
git init

# Add all files (respecting .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: AI Resume Filtering & Recruitment Management System"

# Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (optional, GitHub uses 'main' by default now)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 3. First-Time Setup (If Not Already Done)

If you haven't configured Git before:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Environment Variables Setup

### For MongoDB Atlas (Remote Database)

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster and database user
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
4. Create `backend/.env` file:

```env
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=ai_filter
SECRET_KEY=your-very-secret-key-min-32-chars-long
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
SIMILARITY_THRESHOLD=0.65
GEMINI_API_KEY=your-gemini-api-key-from-google
PORT=5000
```

### For Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## Deployment Options

### Option 1: Render.com (Recommended for Free Tier)

**Backend Deployment:**

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `ai-filteration-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt && cd backend && python -m scripts.seed_sample_data`
   - **Start Command**: `cd backend && python run.py`
6. Add Environment Variables from your `.env` file
7. Deploy

**Frontend Deployment:**

1. In Render dashboard, click **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-filteration-web`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Add Environment Variable:
   - **VITE_API_URL**: `https://your-backend-url.onrender.com/api`
5. Deploy

### Option 2: Railway.app

1. Go to [railway.app](https://railway.app)
2. Sign up and create new project
3. Connect GitHub repository
4. Configure environment variables
5. Deploy

### Option 3: Heroku (Paid - Free tier discontinued)

See Heroku documentation for deployment instructions.

### Option 4: Self-Hosted (AWS, DigitalOcean, etc.)

For advanced users, see individual provider documentation.

## Post-Deployment Steps

1. **Seed Database**:
   ```bash
   # In your backend server terminal or via admin panel
   python -m scripts.seed_sample_data
   ```

2. **Test Login**:
   - Admin: `admin@company.com` / `admin123`
   - User: `alice@example.com` / `user123`

3. **Monitor Logs**: Check your deployment platform's logs for any errors

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `MONGO_DB` | Database name | `ai_filter` |
| `SECRET_KEY` | Flask secret key | 32+ character random string |
| `JWT_SECRET_KEY` | JWT signing key | 32+ character random string |
| `CORS_ORIGINS` | Allowed frontend URLs | `http://localhost:5173,...` |
| `SIMILARITY_THRESHOLD` | Resume similarity threshold | `0.65` |
| `GEMINI_API_KEY` | Google Gemini API key | Your API key |
| `PORT` | Backend server port | `5000` |

## Troubleshooting

### Login Failing After Deployment

- Verify `MONGO_URI` and `MONGO_DB` are correct
- Run seed script to populate initial data
- Check backend logs for errors

### Frontend Can't Connect to Backend

- Verify `CORS_ORIGINS` includes your frontend URL
- Check `VITE_API_URL` environment variable in frontend
- Ensure backend is running and accessible

### API Key Quota Exceeded

- Upgrade your Gemini API to paid plan
- Check API usage in Google Cloud Console

## GitHub Workflow for Updates

After initial setup, use this workflow for future updates:

```bash
# Make changes to your code
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Describe your changes here"

# Push to GitHub
git push origin main

# Your deployment platform will automatically pull and redeploy
```

## Security Notes

⚠️ **Never commit `.env` file** - Always use `.env.example` as a template

✅ **Good practices**:
- Use strong, random values for SECRET_KEY and JWT_SECRET_KEY
- Keep API keys secure and rotate them regularly
- Use HTTPS only in production
- Enable 2FA on GitHub
- Review GitHub security settings regularly

## Support & Resources

- [GitHub Docs](https://docs.github.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Render.com Documentation](https://render.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [React Docs](https://react.dev)
- [Flask Docs](https://flask.palletsprojects.com)
