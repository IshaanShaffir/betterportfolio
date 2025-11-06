# Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account (✓ already done)
- Vercel account (free)
- PostgreSQL database (Vercel Postgres or Neon)

### Step 1: Set Up Database

#### Option A: Vercel Postgres (Easiest)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Navigate to Storage → Create Database → Postgres
4. Create a new database named `portfolio`
5. Copy the `POSTGRES_PRISMA_URL` - this is your `DATABASE_URL`

#### Option B: Neon (Free Alternative)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `IshaanShaffir/betterportfolio`
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=your-database-url-here
   NEXTAUTH_SECRET=generate-random-32-char-string
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ADMIN_EMAIL=ishaanshaffir@gmail.com
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=ishaanshaffir@gmail.com
   EMAIL_SERVER_PASSWORD=mfgn fqao unxb stpz
   EMAIL_FROM=ishaanshaffir@gmail.com
   ```

6. Click **Deploy**

### Step 3: Run Database Migration

After first deployment:

1. Go to your Vercel project → Settings → Functions
2. Install Vercel CLI locally:
   ```bash
   npm i -g vercel
   ```

3. Run migration:
   ```bash
   vercel login
   vercel link
   vercel env pull .env.production
   npx prisma migrate deploy
   npx prisma db seed
   ```

OR use Vercel's build settings:
- Go to Settings → General → Build & Development Settings
- Add to "Install Command": `npm ci && npx prisma generate && npx prisma migrate deploy`

### Step 4: Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In Vercel project → Settings → Domains
3. Add your domain and follow DNS instructions

---

## Alternative: Docker Deployment (VPS/Cloud)

If you want to use Docker on a VPS (DigitalOcean, AWS, etc.):

### Prerequisites
- VPS with Docker installed
- Domain name (optional)

### Steps:

1. **SSH into your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**:
   ```bash
   git clone https://github.com/IshaanShaffir/betterportfolio.git
   cd betterportfolio
   ```

3. **Create .env file**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

4. **Run with Docker**:
   ```bash
   docker compose up -d
   ```

5. **Set up Nginx reverse proxy** (for HTTPS):
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo nano /etc/nginx/sites-available/portfolio
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable SSL**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Database migrations ran successfully
- [ ] Seed data populated
- [ ] Admin login works (test with `:dev-login` in terminal)
- [ ] Email 2FA codes are being sent
- [ ] All CRUD operations work in admin dashboard
- [ ] File uploads work (resume & profile image)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS/SSL enabled

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Random 32+ char string | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://yourdomain.com` |
| `ADMIN_EMAIL` | Your admin email | `ishaanshaffir@gmail.com` |
| `EMAIL_SERVER_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | SMTP port | `587` |
| `EMAIL_SERVER_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_SERVER_PASSWORD` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `EMAIL_FROM` | Sender email | `noreply@yourdomain.com` |

---

## Troubleshooting

### Migration fails
```bash
# Reset database and re-run migrations
npx prisma migrate reset
npx prisma db seed
```

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Make sure `DATABASE_URL` is accessible from Vercel

### 2FA emails not sending
- Verify Gmail app password is correct
- Check EMAIL_SERVER_* variables are set
- Ensure Gmail account has "Less secure app access" OR use App Password

---

## Recommended: Vercel Deployment

**Why Vercel?**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL option
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ✅ Edge network for fast global access
- ✅ Free tier (enough for portfolio)

**Cost**: FREE for personal projects!

Go to: https://vercel.com/new
