# Architecture Design: Weather Information Platform

## Architecture Overview

The Weather Information Platform is designed as a **Traditional N-Tier Modular Monolith** optimized for rapid development, simple deployment to AWS Ubuntu EC2, and demonstration clarity. The architecture prioritizes simplicity and operational efficiency for a 5-day development timeline while maintaining clean separation of concerns for maintainability.

**Key Design Decisions**:
1. **Monolithic deployment** for simplicity (single EC2 instance, single codebase)
2. **Server-side rendering** for better SEO and simpler state management
3. **PostgreSQL** for ACID compliance and JSON storage capability
4. **API-first internal design** to enable future frontend separation if needed
5. **Nginx reverse proxy** for professional deployment and future scalability

## Architecture Pattern Selection

**Selected Pattern**: **Traditional N-Tier Architecture** (with modern optimizations)

**Rationale**:
- ✅ **Timeline**: 5 days demands simple, well-understood patterns
- ✅ **Team Size**: Single developer benefits from cohesive codebase
- ✅ **Deployment Target**: AWS Ubuntu EC2 aligns perfectly with monolithic deployment
- ✅ **Complexity Level**: CRUD application with external APIs doesn't warrant microservices
- ✅ **Maintainability**: Easier to debug, test, and demonstrate for assessment reviewers
- ✅ **Framework Support**: Next.js, Django, Rails all excel at N-tier applications

**Alternative Considered**: Serverless (AWS Lambda + API Gateway + DynamoDB)
- ❌ **Rejected**: Adds complexity in deployment, local development harder, cold start latency
- ❌ **Rejected**: DynamoDB less suitable for ad-hoc queries needed for CRUD operations

## System Components

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    End User (Browser)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS (Port 443/80)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  - SSL Termination (optional)                                │
│  - Static Asset Serving                                      │
│  - Request Forwarding                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (Port 3000 or 8000)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Server (Next.js/Django)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Presentation Layer                                    │  │
│  │  - Server-side rendering (SSR)                         │  │
│  │  - React components (Next.js) / Templates (Django)     │  │
│  │  - Client-side interactivity (minimal)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Layer (Internal)                                  │  │
│  │  - /api/weather/* - Weather retrieval endpoints        │  │
│  │  - /api/location/* - Geocoding & validation           │  │
│  │  - /api/queries/* - CRUD operations                   │  │
│  │  - /api/export/* - Data export endpoints              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                  │  │
│  │  - Location validation & normalization                 │  │
│  │  - Date range parsing & splitting (historical/forecast)│  │
│  │  - Weather data aggregation & formatting              │  │
│  │  - Export format transformation                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Access Layer                                     │  │
│  │  - Query repository (CRUD operations)                  │  │
│  │  - Database connection pooling                         │  │
│  │  - Query builders & ORM                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  External Integration Layer                            │  │
│  │  - Weather API client (Open-Meteo)                     │  │
│  │  - Geocoding API client (Geoapify)                     │  │
│  │  - Optional: YouTube API, Map tiles                    │  │
│  │  - Rate limiting & retry logic                         │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ TCP (Port 5432)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - saved_queries table (query metadata + weather JSON)       │
│  - Indexes for location & date searches                      │
│  - Connection pooling                                        │
└─────────────────────────────────────────────────────────────┘

External Services (HTTP/HTTPS):
- Open-Meteo Weather API
- Geoapify Geocoding API
- [Optional] YouTube Data API v3
- [Optional] OpenStreetMap Tiles
```

### Component Inventory

#### 1. Nginx Reverse Proxy
- **Purpose**: Production-grade web server for request routing, static assets, and optional SSL
- **Boundaries**: Handles all incoming traffic, routes to application server, serves static files
- **Dependencies**: None (standalone)
- **Interface**: HTTP/HTTPS → Application Server (HTTP)
- **Deployment**: Installed directly on EC2 Ubuntu via apt, configured via /etc/nginx/sites-available/
- **Data Ownership**: None (stateless proxy)

#### 2. Presentation Layer (Frontend)
- **Purpose**: User interface rendering and client-side interactivity
- **Boundaries**:
  - Included: UI components, forms, weather displays, export buttons, modals
  - Excluded: Business logic, API integration, data persistence
- **Dependencies**: API Layer for data, Browser APIs (Geolocation, Blob download)
- **Interface**: Server-side renders HTML + React hydration (Next.js) OR Django templates
- **Deployment**: Bundled with application server
- **Data Ownership**: None (stateless, ephemeral UI state only)

**Technology Choice**: React (Next.js)
- **Why**: Component reusability, strong ecosystem, modern developer experience
- **Alternative**: Django templates (simpler, less JS, faster for Python devs)

#### 3. API Layer (Backend Routes)
- **Purpose**: RESTful API endpoints for frontend communication
- **Boundaries**:
  - Included: Request validation, response formatting, error handling
  - Excluded: Business logic (delegated to service layer), direct DB access
- **Dependencies**: Business Logic Layer, Data Access Layer
- **Interface**:
  - REST API (JSON request/response)
  - `/api/weather/current?location={query}` - Current weather
  - `/api/weather/forecast?location={query}&days=5` - Forecast
  - `/api/weather/daterange?location={query}&start={date}&end={date}` - Date range
  - `/api/queries` (GET/POST) - List/create queries
  - `/api/queries/{id}` (GET/PUT/DELETE) - Retrieve/update/delete query
  - `/api/export/{id}?format={json|csv|pdf|xml|md}` - Export query
- **Deployment**: Next.js API routes `/pages/api/` OR Django views
- **Data Ownership**: None (delegates to lower layers)

#### 4. Business Logic Layer
- **Purpose**: Core application logic and workflow orchestration
- **Boundaries**:
  - Included: Location validation, date range logic, weather data transformation, export formatting
  - Excluded: HTTP handling (API layer), data persistence (DAL), UI rendering (Presentation)
- **Dependencies**: External Integration Layer (APIs), Data Access Layer (optional caching)
- **Interface**: Service classes/functions called by API Layer
  - `WeatherService`: `getCurrentWeather()`, `getForecast()`, `getDateRange()`
  - `LocationService`: `validateLocation()`, `geocode()`, `reverseGeocode()`
  - `QueryService`: `saveQuery()`, `updateQuery()`, `deleteQuery()`, `listQueries()`
  - `ExportService`: `exportToJSON()`, `exportToCSV()`, `exportToPDF()`, etc.
- **Deployment**: Application code (services directory)
- **Data Ownership**: None (stateless processing)

**Key Business Logic**:
1. **Date Range Splitting**: Determine if date range needs historical API, current weather, or forecast API
2. **Location Normalization**: Canonical location storage (lat/lon + formatted name)
3. **Confidence Thresholding**: Auto-select location if confidence > 0.8, ask user if 0.5-0.8, reject if < 0.5
4. **Export Format Transformation**: Convert weather JSON to target format with proper escaping/formatting

#### 5. Data Access Layer
- **Purpose**: Database abstraction and query execution
- **Boundaries**:
  - Included: SQL query building, ORM operations, connection pooling
  - Excluded: Business logic, API integration
- **Dependencies**: PostgreSQL database
- **Interface**: Repository pattern
  - `QueryRepository`: `create()`, `findById()`, `findAll()`, `update()`, `delete()`
- **Deployment**: Application code (repositories or models directory)
- **Data Ownership**: Owns database connection lifecycle, not data itself

**Technology Choice**: Prisma ORM (Next.js) OR Django ORM
- **Why**: Type safety, migration management, query builder for complex joins
- **Alternative**: Raw SQL (more control, steeper learning curve)

#### 6. External Integration Layer
- **Purpose**: API clients for external services with resilience patterns
- **Boundaries**:
  - Included: HTTP clients, request formatting, response parsing, retry logic, error handling
  - Excluded: Business logic interpretation of API responses
- **Dependencies**: Open-Meteo API, Geoapify API, optional YouTube/Maps APIs
- **Interface**: Client classes/functions
  - `OpenMeteoClient`: `fetchCurrentWeather()`, `fetchForecast()`, `fetchHistorical()`
  - `GeoapifyClient`: `geocode()`, `reverseGeocode()`
  - `YouTubeClient`: `searchLocationVideos()` (optional)
- **Deployment**: Application code (clients directory)
- **Data Ownership**: None (proxy to external APIs)

**Resilience Patterns**:
- Retry with exponential backoff (3 attempts)
- Circuit breaker pattern (optional, if time permits)
- Timeout configuration (5s for geocoding, 10s for weather)
- Graceful degradation (e.g., skip YouTube videos if API fails)

#### 7. PostgreSQL Database
- **Purpose**: Persistent storage for saved weather queries
- **Boundaries**:
  - Included: Saved queries, indexes for performance
  - Excluded: Caching (too simple for this project), session storage (server-side sessions not needed)
- **Dependencies**: None
- **Interface**: SQL via Data Access Layer
- **Deployment**: Installed on EC2 Ubuntu via apt OR AWS RDS (if time permits)
- **Data Ownership**: All application persistent data

## Data Architecture

**Selected Pattern**: **Single Relational Database** with JSON storage for flexibility

**Rationale**:
- ✅ **Simplicity**: Single database simplifies deployment and backup
- ✅ **ACID Compliance**: Ensures data consistency for CRUD operations
- ✅ **JSON Support**: PostgreSQL JSONB for storing raw API responses (flexible schema)
- ✅ **Query Capability**: Rich querying for saved queries (filter by location, date range)
- ✅ **Proven Technology**: Well-understood, robust, free-tier friendly

### Database Schema

#### Table: `saved_queries`

```sql
CREATE TABLE saved_queries (
  id SERIAL PRIMARY KEY,

  -- User-provided metadata
  label VARCHAR(255),  -- Optional custom label, e.g., "NYC Trip Planning"

  -- Location information (normalized)
  location_name VARCHAR(255) NOT NULL,  -- Canonical location name from geocoding API
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,

  -- Date range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Weather data (raw API response for flexibility)
  weather_data JSONB NOT NULL,  -- Entire weather API response preserved

  -- Additional context (optional fields)
  geocoding_confidence DECIMAL(3, 2),  -- 0.00 to 1.00
  location_type VARCHAR(50),  -- 'city', 'landmark', 'coordinates', 'postal_code'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for common queries
  INDEX idx_location_name (location_name),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_created_at (created_at DESC)
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_saved_queries_updated_at
  BEFORE UPDATE ON saved_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Schema Design Decisions**:

1. **JSONB for weather_data**: Flexible schema allows storing different API response formats without migration
2. **Normalized location**: lat/lon enables future geo-queries (e.g., "queries near me")
3. **Separate label field**: User can customize query names for easier retrieval
4. **Confidence tracking**: Helps identify potentially ambiguous saved queries
5. **Timestamp tracking**: created_at for sorting, updated_at for tracking refreshed data

**Sample weather_data JSON**:
```json
{
  "current_weather": {
    "temperature": 72.5,
    "weathercode": 0,
    "windspeed": 5.2,
    "winddirection": 180,
    "time": "2025-10-06T14:00"
  },
  "daily": {
    "time": ["2025-10-06", "2025-10-07", ...],
    "temperature_2m_max": [75.2, 73.4, ...],
    "temperature_2m_min": [62.1, 60.5, ...],
    "precipitation_sum": [0, 0.2, ...],
    "windspeed_10m_max": [10.5, 12.3, ...]
  },
  "metadata": {
    "api_source": "open-meteo",
    "fetched_at": "2025-10-06T14:05:23Z"
  }
}
```

### Storage Technologies

| Data Type | Technology | Rationale |
|-----------|------------|-----------|
| Saved weather queries | PostgreSQL (JSONB) | ACID compliance for CRUD, rich JSON querying, proven reliability |
| Application logs | File system + logrotate | Simple for demo, could upgrade to CloudWatch later |
| Static assets | Nginx file serving | Fast, CDN-like performance for local assets |

### Data Flow

1. **Weather Query Flow**:
   ```
   User Input → Location Validation (Geoapify) → Weather Fetch (Open-Meteo)
   → Display to User → [Optional] Save to DB (with JSONB storage)
   ```

2. **Saved Query Retrieval Flow**:
   ```
   User Request → Database Query → Parse JSONB → Format for Display → Render UI
   ```

3. **Export Flow**:
   ```
   User Selects Export → Fetch Query from DB → Extract weather_data JSON
   → Transform to Target Format → Generate File → Browser Download
   ```

## API & Integration Architecture

### Internal Communication

**Synchronous Only** (monolithic architecture, no async needed for MVP)
- **Style**: REST API (JSON over HTTP)
- **Location**: Next.js API routes (`/pages/api/`) OR Django URL routing
- **Authentication**: None required (single-user demo)

### External APIs

#### 1. Open-Meteo Weather API
**Base URL**: `https://api.open-meteo.com/v1/`

**Endpoints Used**:
- **Current + Forecast**: `/forecast`
  - Query params: `latitude`, `longitude`, `current_weather`, `daily`, `hourly`
  - Example: `?latitude=40.7128&longitude=-74.0060&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`

- **Historical**: `/archive`
  - Query params: `latitude`, `longitude`, `start_date`, `end_date`, `daily`
  - Example: `?latitude=40.7128&longitude=-74.0060&start_date=2025-09-01&end_date=2025-09-30&daily=temperature_2m_max,temperature_2m_min`

**Key Features**:
- ✅ No API key required
- ✅ No rate limiting
- ✅ JSON response format
- ✅ Timezone-aware responses

**Error Handling**:
- Network timeout: Retry up to 3 times with exponential backoff
- Invalid coordinates: Return clear error to user
- API unavailable: Display user-friendly message, offer retry

#### 2. Geoapify Geocoding API
**Base URL**: `https://api.geoapify.com/v1/`

**Endpoints Used**:
- **Geocode (address → coordinates)**: `/geocode/search`
  - Query params: `text`, `apiKey`, `limit`, `format=json`
  - Example: `?text=New York City&apiKey=YOUR_KEY&limit=5&format=json`

- **Reverse Geocode (coordinates → address)**: `/geocode/reverse`
  - Query params: `lat`, `lon`, `apiKey`, `format=json`

**Key Features**:
- ✅ Fuzzy matching for typos and variations
- ✅ Confidence scores (rank.confidence property)
- ✅ Multiple result handling (top 3-5 matches)
- ✅ 3,000 requests/day free tier

**Error Handling**:
- No results found: Prompt user to try different location
- Multiple matches: Display top 3 with confidence scores, let user select
- Rate limit exceeded: Cache recent lookups, display error if needed

#### 3. YouTube Data API v3 (Optional)
**Base URL**: `https://www.googleapis.com/youtube/v3/`

**Endpoints Used**:
- **Search**: `/search`
  - Query params: `q`, `part=snippet`, `type=video`, `maxResults=5`, `key=YOUR_KEY`
  - Example: `?q=Paris travel&type=video&maxResults=5&key=YOUR_KEY`

**Key Features**:
- ✅ 10,000 quota units/day free
- ✅ Video metadata (title, thumbnail, channel)

**Error Handling**:
- API failure: Hide video section gracefully
- Quota exceeded: Display message or skip feature

### Integration Patterns

**API Request Pattern**:
```javascript
// Pseudo-code for resilient API calls
async function callExternalAPI(url, retries = 3, timeout = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(timeout)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }
}
```

**Caching Strategy** (optional optimization):
- Cache geocoding results (location name → coordinates) for 24 hours
- Cache weather data for 30 minutes (reasonable freshness)
- Use in-memory cache (simple Map) or Redis if time permits

## Security Architecture

### Security Layers

1. **Network Security**:
   - AWS Security Group: Allow ports 80 (HTTP), 443 (HTTPS), 22 (SSH for admin only)
   - PostgreSQL: Bind to localhost only (127.0.0.1), no external access
   - SSH: Key-based authentication only, disable password auth

2. **Application Security**:
   - **Input Validation**: Sanitize all user inputs (location queries, date ranges)
   - **SQL Injection Prevention**: Use parameterized queries via ORM (Prisma/Django ORM)
   - **XSS Prevention**: React auto-escapes, Django templates auto-escape
   - **CSRF Protection**: Django has built-in, Next.js uses SameSite cookies

3. **Data Security**:
   - **API Keys**: Store in environment variables (.env file), never commit to git
   - **HTTPS**: Optional (Let's Encrypt), HTTP acceptable for demo
   - **Database**: No encryption at rest required for demo (no sensitive user data)

4. **Operational Security**:
   - **Logging**: Log API errors, database errors, but avoid logging user inputs
   - **Monitoring**: CloudWatch metrics (optional) or simple log file monitoring
   - **Updates**: Keep dependencies updated (npm audit / pip check)

### Authentication & Authorization

**Not Required** for this assessment (single-user demo, no sensitive data).

If added in future:
- User authentication: NextAuth.js or Django allauth
- Row-level security: Filter queries by user_id
- API authentication: JWT tokens

### Compliance & Privacy

**Requirements**:
- ✅ **Attribution**: Display "Weather data from Open-Meteo" per API terms (courteous, not required)
- ✅ **No PII Collection**: No user accounts, no personal data storage
- ✅ **API Terms**: Respect rate limits and terms of service for all APIs

**Data Residency**: Not applicable (no user data, public weather data only)

**Audit Trail**: Track created_at/updated_at in database for query history

## Infrastructure & Deployment

**Selected Pattern**: **Traditional VMs (AWS EC2 Ubuntu)**

**Rationale**:
- ✅ **Assessment Requirement**: Explicitly requires AWS Ubuntu deployment
- ✅ **Simplicity**: Single server deployment, no orchestration complexity
- ✅ **Cost**: AWS Free Tier eligible (t2.micro or t3.micro)
- ✅ **Full Control**: Direct access to configure Nginx, PostgreSQL, Node.js/Python

**Alternative Rejected**: Containerization (Docker + ECS)
- ❌ **Time Constraint**: Adds complexity in Dockerfile creation, registry management
- ❌ **Overkill**: Single-container deployment doesn't justify orchestration overhead

### Infrastructure Strategy

- **Primary Platform**: AWS (EC2 + optional RDS)
- **Region**: us-east-1 (or closest to assessment reviewers)
- **Multi-Region**: Not applicable (single demo deployment)
- **Environment Strategy**: Single production environment (no dev/staging for demo)

### Deployment Architecture

```
AWS Cloud (us-east-1)
├── EC2 Instance (t2.micro Ubuntu 22.04 LTS)
│   ├── Nginx (reverse proxy)
│   ├── Application Server (Next.js:3000 OR Django:8000)
│   ├── PostgreSQL (local install)
│   ├── PM2 Process Manager (for Node.js) OR systemd (for Python)
│   └── Environment Variables (.env file)
│
├── Security Group
│   ├── Inbound: Port 80 (HTTP), 443 (HTTPS), 22 (SSH - restricted IP)
│   └── Outbound: All (for API calls)
│
└── Elastic IP (optional, for stable public IP)
```

### Deployment Details

**Installation Steps** (documented for reviewers):
1. **Provision EC2**: t2.micro Ubuntu 22.04, assign security group, SSH key
2. **Install Dependencies**:
   ```bash
   # System updates
   sudo apt update && sudo apt upgrade -y

   # Nginx
   sudo apt install nginx -y

   # PostgreSQL
   sudo apt install postgresql postgresql-contrib -y

   # Node.js (for Next.js) OR Python (for Django)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs -y
   # OR
   sudo apt install python3.11 python3-pip python3-venv -y

   # PM2 (for Node.js)
   sudo npm install -g pm2
   ```

3. **Application Setup**:
   ```bash
   # Clone repository
   git clone https://github.com/YOUR_USERNAME/weather-app.git
   cd weather-app

   # Install dependencies
   npm install  # OR pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   nano .env  # Edit with API keys, database URL

   # Database setup
   sudo -u postgres psql
   CREATE DATABASE weather_app;
   CREATE USER weather_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE weather_app TO weather_user;
   \q

   # Run migrations
   npm run migrate  # OR python manage.py migrate
   ```

4. **Nginx Configuration**:
   ```nginx
   # /etc/nginx/sites-available/weather-app
   server {
       listen 80;
       server_name YOUR_DOMAIN_OR_IP;

       location / {
           proxy_pass http://localhost:3000;  # OR 8000 for Django
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Static files (if needed)
       location /_next/static {
           alias /home/ubuntu/weather-app/.next/static;
           expires 365d;
           access_log off;
       }
   }
   ```

5. **Start Services**:
   ```bash
   # Enable Nginx
   sudo ln -s /etc/nginx/sites-available/weather-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx

   # Start application with PM2
   pm2 start npm --name weather-app -- start
   pm2 startup
   pm2 save

   # OR for Django
   sudo systemctl start weather-app.service
   sudo systemctl enable weather-app.service
   ```

### Scalability Design

**Current Scale** (Demo):
- Concurrent users: 10-20 (assessment reviewers)
- Requests per second: < 10
- Database size: < 100 MB

**Scaling Triggers** (Future):
- CPU > 70% sustained: Upgrade instance size (t2.small → t2.medium)
- Database connections exhausted: Move to AWS RDS with connection pooling
- Response time > 2s: Add Redis caching layer

**Bottleneck Mitigation** (Future enhancements):
- Caching: Redis for geocoding results and weather data
- CDN: CloudFront for static assets
- Database: Read replicas for heavy query loads

## Operational Architecture

### Observability

**Metrics** (Basic):
- Application logs: stdout/stderr captured by PM2 or systemd
- Nginx access logs: `/var/log/nginx/access.log`
- PostgreSQL logs: `/var/log/postgresql/postgresql-14-main.log`

**Logging Strategy**:
- Application: Console logs (timestamp, level, message)
- Rotation: logrotate for Nginx and PostgreSQL logs
- Retention: 7 days (sufficient for demo period)

**Alerting** (Optional):
- Email alert if application crashes (PM2 notification)
- CloudWatch alarms for EC2 CPU > 90% (optional)

### Reliability

**SLA Target**: Best effort (99% uptime acceptable for demo, ~7.2 hours downtime/month)

**Failure Modes**:
- EC2 instance failure: Manual restart (no auto-scaling group for demo)
- Database corruption: Daily backups via pg_dump cron job
- API failures: Graceful error messages, retry logic

**Recovery Strategy**:
- RTO (Recovery Time Objective): 1 hour (manual intervention)
- RPO (Recovery Point Objective): 24 hours (daily database backups)
- Backup Frequency: Daily pg_dump to S3 (optional) or local storage

### Performance

**Response Time Targets**:
- Page load: < 1s (server-side rendered HTML)
- API calls: < 500ms (database queries)
- Weather retrieval: < 2s (external API latency)

**Throughput**: 10 req/s sustained, 50 req/s peak (adequate for demo)

**Resource Budget**:
- CPU: 1 vCPU (t2.micro)
- Memory: 1 GB RAM (t2.micro)
- Storage: 8 GB EBS (sufficient for OS + app + database)

## Development & Testing Architecture

### Development Workflow

**Local Development**:
```bash
# Prerequisites: Node.js 20+ (or Python 3.11+), PostgreSQL
git clone <repo>
npm install  # OR pip install -r requirements.txt
cp .env.example .env  # Add API keys
npm run db:migrate  # Set up local database
npm run dev  # Start dev server (http://localhost:3000)
```

**Database Migrations**:
- Prisma Migrate (Next.js): `npx prisma migrate dev`
- Django Migrations: `python manage.py makemigrations && python manage.py migrate`

**Feature Flags**: Not required for demo (all features enabled)

### Testing Strategy

**Unit Tests** (Optional, if time permits):
- Coverage goal: 50%+ for business logic layer
- Focus: Location validation, date range splitting, export formatting
- Tools: Jest (Next.js) or pytest (Django)

**Integration Tests** (Optional):
- Test: API endpoints with mock external APIs
- Tools: Supertest (Next.js) or Django TestClient

**E2E Tests** (Not required for demo):
- Would use: Playwright or Cypress
- Skip for timeline reasons

**Manual Testing** (Critical):
- Test all CRUD operations
- Test edge cases: invalid locations, date ranges
- Test export formats (download and verify each)
- Cross-browser testing: Chrome, Firefox, Safari

### Code Organization

**Next.js Structure**:
```
/pages
  /api
    /weather
      current.ts
      forecast.ts
      daterange.ts
    /queries
      index.ts
      [id].ts
    /export
      [id].ts
  index.tsx
  queries.tsx
  [query-id].tsx
/components
  WeatherDisplay.tsx
  QueryList.tsx
  ExportButtons.tsx
/services
  weatherService.ts
  locationService.ts
  queryService.ts
  exportService.ts
/clients
  openMeteoClient.ts
  geoapifyClient.ts
/repositories
  queryRepository.ts
/lib
  db.ts (Prisma client)
  constants.ts
/types
  weather.ts
  query.ts
```

**Django Structure** (Alternative):
```
/weather_app
  /views
    weather_views.py
    query_views.py
    export_views.py
  /services
    weather_service.py
    location_service.py
  /models
    query.py
  /serializers
    query_serializer.py
  /templates
    index.html
    queries.html
  /static
    /css
    /js
```

## Technology Stack

### Core Technologies

**Recommended: Next.js (TypeScript) Stack**

- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Styling**: Tailwind CSS (rapid development)
- **HTTP Client**: Built-in fetch API

**Alternative: Django (Python) Stack**

- **Runtime**: Python 3.11+
- **Framework**: Django 5.0+
- **Database**: PostgreSQL 14+
- **ORM**: Django ORM
- **Styling**: Django templates + Bootstrap/Tailwind
- **HTTP Client**: requests library

**Recommendation**: **Next.js** for better AWS deployment story and modern developer experience.

### Supporting Libraries

**Next.js Stack**:
- `date-fns`: Date parsing and validation
- `papaparse`: CSV export
- `jspdf`: PDF generation
- `fast-xml-parser`: XML export
- `@prisma/client`: Database ORM
- `zod`: Input validation schemas

**Django Stack**:
- `python-dateutil`: Date parsing
- `pandas`: CSV export
- `reportlab`: PDF generation
- `dicttoxml`: XML export
- `requests`: HTTP client

### Production Dependencies

**Server**:
- Nginx 1.18+
- PM2 (for Node.js) OR systemd (for Python)
- PostgreSQL 14+

**Monitoring** (Optional):
- AWS CloudWatch agent
- PM2 monitoring dashboard

## Architecture Decision Records

### ADR-001: Monolithic vs Microservices Architecture
- **Status**: Accepted
- **Context**: 5-day timeline, single developer, demo deployment to AWS EC2
- **Decision**: Traditional N-tier monolithic architecture
- **Alternatives Considered**:
  - Microservices (rejected: overkill for CRUD app, deployment complexity)
  - Serverless (rejected: cold starts, more complex local dev)
- **Consequences**:
  - ✅ Simpler deployment and debugging
  - ✅ Faster development (no inter-service communication)
  - ⚠️ Harder to scale individual components (acceptable for demo)

### ADR-002: Next.js (TypeScript) vs Django (Python)
- **Status**: Accepted (Next.js recommended)
- **Context**: Need rapid development with modern UX and AWS deployment
- **Decision**: Next.js 14 with TypeScript
- **Alternatives Considered**:
  - Django (rejected: less modern frontend DX, more Python familiarity needed)
  - Express.js + React SPA (rejected: more complex than Next.js full-stack)
- **Consequences**:
  - ✅ Single language (TypeScript) for frontend + backend
  - ✅ Excellent AWS deployment guides and community support
  - ✅ Server-side rendering for better performance
  - ⚠️ Steeper learning curve if unfamiliar with React

### ADR-003: PostgreSQL on EC2 vs AWS RDS
- **Status**: Accepted (PostgreSQL on EC2)
- **Context**: Demo deployment, limited budget, simple database needs
- **Decision**: Install PostgreSQL directly on EC2 instance
- **Alternatives Considered**:
  - AWS RDS (rejected: adds cost, separate security group management)
  - SQLite (rejected: less production-like, harder to backup)
- **Consequences**:
  - ✅ Simpler deployment (single EC2 instance)
  - ✅ No additional AWS services to configure
  - ⚠️ Manual backup management required
  - ⚠️ Less scalable (acceptable for demo)

### ADR-004: Open-Meteo vs OpenWeatherMap
- **Status**: Accepted (Open-Meteo)
- **Context**: Need free weather API with historical + forecast data
- **Decision**: Open-Meteo (https://open-meteo.com/)
- **Alternatives Considered**:
  - OpenWeatherMap (rejected: API key management, rate limits, no historical in free tier)
  - WeatherAPI.com (rejected: limited historical depth)
- **Consequences**:
  - ✅ No API key needed (simpler deployment)
  - ✅ Unlimited requests (no rate limiting concerns)
  - ✅ Historical data back to 1940
  - ✅ No attribution required (though courteous)

### ADR-005: Geoapify vs Nominatim (OpenStreetMap)
- **Status**: Accepted (Geoapify)
- **Context**: Need geocoding with fuzzy matching and confidence scores
- **Decision**: Geoapify Geocoding API
- **Alternatives Considered**:
  - Nominatim (rejected: no confidence scores, strict usage policy, slower)
  - Google Geocoding (rejected: requires billing setup, overkill)
- **Consequences**:
  - ✅ Excellent fuzzy matching for typos
  - ✅ Confidence scores enable intelligent location validation
  - ✅ 3,000 requests/day sufficient for demo
  - ⚠️ Requires API key management

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AWS EC2 deployment complexity exceeds timeline | High | Medium | Create deployment script, test early on Day 3, document each step |
| PostgreSQL setup issues on Ubuntu | Medium | Low | Use apt package (well-tested), have RDS as backup plan |
| External API failures during demo | High | Low | Retry logic with exponential backoff, graceful error messages |
| Date range logic bugs (historical/forecast split) | Medium | Medium | Unit tests for edge cases, extensive manual testing |
| Nginx configuration errors | Medium | Low | Use proven nginx config template, test with curl before demo |
| API key exposure in git | High | Low | .gitignore from day 1, pre-submission audit, use .env.example |
| Database migration failures | Low | Low | Test migrations locally first, keep migrations simple |
| Performance issues with JSONB queries | Low | Low | Index on location_name and dates, test with realistic data size |

---
*This architecture document will guide all implementation decisions. Any deviations should be documented with rationale.*
