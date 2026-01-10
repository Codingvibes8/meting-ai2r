# AI Meeting Summarizer

An intelligent meeting summarization application that transforms audio recordings into structured summaries, action items, and insights using AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)

## Features

### Core Functionality

- **Audio Upload & Processing** - Upload meeting recordings in various formats (MP3, WAV, M4A) up to 100MB
- **AI-Powered Transcription** - Automatic speech-to-text conversion using OpenAI
- **Intelligent Summarization** - Generate structured meeting summaries with key points and decisions
- **Action Item Extraction** - Automatically identify and extract action items with assignees and priorities
- **Meeting Analytics** - Track meeting patterns, duration trends, and action item completion rates

### User Experience

- **Dashboard Overview** - Quick access to recent meetings, stats, and pending action items
- **Meeting Management** - Organize, search, and browse through meeting history
- **Real-time Processing** - Live status updates during audio processing
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode Support** - Full dark mode support with system preference detection

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Shadcn/ui** | Modern, accessible UI components |
| **Recharts** | Data visualization for analytics |
| **Lucide React** | Beautiful icon library |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Server-side API endpoints |
| **Neon PostgreSQL** | Serverless PostgreSQL database |
| **Drizzle ORM** | Type-safe database operations |

### AI & Processing

| Technology | Purpose |
|------------|---------|
| **Vercel AI SDK** | AI integration and streaming |
| **OpenAI GPT-4o-mini** | Meeting summarization and analysis |

### Authentication

| Technology | Purpose |
|------------|---------|
| **NextAuth.js v5** | Authentication system |
| **Drizzle Adapter** | Database session storage |
| **Google OAuth** | Social login integration |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Neon PostgreSQL database account
- OpenAI API key
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd meting-ai2r
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

   Then configure your `.env.local`:

   ```env
   # Database (Required)
   # Get this from your Neon dashboard
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

   # Authentication (Required)
   # Generate with: openssl rand -base64 32
   AUTH_SECRET="your-auth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (Optional but recommended)
   # Get these from Google Cloud Console
   AUTH_GOOGLE_ID="your-google-client-id"
   AUTH_GOOGLE_SECRET="your-google-client-secret"

   # OpenAI (Required for AI features)
   # Get this from platform.openai.com
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Set up the database**

   Push the schema to your Neon database:

   ```bash
   npm run db:push
   ```

   Optionally, open Drizzle Studio to view your database:

   ```bash
   npm run db:studio
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

### Setting Up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste it as `DATABASE_URL` in your `.env.local`

## Usage

### Uploading Meetings

1. Navigate to the **Upload** page from the dashboard
2. Click or drag to upload your audio file (MP3, WAV, M4A supported, max 100MB)
3. Enter meeting details:
   - **Title** (required) - Name of the meeting
   - **Date** - When the meeting occurred
   - **Participants** - Comma-separated list of attendees
   - **Description** - Brief meeting agenda or notes
4. Click **Upload & Process**
5. Wait for AI processing to complete (typically 1-2 minutes)

### Viewing Summaries

1. Go to the **Dashboard** to see recent meetings
2. Click on any meeting to view its detailed summary
3. Review the generated content:
   - **Summary** - Concise overview of the meeting
   - **Key Points** - Important topics discussed
   - **Decisions** - Agreements and conclusions reached
   - **Action Items** - Tasks with assignees and priorities
4. Switch to **Transcript** tab to view the full transcription

### Analytics Dashboard

1. Visit the **Analytics** page
2. View aggregate statistics:
   - Total meetings and completion status
   - Total and average meeting duration
   - Action items created and completed
   - Completion rate trends
3. Analyze charts:
   - Meetings per month (bar chart)
   - Average duration trends (line chart)

## Project Structure

```
meting-ai2r/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard route group (authenticated)
│   │   ├── layout.tsx           # Dashboard layout with header
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── upload/              # Meeting upload page
│   │   ├── meetings/            # Meetings list
│   │   │   └── [id]/           # Individual meeting details
│   │   └── analytics/           # Analytics dashboard
│   ├── api/                     # API routes
│   │   ├── auth/[...nextauth]/ # NextAuth handlers
│   │   ├── meetings/           # Meetings CRUD
│   │   │   └── [id]/          # Single meeting operations
│   │   ├── process/            # AI processing endpoint
│   │   └── analytics/          # Analytics data endpoint
│   ├── auth/                    # Authentication pages
│   │   └── signin/             # Sign-in page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── ui/                     # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── header.tsx              # Navigation header
│   ├── providers.tsx           # Context providers
│   └── analytics-charts.tsx    # Recharts components
├── lib/                        # Utilities and configurations
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Database connection
│   ├── schema.ts               # Drizzle schema definitions
│   └── utils.ts                # Helper functions
├── types/                      # TypeScript type definitions
│   └── next-auth.d.ts         # NextAuth type extensions
├── drizzle/                    # Database migrations (generated)
├── middleware.ts               # Auth middleware
├── drizzle.config.ts          # Drizzle configuration
├── tailwind.config.ts         # Tailwind configuration
├── components.json            # Shadcn/ui configuration
└── package.json
```

## API Reference

### Meetings

#### List Meetings
```http
GET /api/meetings
```

Returns all meetings for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Weekly Standup",
    "description": "Team sync meeting",
    "date": "2024-01-15T10:00:00Z",
    "duration": 30,
    "status": "completed",
    "participants": "[\"John\", \"Jane\"]",
    "summary": { ... },
    "actionItems": [ ... ]
  }
]
```

#### Create Meeting
```http
POST /api/meetings
Content-Type: multipart/form-data
```

**Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | No | Audio file (MP3, WAV, M4A) |
| `title` | string | Yes | Meeting title |
| `description` | string | No | Meeting description |
| `participants` | string | No | Comma-separated names |
| `date` | string | Yes | ISO date string |

#### Get Meeting
```http
GET /api/meetings/:id
```

Returns a single meeting with summary and action items.

#### Update Meeting
```http
PUT /api/meetings/:id
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "date": "2024-01-16T10:00:00Z",
  "participants": ["John", "Jane", "Bob"]
}
```

#### Delete Meeting
```http
DELETE /api/meetings/:id
```

### Processing

#### Process Meeting
```http
POST /api/process
Content-Type: application/json
```

**Body:**
```json
{
  "meetingId": "uuid",
  "transcript": "Optional transcript text..."
}
```

Triggers AI processing for a meeting. If no transcript is provided, a demo transcript is used.

### Analytics

#### Get Analytics
```http
GET /api/analytics
```

**Response:**
```json
{
  "totalMeetings": 25,
  "completedMeetings": 23,
  "totalDuration": 750,
  "totalActionItems": 45,
  "completedActionItems": 30
}
```

## Database Schema

### Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | User's display name |
| email | TEXT | Unique email address |
| emailVerified | TIMESTAMP | Email verification date |
| image | TEXT | Profile image URL |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last update date |

#### meetings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to users |
| title | TEXT | Meeting title |
| description | TEXT | Meeting description |
| date | TIMESTAMP | Meeting date |
| duration | INTEGER | Duration in minutes |
| participants | TEXT | JSON array of names |
| audioUrl | TEXT | Audio file URL |
| audioFileName | TEXT | Original filename |
| status | TEXT | pending/processing/completed/failed |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

#### summaries
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| meetingId | UUID | Foreign key to meetings |
| transcript | TEXT | Full transcription |
| summary | TEXT | AI-generated summary |
| keyPoints | TEXT | JSON array of key points |
| decisions | TEXT | JSON array of decisions |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

#### action_items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| meetingId | UUID | Foreign key to meetings |
| title | TEXT | Action item title |
| description | TEXT | Detailed description |
| assignee | TEXT | Person responsible |
| dueDate | TIMESTAMP | Due date |
| priority | TEXT | low/medium/high |
| completed | BOOLEAN | Completion status |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Configure environment variables in the Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to update these for production:

```env
NEXTAUTH_URL="https://yourdomain.com"
AUTH_GOOGLE_ID="production-google-client-id"
AUTH_GOOGLE_SECRET="production-google-client-secret"
```

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Railway** - Connect GitHub repo and add environment variables
- **Render** - Create a Web Service from your repository
- **AWS Amplify** - Import from GitHub and configure build settings
- **Docker** - Build with `npm run build` and serve with `npm start`

## Troubleshooting

### Common Issues

**"DATABASE_URL environment variable is not set"**
- Ensure you've created `.env.local` with your Neon connection string
- Restart the development server after adding environment variables

**"No Google OAuth credentials"**
- The app works without Google OAuth, but sign-in will fail
- Set up Google OAuth credentials in Google Cloud Console

**"AI processing failed"**
- Check that your `OPENAI_API_KEY` is valid and has credits
- Ensure your API key has access to the `gpt-4o-mini` model

**Build fails with TypeScript errors**
- Run `npm install` to ensure all dependencies are installed
- Check that your Node.js version is 18 or higher

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review Next.js [documentation](https://nextjs.org/docs)
- Check Drizzle ORM [documentation](https://orm.drizzle.team)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write TypeScript for all new code
- Use Tailwind CSS for styling
- Add proper error handling
- Test your changes before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration
- [OpenAI](https://openai.com/) - AI models

---

Built with Next.js, TypeScript, and AI
