# 🚀 Easy Setup Guide for AfroMint

You are 5 minutes away from your own automated news site! Follow these steps exactly.

## Step 1: Create a GitHub Account (If you don't have one)
1. Go to [github.com](https://github.com) and sign up.
2. Verify your email.

## Step 2: Upload This Code
1. Create a **New Repository** on GitHub.
   - Name it `afromint` (or anything you like).
   - Select **Public**.
   - Click **Create repository**.
2. Upload the files I gave you.
   - **Easiest Way**:
     - Click "uploading an existing file" link on the GitHub setup page.
     - **IMPORTANT**: Do NOT upload the `node_modules` folder. It is too big and generated automatically.
     - **Drag and drop ONLY these:**
       - `src` folder
       - `.github` folder
       - `package.json`
       - `package-lock.json`
       - `README.md`
       - `.gitignore`
     - Wait for them to upload.
     - Box at the bottom: Type "Initial commit" and click **Commit changes**.

## Step 3: Get a Google Gemini Key (FREE)
We will use Google's Gemini because it has a generous free tier.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. **Copy the key** (starts with `AIza...`).

## Step 4: Add Key to GitHub
1. Go to your GitHub Repository page.
2. Click **Settings** (top right tab).
3. Scroll down left side menu → Click **Secrets and variables** → **Actions**.
4. Click green button **New repository secret**.
   - **Name**: `AI_API_KEY`
   - **Secret**: Paste your Gemini Key here.
5. Click **Add secret**.

## Step 5: Hosting on Netlify (To make it live)
1. Go to [netlify.com](https://www.netlify.com/).
2. Sign up with **GitHub**.
3. Click **Add new site** → **Import an existing project**.
4. Choose **GitHub**.
5. Select your `afromint` repository.
6. **Deploy Settings** (Important!):
   - **Build command**: `npm install && node src/scripts/generate.js`
   - **Publish directory**: `dist`
7. Click **Deploy Site**.

## 🎉 Done!
- Your site is now live!
- It will automatically check for news every 6 hours.
- Netlify will auto-update whenever new news is found.

## How to Change things?
- **Change News Sources**: Edit `src/scripts/config.js` on GitHub directly.
- **Change Colors**: Edit `src/styles.css`.
