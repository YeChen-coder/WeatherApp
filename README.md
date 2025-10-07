# Weather Information Platform

**Demo video**: https://youtu.be/k901hLw-Tsw

A full-stack weather application demonstrating API integration, database CRUD operations, and data export capabilities. Built for PM Accelerator's AI/ML Software Engineer Intern technical assessment.

> **Note**: Although some documents/code mention AWS deployment, this project was never successfully deployed on AWS Ubuntu due to RAM limitations during `npm install`. The application runs locally with full functionality.

## Tech Stack

**Frontend**
- Next.js 15 (React 19, App Router)
- TypeScript
- Tailwind CSS
- Client/Server Components

**Backend**
- Next.js API Routes
- PostgreSQL (Database)
- Prisma ORM

**External APIs**
- Open-Meteo (Weather data - unlimited free tier)
- Geoapify (Geocoding & location validation)
- YouTube Data API v3 (Location-based videos)

**Development Tools**
- ESLint + TypeScript
- Git version control

## Features

### Tech Assessment 1 (Core Features)
- ✅ Flexible location input (city, zip code, GPS coordinates, landmarks)
- ✅ Current weather display with detailed metrics
- ✅ 5-day weather forecast
- ✅ "Use My Location" browser geolocation
- ✅ Weather condition icons (day/night variations)

### Tech Assessment 2 (Advanced Features)
- ✅ **CRUD Operations**: Save, view, update, and delete weather queries
- ✅ **Historical Weather**: Date range queries (1940 to yesterday)
- ✅ **Data Export**: JSON and CSV download formats
- ✅ **YouTube Integration**: Location-based weather video recommendations
- ✅ **PostgreSQL Database**: Full data persistence with Prisma

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (local or remote)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd weather-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/weather_platform_dev?schema=public"

# API Keys
GEOAPIFY_API_KEY="your_geoapify_api_key"
YOUTUBE_API_KEY="your_youtube_api_key"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
weather-platform/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── geocode/         # Location validation
│   │   ├── weather/         # Weather data endpoints
│   │   ├── queries/         # CRUD operations
│   │   └── youtube/         # Video search
│   ├── queries/             # Saved queries page
│   └── page.tsx             # Main application page
├── components/
│   └── weather/             # Weather UI components
├── lib/
│   ├── clients/             # API clients (Open-Meteo, Geoapify, YouTube)
│   ├── types/               # TypeScript type definitions
│   └── db.ts                # Prisma database client
├── prisma/
│   └── schema.prisma        # Database schema
└── DocumentsInTheProcess/   # Development documentation
```

## Database Schema

The application uses a single `saved_queries` table:

```prisma
model SavedQuery {
  id                    Int       @id @default(autoincrement())
  label                 String?
  locationName          String
  latitude              Decimal
  longitude             Decimal
  startDate             DateTime
  endDate               DateTime
  weatherData           Json?
  geocodingConfidence   Decimal?
  locationType          String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

## API Endpoints

### Weather
- `GET /api/weather/current?lat={lat}&lon={lon}` - Current weather
- `GET /api/weather/forecast?lat={lat}&lon={lon}` - 5-day forecast
- `GET /api/weather/historical?lat={lat}&lon={lon}&startDate={date}&endDate={date}` - Historical data

### Location
- `POST /api/geocode` - Location search and validation

### Queries (CRUD)
- `GET /api/queries` - List all saved queries
- `POST /api/queries` - Create new query
- `GET /api/queries/[id]` - Get specific query
- `PUT /api/queries/[id]` - Update query
- `DELETE /api/queries/[id]` - Delete query
- `GET /api/queries/[id]/export?format=json|csv` - Export query data

### YouTube
- `GET /api/youtube/search?location={location}` - Search weather videos

## Documentation

See the `DocumentsInTheProcess/` folder for comprehensive development documentation:
- Technical assessment requirements
- Project brief and architecture design
- Product requirements (Epics and User Stories)
- Research findings and development journal

## Development Process

This project was developed using the BMAD (Build-Measure-Analyze-Decide) methodology with systematic planning:
1. Requirements analysis and API research
2. Architecture design and database modeling
3. Incremental feature implementation (MVP → Advanced features)
4. Testing and validation

## Credits

**Developed by**: ClairC
**Program**: [PM Accelerator](https://www.pmaccelerator.io/)
**Assessment**: AI/ML Software Engineer Intern - Technical Assessment

**Data Sources**:
- Weather data from [Open-Meteo](https://open-meteo.com/)
- Geocoding by [Geoapify](https://www.geoapify.com/)
- Videos from [YouTube Data API](https://developers.google.com/youtube/v3)
