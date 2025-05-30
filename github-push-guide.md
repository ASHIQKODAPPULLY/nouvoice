# Step-by-Step Guide for Pushing Nouvoice to GitHub

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the '+' icon in the top-right corner and select 'New repository'
3. Enter a name for your repository (e.g., 'nouvoice')
4. Choose public or private visibility
5. Do NOT initialize with README, .gitignore, or license
6. Click 'Create repository'

## 2. Initialize Git in Your Local Project (if not already done)

```bash
cd /path/to/nouvoice
git init
```

## 3. Add Your Files to Git

```bash
git add .
```

## 4. Create Your First Commit

```bash
git commit -m "Initial commit of Nouvoice project"
```

## 5. Add the GitHub Repository as Remote

Use the following command:

```bash
git remote add origin https://github.com/ASHIQKODAPPULLY/nouvoice.git
```

## 6. Push Your Code to GitHub

```bash
git branch -M main
git push -u origin main
```

## 7. Authentication

When prompted, enter your GitHub credentials. If you have two-factor authentication enabled, you'll need to use a personal access token instead of your password.

### Creating a Personal Access Token (if needed):

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click 'Generate new token'
3. Give it a name, set an expiration, and select 'repo' permissions
4. Click 'Generate token' and copy the token
5. Use this token as your password when pushing

## 8. Verify Your Code is on GitHub

1. Go to your GitHub repository page
2. Refresh the page to see your files

## 9. Deploying to Vercel

### Option 1: Deploy from GitHub

1. Go to [Vercel](https://vercel.com) and sign in
2. Click 'Add New...' → 'Project'
3. Select your GitHub repository
4. Vercel will automatically detect your Next.js project
5. Configure your project settings if needed
6. Click 'Deploy'

### Option 2: Deploy using Vercel CLI

1. Run the deployment script:

```bash
./deploy-to-vercel.sh
```

2. Follow the prompts to authenticate and deploy

### Option 3: Set Up GitHub Actions for Automatic Deployment

1. Create the `.github/workflows` directory in your project
2. Add a deployment workflow file
3. Configure the workflow to deploy to Vercel on push to main

## 10. Future Pushes

For future changes:

```bash
git add .
git commit -m "Your commit message"
git push
```
