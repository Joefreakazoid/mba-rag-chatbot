# Vercel Environment Variables Setup Guide

## Prerequisites
- Vercel project created at: https://mba-rag-chatbot.vercel.app
- GitHub repository connected: Joefreakazoid/mba-rag-chatbot

## Step-by-Step Setup

### 1. Navigate to Project Settings
1. Go to https://vercel.com/dashboard
2. Click on your project: **mba-rag-chatbot**
3. Click **Settings** tab (top navigation)
4. Click **Environment Variables** (left sidebar)

### 2. Add Each Environment Variable

Copy and paste each line below into Vercel. For each one:
1. Click **Add New** button
2. Paste the name and value (see `.env` file for actual values)
3. Select environment: **Production**
4. Click **Save**

**Critical Variables** (API will fail without these):

```
Name: JWT_SECRET
Value: [from .env JWT_SECRET]

Name: ADMIN_EMAIL
Value: [from .env ADMIN_EMAIL]

Name: ADMIN_PASSWORD
Value: [from .env ADMIN_PASSWORD]

Name: DATABASE_URL
Value: [from .env DATABASE_URL]
```

**LLM Variables** (for AI responses):

```
Name: LLM_BASE_URL
Value: [from .env LLM_BASE_URL]

Name: LLM_API_KEY
Value: [from .env LLM_API_KEY - DO NOT SHARE PUBLICLY]

Name: LLM_MODEL
Value: [from .env LLM_MODEL]
```

**Storage Variables** (for document uploads):

```
Name: SUPABASE_URL
Value: [from .env SUPABASE_URL]

Name: SUPABASE_KEY
Value: [from .env SUPABASE_KEY - DO NOT SHARE PUBLICLY]

Name: SUPABASE_BUCKET
Value: [from .env SUPABASE_BUCKET]
```

### 3. Verify All Variables Are Set
After adding all 11 variables, your environment should show:
- ✓ JWT_SECRET
- ✓ ADMIN_EMAIL
- ✓ ADMIN_PASSWORD
- ✓ DATABASE_URL
- ✓ LLM_BASE_URL
- ✓ LLM_API_KEY
- ✓ LLM_MODEL
- ✓ SUPABASE_URL
- ✓ SUPABASE_KEY
- ✓ SUPABASE_BUCKET

### 4. Redeploy Application
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **Redeploy** button (or wait for automatic redeploy)
4. Check deployment status - should say "Ready" when complete (2-3 minutes)

### 5. Test the Application
1. Visit https://mba-rag-chatbot.vercel.app/login
2. Enter credentials:
   - Email: `judoabasi@gmail.com`
   - Password: `Ab@s11freke`
3. Should redirect to `/admin` page after successful login

## Troubleshooting

### Login still shows "Invalid credentials"
- Check all 11 environment variables are exactly as shown above
- Verify **JWT_SECRET**, **ADMIN_EMAIL**, and **ADMIN_PASSWORD** especially
- Check that values don't have extra spaces
- Redeploy after adding variables

### API returns 404
- Ensure **DATABASE_URL** is set and contains full connection string
- Check Vercel deployment logs for build errors
- Verify `api/index.cjs` was generated during build

### Database connection fails
- Test DATABASE_URL locally: `psql <DATABASE_URL>`
- Verify Supabase project is active
- Check if IP whitelist is enabled (allow all IPs for testing)

## Notes
- All values are from local `.env` file
- **Never commit these values to public repository**
- Vercel environments are private and encrypted
- Regenerate API keys if they are ever exposed
