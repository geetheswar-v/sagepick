<div align="center">

# SagePick

### AI-Powered Movie Discovery & Recommendation Platform

[![Live Demo](https://img.shields.io/badge/Live-www.sagepick.in-blue?style=for-the-badge)](https://www.sagepick.in)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

_Discover your next favorite movie through intelligent recommendations, agentic AI search, and personalized preferences._

[Live Demo](https://www.sagepick.in) • [Core Service](https://github.com/saiteja-velpula/sagepick.core) • [AI Service](https://github.com/sairohith24816/sagepick.ai_service) • [Infrastructure](https://github.com/geetheswar-v/sagepick.infra)

</div>

---

## Overview

**SagePick** is a comprehensive movie discovery platform that combines the power of AI-driven recommendations with a sleek, modern interface. Built with Next.js 15 and backed by a sophisticated microservices architecture, SagePick helps users find movies tailored to their unique tastes through intelligent search, personalized recommendations, and advanced filtering capabilities.

### Key Features

- **Agentic AI Search** - Natural language movie search powered by advanced AI agents
- **Smart Recommendations** - Cold-start and personalized recommendation algorithms
- **Rich Movie Database** - Comprehensive movie data synchronized with TMDB
- **Favorites & Watchlists** - Organize and track your movie journey
- **Ratings & Reviews** - Rate and review movies you've watched
- **Beautiful UI** - Modern, responsive interface built with Radix UI and Tailwind CSS
- **Secure Authentication** - Email/password authentication with Better Auth
- **Multi-language Support** - Discover movies across different languages and regions
- **Genre-based Discovery** - Browse movies by genres, release years, and more
- **Advanced Search** - Multiple search modes (local DB, TMDB sync, AI-powered)

---

## Architecture

SagePick follows a modern microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                          │
│              User Interface & Client-Side Logic                  │
│          Authentication • Forms • Movie Display                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────────┐
        │                     │                 │
        ▼                     ▼                 ▼
┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│   Prisma     │    │   Core API   │   │  AI Service  │
│  PostgreSQL  │    │   (Python)   │   │   (Python)   │
│              │    │              │   │              │
│  • Users     │    │  • Movies    │   │  • Train     │
│  • Ratings   │    │  • Genres    │   │  • Inference │
│  • Watchlist │    │  • TMDB Sync │   │  • Agents    │
│  • Favorites │    │  • Discovery │   │  • Search    │
└──────────────┘    └──────────────┘   └──────────────┘
                             │                  │
                             └────────┬─────────┘
                                      │
                              ┌───────▼────────┐
                              │   MinIO/S3     │
                              │ Object Storage │
                              │  • Datasets    │
                              └────────────────┘
```

### Related Services

| Service            | Description                                                                        | Repository                                                                   |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Core Service**   | FastAPI backend handling movie data, TMDB synchronization, and discovery workflows | [sagepick.core](https://github.com/saiteja-velpula/sagepick.core)            |
| **AI Service**     | ML-powered recommendation engine with training and inference capabilities          | [sagepick.ai_service](https://github.com/sairohith24816/sagepick.ai_service) |
| **Infrastructure** | Docker-based infrastructure setup with deployment webhooks                         | [sagepick.infra](https://github.com/geetheswar-v/sagepick.infra)             |

---

## Application Workflow

### 1. User Onboarding Flow

```
Sign Up → Email Verification → Onboarding Preferences → Personalized Home
```

- Users create an account with email/password
- Complete preference survey (genres, languages, release year ranges)
- System generates cold-start recommendations based on preferences

### 2. Movie Discovery Flow

```
Browse/Search → Movie Details → Add to Watchlist/Favorites → Rate & Review
```

**Search Modes:**

- **Local Search**: Fast search against indexed database
- **TMDB Search**: Real-time search with auto-sync to local DB
- **AI Agent Search**: Natural language queries processed by AI agents

### 3. Recommendation Flow

```
User Interactions → AI Model Training → Personalized Recommendations → Continuous Learning
```

- Cold-start recommendations for new users (0-14 interactions)
- Collaborative filtering for active users
- Periodic model retraining with new data

### 4. Data Synchronization Flow

```
TMDB API → Core Service Scheduler → PostgreSQL → Dataset Export (S3/MinIO)
```

- APScheduler-driven background jobs
- Weekly movie discovery and category refresh
- Automated dataset snapshots to object storage

---

## Tech Stack

### Frontend

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Radix UI
- **Forms**: React Hook Form + Zod validation
- **Auth**: Better Auth 1.3
- **State Management**: React Server Components + Client Components

### Backend & Database

- **Database**: PostgreSQL (via Prisma ORM)
- **API Integration**: REST APIs to Core & AI services
- **Authentication**: bcryptjs password hashing
- **Email**: Nodemailer for transactional emails

### UI Components

- **Component Library**: shadcn/ui
- **Icons**: Lucide React
- **Carousels**: Embla Carousel
- **Notifications**: Sonner toast
- **Dialogs & Dropdowns**: Radix UI primitives

---

## Installation & Setup

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 15+
- **npm/yarn/pnpm**

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sagepick"

# Authentication
BETTER_AUTH_SECRET="your-256-bit-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Email (for verification emails)
EMAIL_FROM="noreply@sagepick.in"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Core Service API
CORE_SERVICE_URL="https://core.sagepick.in"
CORE_SERVICE_BEARER_TOKEN="your-core-service-token"

# AI Service API
AI_SERVICE_URL="https://ai.sagepick.in"
NEXT_PUBLIC_AI_SERVICE_URL="https://ai.sagepick.in"
```

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/geetheswar-v/sagepick.git
   cd sagepick
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy

   # (Optional) Seed the database
   npm run db:seed
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Database Management

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio

# Seed the database
npm run db:seed
```

---

## Key Features Deep Dive

### AI-Powered Search

Natural language movie search using agentic AI:

```typescript
// Example: "Show me emotional sci-fi movies like Interstellar"
const results = await agentSearch(query);
// Returns: Curated list with AI-generated explanations
```

The AI agent can:

- Understand complex, conversational queries
- Perform research across multiple data sources
- Provide contextual recommendations
- Explain reasoning behind suggestions

### Smart Recommendations

**Cold Start Algorithm**:

- For users with 0-14 interactions
- Based on preference survey (genres, languages, release years)
- Generates initial personalized feed

**Collaborative Filtering**:

- For active users with 15+ interactions
- Learns from ratings, watchlist, and favorites
- Periodic model retraining in AI service

### Movie Discovery

Multiple discovery modes:

- **Trending**: Sorted by popularity
- **Top Rated**: High-quality movies with substantial votes
- **Recent Releases**: Movies from the past 6 months
- **By Genre**: Filter by specific genres
- **By Language**: Bollywood, Hollywood, regional cinema

### Personal Collections

- **Watchlist**: Track movies you plan to watch with status tracking
- **Favorites**: Quick access to beloved movies
- **Ratings**: Rate movies on a scale and write reviews

---

## Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

### Environment Setup

Ensure all production environment variables are configured:

- Database connection string
- API service URLs and tokens
- Authentication secrets
- Email SMTP configuration

### Recommended Platforms

- **Frontend**: Vercel, Netlify, AWS Amplify
- **Database**: PostgreSQL on AWS RDS, Supabase, or Neon
- **Core & AI Services**: Docker containers on AWS ECS, GCP Cloud Run, or Azure Container Apps

---

## Contributors

This project is built and maintained by:

**[VEDACHALAM GEETHESWAR](https://github.com/geetheswar-v)**  
_FullStack Developer & DevOps_  
Responsible for frontend development, system architecture, and deployment infrastructure.

**[Sai Teja Velpula](https://github.com/saiteja-velpula)**  
_Data Engineer_  
Responsible for backend services, data pipelines, and TMDB synchronization workflows.

**[GALAM SAI ROHITH](https://github.com/sairohith24816)**  
_AI/ML Engineer_  
Responsible for recommendation algorithms, model training, and AI-powered search features.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Links

- **Live Application**: [www.sagepick.in](https://www.sagepick.in)
- **Core Service**: [github.com/saiteja-velpula/sagepick.core](https://github.com/saiteja-velpula/sagepick.core)
- **AI Service**: [github.com/sairohith24816/sagepick.ai_service](https://github.com/sairohith24816/sagepick.ai_service)
- **Infrastructure**: [github.com/geetheswar-v/sagepick.infra](https://github.com/geetheswar-v/sagepick.infra)

---

<div align="center">

**Built by the SagePick Team**

</div>
