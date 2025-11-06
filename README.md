# Portfolio Website - Next.js 14 + PostgreSQL + Admin Dashboard

A modern, data-driven portfolio website built with Next.js 14, featuring a secure admin dashboard for content management and email-based 2FA authentication.

## ✨ Features

- **Modern Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database-Driven**: PostgreSQL + Prisma ORM for dynamic content
- **Admin Dashboard**: Full CRUD management for Projects, Experience, and Skills
- **Secure Authentication**: Custom JWT-based session with email 2FA
- **Interactive Terminal**: Hero terminal with `:dev-login` command for admin access
- **Dockerized**: Complete Docker setup for easy deployment
- **Dark/Light Theme**: Seamless theme switching with Tailwind
- **Responsive Design**: Mobile-first, fully responsive layout
- **Smooth Animations**: Framer Motion for polished transitions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose (for containerized setup)
- PostgreSQL (if running locally without Docker)

### Environment Setup

1. Clone the repository and copy the environment template:

```bash
cp .env.example .env
```

2. Configure your `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio?schema=public"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Admin Email (receives 2FA codes)
ADMIN_EMAIL="your-email@example.com"

# Email Server (SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Portfolio Admin <your-email@gmail.com>"
```

> **Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### Development (Local)

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Start PostgreSQL (if not using Docker):

```bash
# Using Docker for just the database
docker run --name portfolio-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

3. Run database migrations:

```bash
npx prisma migrate deploy
```

4. Seed the database with initial data:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio.

### Development (Docker)

1. Build and start all services:

```bash
docker compose up --build
```

2. In a new terminal, run migrations and seed:

```bash
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed
```

3. Access your portfolio at [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

### Login Flow

1. Navigate to the homepage
2. Click on the **floating terminal** in the hero section
3. Type `:dev-login` and press Enter
4. Check your email (ADMIN_EMAIL) for a 6-digit verification code
5. Enter the code in the terminal
6. You'll be redirected to `/admin` with full access

### Terminal Commands

- `:dev-login` - Start admin authentication flow
- `:admin` - Navigate to admin dashboard (requires login)
- `:logout` - End admin session
- `:help` - Show available commands

### Admin Dashboard Features

**Projects Tab:**

- Add/Edit/Delete projects
- Manage tech stack, URLs, descriptions
- Set featured projects and display order

**Experience Tab:**

- Add/Edit/Delete work experiences
- Date range management (with "Present" for current roles)
- Bullet points for responsibilities/achievements

**Skills Tab:**

- Create skill categories (Languages, Frameworks, etc.)
- Add skills to categories
- Reorder categories and skills

## 📁 Project Structure

```
betterportfolio/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── projects/          # Projects CRUD
│   │   ├── experiences/       # Experiences CRUD
│   │   └── skills/            # Skills & categories CRUD
│   ├── admin/                 # Admin dashboard page
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles
├── components/
│   ├── Navbar.tsx             # Navigation
│   ├── Hero.tsx               # Interactive terminal hero
│   ├── About.tsx              # About section
│   ├── Projects.tsx           # Projects section (data-driven)
│   ├── Experience.tsx         # Experience & skills (data-driven)
│   ├── Contact.tsx            # Contact section and footer
│   └── CursorGlow.tsx         # Cursor effect
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── session.ts             # JWT session management
│   └── email.ts               # Email sending utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage production build
└── .env.example               # Environment template
```

## 🗄️ Database Schema

### Models

- **Project**: Portfolio projects with tech stack, URLs, descriptions
- **Experience**: Work history with date ranges and bullet points
- **SkillCategory**: Groupings like "Languages", "Frameworks"
- **Skill**: Individual skills linked to categories
- **AdminUser**: Admin account (email only)
- **AdminLoginCode**: 2FA codes with expiration

### Relationships

- SkillCategory → Skills (one-to-many, cascade delete)
- Skill → SkillCategory (many-to-one)
- AdminUser → AdminLoginCodes (one-to-many, cascade delete)

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🔧 API Routes

### Authentication

- `POST /api/auth/request-code` - Request 2FA code
- `POST /api/auth/verify-code` - Verify code and create session
- `POST /api/auth/logout` - End admin session
- `GET /api/auth/session` - Check authentication status

### Projects

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/[id]` - Update project (admin)
- `DELETE /api/projects/[id]` - Delete project (admin)

### Experiences

- `GET /api/experiences` - List all experiences
- `POST /api/experiences` - Create experience (admin)
- `PUT /api/experiences/[id]` - Update experience (admin)
- `DELETE /api/experiences/[id]` - Delete experience (admin)

### Skills

- `GET /api/skills/categories` - List categories with skills
- `POST /api/skills/categories` - Create category (admin)
- `PUT /api/skills/categories/[id]` - Update category (admin)
- `DELETE /api/skills/categories/[id]` - Delete category (admin)
- `POST /api/skills` - Create skill (admin)
- `PUT /api/skills/[id]` - Update skill (admin)
- `DELETE /api/skills/[id]` - Delete skill (admin)

## 🚢 Deployment

### Docker Production

1. Build the production image:

```bash
docker compose -f docker-compose.yml build
```

2. Deploy to your server:

```bash
docker compose up -d
```

3. Run migrations on first deploy:

```bash
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed
```

### Vercel (Alternative)

1. Push to GitHub
2. Import project to Vercel
3. Add a PostgreSQL database (Vercel Postgres or external)
4. Set environment variables in Vercel dashboard
5. Deploy!

> **Note**: You'll need to run migrations manually on Vercel's build step or use Vercel's Postgres migration tools.

## 🎨 Customization

### Adding New Content

1. **Projects**: Use the admin dashboard or add directly to `prisma/seed.ts`
2. **Experiences**: Same as projects
3. **Skills**: Create categories first, then add skills
4. **Styling**: Tailwind classes in components, theme colors in `tailwind.config.ts`

### Personal Information

Update the following files with your information:

1. **Hero Section** (`components/Hero.tsx`):

   - Update name, title, and description
   - Change social media links (GitHub, LinkedIn, Email)
   - Replace portrait image URL

2. **About Section** (`components/About.tsx`):

   - Modify personal story and interests
   - Update quick facts (location, education, etc.)

3. **Contact Section** (`components/Contact.tsx`):
   - Update email address
   - Change social media links

### Changing Theme Colors

Edit `tailwind.config.ts`:

```js
colors: {
  'accent-cyan': '#06b6d4',      // Primary accent
  'accent-purple': '#8b5cf6',    // Secondary accent
  'dark-bg': '#0a0a0f',          // Dark background
  'light-bg': '#f5f5f7',         // Light background
  // ... add more
}
```

### Resume

Place your resume PDF in the `/public` folder:

- Name it `resume.pdf`
- The download link in the Hero section will automatically work

## 🔒 Security Notes

- Sessions expire after 30 days
- 2FA codes expire after 10 minutes
- Admin session stored in httpOnly cookie
- All admin routes protected with JWT verification
- SMTP credentials should use app passwords, not plain passwords
- Never commit `.env` file to version control

## Tech Stack

- **Framework**: Next.js 14.2.3 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM 6.19.0
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion 11.0.8
- **Authentication**: Custom JWT with jose
- **Email**: nodemailer 6.10.1
- **Icons**: React Icons 5.0.1
- **Fonts**: Inter & JetBrains Mono (Google Fonts)
- **Containerization**: Docker + Docker Compose

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or feedback, reach out via the contact form on the portfolio or email directly.

---

**Built with ❤️ by Ishaan Shaffir**
