# Product Requirements Document: Weather Information Platform

## Executive Summary

The Weather Information Platform is a full-stack web application designed to demonstrate technical proficiency across frontend development, backend API integration, database management, and cloud deployment. The platform provides intelligent weather information retrieval with flexible location input, date range queries, data persistence with full CRUD operations, and multi-format data export capabilities.

**Target**: Complete Tech Assessment 1 (basic weather app) by Day 3, then enhance with Tech Assessment 2 advanced features by Day 5.
**Deployment**: AWS Ubuntu EC2 instance with public web access.
**Timeline**: 5 days from start to deployed demo.

## Product Vision

Create a weather information platform that anticipates user needs by:
1. **Accepting diverse location inputs** (zip, GPS, landmarks, cities) with intelligent validation
2. **Supporting date range analysis** (historical, current, forecast) for travel planning
3. **Persisting user queries** for comparison and trend analysis
4. **Enriching weather data** with location videos and maps
5. **Enabling data export** in multiple formats for external analysis

## User Personas

### Primary Persona: Technical Reviewer (Internal Stakeholder)
- **Context**: Evaluating candidate's full-stack development capabilities within 1-2 hours of code review and demo viewing
- **Goals**:
  - Assess technical competence across frontend, backend, database, API integration
  - Evaluate code quality, architecture decisions, and problem-solving approach
  - Determine candidate fit for AI/ML application development role
- **Pain Points**:
  - Incomplete or poorly documented projects waste review time
  - Overly complex solutions suggest poor judgment
  - Missing features indicate inability to follow requirements
- **Success Criteria**:
  - All Tech Assessment 1 requirements met
  - Significant Tech Assessment 2 features implemented
  - Clean, understandable, well-documented code
  - Successful deployment to AWS with public access

### Secondary Persona: End User (Simulated)
- **Context**: Planning travel, researching relocation, or analyzing weather patterns
- **Goals**:
  - Get accurate weather information quickly
  - Compare weather across locations and time periods
  - Save queries for future reference
  - Export data for personal analysis
- **Pain Points**:
  - Weather apps require exact location format
  - Can't easily compare multiple locations
  - No historical data access
  - Can't export data for spreadsheets
- **Success Criteria**:
  - Location input works on first try (fuzzy matching)
  - Date range queries return accurate results
  - Can view, update, and delete saved queries
  - Export formats work in target applications (Excel, PDF readers, etc.)

## Functional Requirements

### Epic 1: Location-Based Weather Retrieval (Tech Assessment 1 - Core)
**Goal**: Enable users to get current weather for any location using flexible input methods
**Priority**: CRITICAL (MVP Blocker)

#### Story 1.1: Current Weather by Location
**As a** user, **I want to** enter a location in any format I know **so that** I can quickly get current weather without looking up exact coordinates or codes.

- **Acceptance Criteria**:
  - [ ] User can input location as: zip code, GPS coordinates, city name, landmark, or address
  - [ ] System validates location using geocoding API with fuzzy matching
  - [ ] If multiple matches, system shows top 3 options with confidence scores
  - [ ] System displays current weather including: temperature, conditions, humidity, wind speed
  - [ ] Weather data retrieved from real weather API (not static)
  - [ ] Invalid/ambiguous locations show helpful error messages
  - [ ] Response time < 2 seconds for location validation + weather retrieval

- **Technical Notes**:
  - Use Geoapify geocoding API for location validation (3,000 req/day free)
  - Use Open-Meteo weather API for weather data (unlimited, no API key)
  - Confidence threshold: <0.5 = ask user to clarify, >0.8 = auto-select, 0.5-0.8 = show options

#### Story 1.2: Current Location Weather
**As a** user, **I want to** see weather for my current location automatically **so that** I don't need to manually enter where I am.

- **Acceptance Criteria**:
  - [ ] "Use My Location" button triggers browser geolocation API
  - [ ] User grants location permission via browser prompt
  - [ ] System retrieves weather for user's lat/long coordinates
  - [ ] System displays location name (reverse geocoding) alongside weather
  - [ ] Graceful fallback if user denies location permission (prompt manual entry)

- **Technical Notes**:
  - Browser Geolocation API (navigator.geolocation.getCurrentPosition)
  - Reverse geocoding to display human-readable location name
  - Handle denied permissions gracefully

#### Story 1.3: 5-Day Weather Forecast
**As a** user, **I want to** see a 5-day forecast for my chosen location **so that** I can plan ahead for travel or events.

- **Acceptance Criteria**:
  - [ ] Forecast displays next 5 days (or 120 hours hourly)
  - [ ] Each day shows: date, high/low temp, weather condition, precipitation chance
  - [ ] Forecast updates when user selects new location
  - [ ] Weather icons or visuals represent each day's conditions

- **Technical Notes**:
  - Open-Meteo daily forecast endpoint
  - Display daily aggregates (max/min temp from hourly data)

#### Story 1.4: Weather Visualization
**As a** user, **I want to** see visual representations of weather conditions **so that** I can understand weather at a glance without reading text.

- **Acceptance Criteria**:
  - [ ] Weather icons display for current conditions (sun, cloud, rain, snow, etc.)
  - [ ] Icons match actual weather condition from API
  - [ ] Icons are clear and recognizable
  - [ ] Bonus: Color-coded temperature display (cold=blue, hot=red)

- **Technical Notes**:
  - Use weather icons from Open-Meteo, weather icon library, or SVG icons
  - Map API weather codes to appropriate icons

### Epic 2: Date Range Weather Analysis (Tech Assessment 2 - Advanced)
**Goal**: Enable users to analyze weather patterns across custom date ranges for planning and research
**Priority**: HIGH (Tech Assessment 2 requirement)

#### Story 2.1: Date Range Weather Query
**As a** user, **I want to** request weather data for a specific location and date range **so that** I can analyze historical patterns or forecast trends.

- **Acceptance Criteria**:
  - [ ] User can select start date and end date via date picker or text input
  - [ ] System validates date range (end >= start, reasonable bounds)
  - [ ] System determines whether dates are historical, current, or forecast
  - [ ] System retrieves appropriate weather data from correct API endpoints
  - [ ] System displays weather for each day in the range (table or chart format)
  - [ ] Includes: date, temperature (high/low/avg), precipitation, wind speed
  - [ ] Max date range: 30 days (to avoid overwhelming UI/API)

- **Technical Notes**:
  - Date parsing and validation library (date-fns or dayjs)
  - Logic to split requests: historical API vs forecast API vs current weather
  - Open-Meteo supports historical (1940-present) and forecast (16 days ahead)

#### Story 2.2: Date Range Validation
**As a** user, **I want to** receive clear feedback when my date range is invalid **so that** I can correct it and successfully retrieve data.

- **Acceptance Criteria**:
  - [ ] End date before start date → Error: "End date must be after start date"
  - [ ] Date range > 30 days → Warning: "Maximum 30-day range supported"
  - [ ] Forecast beyond 16 days → Error: "Forecast only available for next 16 days"
  - [ ] Historical before 1940 → Error: "Historical data only available from 1940 onwards"
  - [ ] All validation happens client-side for instant feedback
  - [ ] Server-side validation as backup for API requests

- **Technical Notes**:
  - Client-side validation with immediate feedback
  - Server-side validation to prevent API abuse

### Epic 3: Query Persistence & CRUD Operations (Tech Assessment 2 - Critical)
**Goal**: Enable users to save, view, update, and delete weather queries for future reference
**Priority**: HIGH (Tech Assessment 2 mandatory)

#### Story 3.1: Save Weather Query (CREATE)
**As a** user, **I want to** save my weather query (location + date range + results) **so that** I can reference it later without re-entering information.

- **Acceptance Criteria**:
  - [ ] "Save Query" button available after successful weather retrieval
  - [ ] System stores: location (normalized name + lat/long), date range, weather data, timestamp
  - [ ] Optional: User can add custom label/note to saved query
  - [ ] Confirmation message: "Query saved successfully"
  - [ ] Saved query appears in user's query history immediately

- **Technical Notes**:
  - Database table: saved_queries (id, location_name, lat, lon, start_date, end_date, weather_data_json, label, created_at)
  - Store both normalized location and raw API response (JSON column)
  - Auto-generate label if user doesn't provide (e.g., "New York, Oct 1-5, 2025")

#### Story 3.2: View Saved Queries (READ)
**As a** user, **I want to** see all my previously saved weather queries **so that** I can review past research or re-examine data.

- **Acceptance Criteria**:
  - [ ] "My Saved Queries" page lists all saved queries
  - [ ] Each entry shows: location, date range, query date, custom label (if any)
  - [ ] List is sortable by: date created, location name, query date
  - [ ] User can click a saved query to view full weather details
  - [ ] Paginated if > 20 queries (or infinite scroll)
  - [ ] Search/filter by location name

- **Acceptance Criteria (View Details)**:
  - [ ] Clicking a saved query opens detail view with full weather data
  - [ ] Detail view shows all original weather information (same format as initial query)
  - [ ] "Edit" and "Delete" buttons available in detail view

- **Technical Notes**:
  - Database query with sorting/filtering support
  - JSON parsing to display stored weather data
  - Consider caching for frequently accessed queries

#### Story 3.3: Update Saved Query (UPDATE)
**As a** user, **I want to** update a saved query's information **so that** I can correct errors or refresh stale forecast data.

- **Acceptance Criteria**:
  - [ ] User can edit: custom label, location, date range
  - [ ] Location validation re-runs if location is changed
  - [ ] Date range validation re-runs if dates are changed
  - [ ] If location or date range changes, system offers to re-fetch fresh weather data
  - [ ] User can choose to: keep old data, or refresh with new API call
  - [ ] Timestamp updated to reflect modification time
  - [ ] Confirmation: "Query updated successfully"

- **Technical Notes**:
  - Separate update timestamps: created_at vs updated_at
  - Option to preserve original weather data or re-fetch
  - Validation same as create flow

#### Story 3.4: Delete Saved Query (DELETE)
**As a** user, **I want to** delete saved queries I no longer need **so that** I can keep my query list organized and relevant.

- **Acceptance Criteria**:
  - [ ] "Delete" button on each saved query (list view and detail view)
  - [ ] Confirmation dialog: "Are you sure you want to delete this query?"
  - [ ] User must confirm before deletion (prevent accidental deletes)
  - [ ] Query removed from database immediately upon confirmation
  - [ ] User redirected to query list after deletion
  - [ ] Confirmation: "Query deleted successfully"

- **Technical Notes**:
  - Hard delete acceptable (no soft delete required per assessment)
  - Confirmation modal to prevent accidental deletion

### Epic 4: Multi-Source Location Enrichment (Tech Assessment 2 - Optional)
**Goal**: Provide additional context about locations beyond weather data
**Priority**: MEDIUM (Nice-to-have for differentiation)

#### Story 4.1: Location Videos
**As a** user, **I want to** see videos about my chosen location **so that** I can visualize the destination and learn more about it.

- **Acceptance Criteria**:
  - [ ] System searches YouTube for location-based videos
  - [ ] Search query includes location name + "travel" or "city tour"
  - [ ] Display 3-5 top video results (thumbnail, title, channel)
  - [ ] Videos open in YouTube (new tab) when clicked
  - [ ] Graceful handling if no videos found or API fails

- **Technical Notes**:
  - YouTube Data API v3 (free tier: 10,000 quota units/day)
  - Search query: "[location name] travel" or "[location name] city tour"
  - Filter by relevance and view count

#### Story 4.2: Location Map Display
**As a** user, **I want to** see a map of my chosen location **so that** I can understand its geographic context and nearby areas.

- **Acceptance Criteria**:
  - [ ] Interactive map displays with marker at chosen location
  - [ ] Map centered on location coordinates (from geocoding)
  - [ ] User can zoom in/out and pan around
  - [ ] Approximate location acceptable if exact address not available
  - [ ] Fallback to static map image if interactive map fails

- **Technical Notes**:
  - Option 1: Leaflet.js + OpenStreetMap tiles (free, open-source)
  - Option 2: Google Maps JavaScript API (requires API key, billing)
  - Recommendation: Leaflet.js for simplicity and no API key requirement

### Epic 5: Data Export (Tech Assessment 2 - Optional)
**Goal**: Enable users to export saved weather data in multiple formats for external analysis
**Priority**: MEDIUM (Nice-to-have for differentiation)

#### Story 5.1: Export to JSON
**As a** user, **I want to** export my saved query data as JSON **so that** I can programmatically process it or import into other tools.

- **Acceptance Criteria**:
  - [ ] "Export as JSON" button on saved query detail page
  - [ ] Exported JSON includes: location, date range, all weather data fields
  - [ ] JSON is properly formatted and valid
  - [ ] Downloads as .json file with descriptive name (e.g., "weather-newyork-oct2025.json")

- **Technical Notes**:
  - Use browser download API (Blob + URL.createObjectURL)
  - Pretty-print JSON for readability

#### Story 5.2: Export to CSV
**As a** user, **I want to** export my saved query data as CSV **so that** I can open it in Excel or Google Sheets for analysis.

- **Acceptance Criteria**:
  - [ ] "Export as CSV" button on saved query detail page
  - [ ] CSV includes headers: Date, Location, Temperature High, Temperature Low, Conditions, Precipitation, Wind Speed, etc.
  - [ ] Each day in date range is a separate row
  - [ ] CSV is properly formatted (comma-delimited, quoted strings if needed)
  - [ ] Downloads as .csv file with descriptive name

- **Technical Notes**:
  - Use CSV generation library (papaparse or json2csv)
  - Handle special characters and commas in location names (quote fields)

#### Story 5.3: Export to PDF
**As a** user, **I want to** export my saved query data as PDF **so that** I can share a professional-looking report or print it.

- **Acceptance Criteria**:
  - [ ] "Export as PDF" button on saved query detail page
  - [ ] PDF includes: location name, date range, weather data table
  - [ ] PDF is readable and well-formatted (not raw data dump)
  - [ ] Optional: Include weather icons in PDF
  - [ ] Downloads as .pdf file with descriptive name

- **Technical Notes**:
  - Use PDF generation library (jsPDF or pdfkit for Node.js)
  - Design simple template (title, table, footer)

#### Story 5.4: Export to Markdown
**As a** user, **I want to** export my saved query data as Markdown **so that** I can include it in documentation or notes.

- **Acceptance Criteria**:
  - [ ] "Export as Markdown" button on saved query detail page
  - [ ] Markdown includes: location header, date range, weather data table (markdown table format)
  - [ ] Markdown is properly formatted and renders well in viewers
  - [ ] Downloads as .md file with descriptive name

- **Technical Notes**:
  - Template string formatting (no library needed)
  - Markdown table format with proper alignment

#### Story 5.5: Export to XML
**As a** user, **I want to** export my saved query data as XML **so that** I can integrate with systems that require XML format.

- **Acceptance Criteria**:
  - [ ] "Export as XML" button on saved query detail page
  - [ ] XML includes: location, date range, weather data with proper nesting
  - [ ] XML is valid and well-formed
  - [ ] Downloads as .xml file with descriptive name

- **Technical Notes**:
  - Use XML generation library (fast-xml-parser or xml2js)
  - Define clear XML schema for weather data

### Epic 6: Application Branding & Info (Mandatory Deliverable)
**Goal**: Meet assessment requirements for branding and company information
**Priority**: CRITICAL (Assessment requirement)

#### Story 6.1: Display Developer Name
**As a** reviewer, **I want to** see the developer's name in the application **so that** I know whose work I'm reviewing.

- **Acceptance Criteria**:
  - [ ] Developer name displayed in header or footer (always visible)
  - [ ] Name is clearly readable
  - [ ] Professional presentation (not intrusive)

- **Technical Notes**:
  - Add to footer component: "Developed by [Your Name]"

#### Story 6.2: PM Accelerator Info Button
**As a** reviewer, **I want to** click an info button to learn about PM Accelerator **so that** I understand the context of this assessment.

- **Acceptance Criteria**:
  - [ ] "Info" or "About" button visible in header or footer
  - [ ] Clicking button opens modal or page with PM Accelerator description
  - [ ] Description sourced from PM Accelerator LinkedIn page
  - [ ] Link to PM Accelerator LinkedIn page included
  - [ ] Modal/page is easy to close and doesn't disrupt workflow

- **Technical Notes**:
  - Modal component with PM Accelerator description
  - LinkedIn page: https://www.linkedin.com/company/product-manager-accelerator/

## Non-Functional Requirements

### Performance
- **Response Time**:
  - Location validation + weather retrieval: < 2 seconds (95th percentile)
  - Database CRUD operations: < 500ms (95th percentile)
  - Page load (initial): < 3 seconds on 3G connection
- **Throughput**:
  - Support at least 10 concurrent demo viewers without degradation
- **Resource Constraints**:
  - Free-tier APIs only (no billing)
  - AWS Free Tier eligible EC2 instance (t2.micro or t3.micro)

### Security & Privacy
- **Authentication**: Not required (single-user demo, no sensitive data)
- **Data Protection**:
  - API keys stored in environment variables (never in code)
  - HTTPS optional but recommended (Let's Encrypt)
- **Compliance**:
  - Attribution for weather data if required by API terms
  - Respect API rate limits and terms of service

### Usability & Accessibility
- **Accessibility Standards**: Basic WCAG 2.1 Level A compliance
  - Keyboard navigation support
  - Semantic HTML elements
  - Alt text for images/icons
  - Sufficient color contrast
- **Device/Browser Support**:
  - Desktop browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
  - Mobile responsive optional but nice-to-have
- **Localization**: English only (no i18n required)

### Reliability & Availability
- **Uptime**: Best effort (not production SLA, but should be stable for demo period)
- **Data Durability**: Database backups recommended but not required
- **Disaster Recovery**: Not required for assessment

## Technical Constraints

### Deployment Constraints
- **Platform**: AWS Ubuntu EC2 instance
- **Access**: Public IP or domain (reviewers must access via web, not localhost)
- **Timeline**: Must be deployed and accessible within 5-day assessment period

### API Constraints
- **Weather API**: Free tier only (Open-Meteo recommended: unlimited free)
- **Geocoding API**: Free tier only (Geoapify recommended: 3,000 req/day)
- **YouTube API**: Optional, free tier (10,000 quota units/day)

### Database Constraints
- **Technology**: SQL (PostgreSQL recommended) or NoSQL (MongoDB)
- **Hosting**: Local on EC2 instance OR AWS RDS Free Tier
- **Schema**: Must support CRUD operations efficiently

### Technology Stack (Developer's Choice)
- **Framework**: Any modern full-stack framework (Next.js, Django, Rails, etc.)
- **Language**: Any (JavaScript/TypeScript, Python, Ruby, Go, etc.)
- **Database**: PostgreSQL, MySQL, MongoDB, SQLite (for demo)

## Dependencies

### External Services
- **Weather API**: Open-Meteo (https://open-meteo.com/) - PRIMARY RECOMMENDATION
- **Geocoding API**: Geoapify (https://www.geoapify.com/) - PRIMARY RECOMMENDATION
- **YouTube API** (Optional): YouTube Data API v3
- **Map Tiles** (Optional): OpenStreetMap + Leaflet.js

### Internal Systems
- None (standalone application)

### Data Sources
- **Weather Data**: Real-time from weather API (updated every request, no stale data)
- **Location Data**: Real-time from geocoding API
- **Saved Queries**: Application database

## MVP Scope

**Goal**: Deliver Tech Assessment 1 (Epic 1) by Day 3, then iteratively add Tech Assessment 2 features (Epics 2-5) by Day 5.

### Phase 1: Tech Assessment 1 - MVP (Days 1-3)
**Included**:
- ✅ Epic 1: Location-Based Weather Retrieval (ALL stories)
  - Current weather by flexible location input
  - Current location weather (browser geolocation)
  - 5-day weather forecast
  - Weather visualization (icons)
- ✅ Epic 6: Application Branding & Info (ALL stories)
  - Developer name display
  - PM Accelerator info button
- ✅ Basic UI (functional, not polished)
- ✅ Local development environment working
- ✅ README with setup instructions

**Success Criteria**:
- All Tech Assessment 1 requirements met
- Application runs locally without errors
- Code is clean and documented

### Phase 2: Tech Assessment 2 - Enhanced (Days 3-5)
**Included** (Priority order):
1. ✅ Epic 3: Query Persistence & CRUD Operations (MANDATORY)
   - Create, Read, Update, Delete saved queries
   - Database schema and migrations
2. ✅ Epic 2: Date Range Weather Analysis (HIGH VALUE)
   - Date range queries
   - Date validation
3. ⚠️ Epic 5: Data Export (MEDIUM VALUE - Pick 2-3 formats)
   - JSON export (easiest, high value)
   - CSV export (high value for spreadsheets)
   - One of: PDF, Markdown, or XML
4. ⚠️ Epic 4: Multi-Source Enrichment (OPTIONAL - If time permits)
   - Location map display (Leaflet.js - easier than YouTube)
   - OR YouTube videos (if comfortable with YouTube API)

**Success Criteria**:
- CRUD operations fully functional
- Date range queries working (historical + forecast)
- At least 2 export formats working
- Code quality maintained

### Phase 3: Deployment & Polish (Day 5)
**Included**:
- ✅ AWS EC2 deployment
  - Ubuntu server setup
  - Nginx configuration
  - Database setup (PostgreSQL on EC2 or RDS)
  - Environment variable configuration
  - Process manager (PM2 or systemd)
- ✅ Public access configuration
  - Security group rules
  - Public IP or domain setup
- ✅ Deployment documentation
  - Setup script or detailed instructions
  - Environment variable template
- ✅ Demo video (1-2 minutes)
  - Screen recording showing all features
  - Voiceover or captions explaining features
- ✅ GitHub repository finalization
  - README with complete setup instructions
  - Requirements file
  - .gitignore configured (no API keys in repo)
  - Repository set to public or PMA-Community collaboration

**Success Criteria**:
- Application accessible via public URL
- All features working in production
- Demo video clearly shows functionality
- Documentation is complete and accurate

### Explicitly Excluded (Post-Assessment Enhancements)
- ❌ User authentication and multi-user support
- ❌ Real-time weather updates (websockets/polling)
- ❌ Advanced data visualization (charts, graphs)
- ❌ Mobile app development
- ❌ Extensive unit/integration testing (functional demo prioritized)
- ❌ CI/CD pipeline
- ❌ Advanced caching strategies
- ❌ Internationalization (i18n)
- ❌ Advanced security features (rate limiting, DDoS protection)
- ❌ Extensive error monitoring/logging (basic console logs acceptable)

## Success Metrics

### User Metrics (Demo Performance)
- **Task Completion Rate**: 100% of demo tasks completed successfully
- **Error Rate**: < 5% of demo interactions result in errors
- **Response Time**: All interactions feel responsive (subjective but important)

### Technical Metrics (Code Review)
- **Code Quality**: Clean, readable, well-commented code
- **Architecture**: Clear separation of concerns, logical file structure
- **Documentation**: Comprehensive README, inline code comments where needed
- **API Integration**: Proper error handling, no hardcoded credentials

### Assessment Metrics (Submission)
- **Completeness**: Tech Assessment 1 (100%) + Tech Assessment 2 (aim for 70%+ of features)
- **Deployment**: Successfully deployed to AWS with public access
- **Demo Video**: Clear, concise demonstration of all features
- **Timeline**: Submitted within 5-day deadline

## Release Strategy

### Day 1: Project Setup & Core Architecture
- Repository initialization
- Technology stack selection and setup
- Database schema design
- API integration testing (weather + geocoding)
- Basic UI scaffolding

### Day 2-3: Tech Assessment 1 Development
- Location input and validation
- Current weather display
- 5-day forecast
- Weather icons
- Current location feature
- Application branding
- Local testing and refinement

### Day 3-4: Tech Assessment 2 Development
- Database setup and migrations
- CRUD operations implementation
- Date range query logic
- Export functionality (JSON, CSV minimum)
- Optional: Location enrichment (map or videos)

### Day 5: Deployment & Finalization
- AWS EC2 setup and deployment
- Production testing
- Demo video recording
- Documentation finalization
- GitHub repository cleanup
- Submission via Google Form

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limits exceeded during demo | High | Medium | Use Open-Meteo (unlimited) and Geoapify (3,000/day ample for demo) |
| AWS deployment complexity delays completion | High | Medium | Test deployment early (Day 3-4), use deployment checklist, have rollback plan |
| Date range logic bugs with historical/forecast split | Medium | High | Design clear split logic upfront, extensive testing of edge cases |
| Location fuzzy matching returns poor results | Medium | Medium | Use Geoapify confidence scores, manual testing with diverse inputs |
| Database schema requires late changes | Medium | Low | Design schema upfront considering all CRUD requirements |
| Export formats fail to preserve data fidelity | Low | Medium | Test each export format with sample data early |
| Demo video recording issues (audio, screen quality) | Medium | Low | Use reliable screen recording tool, rehearse before final recording |
| GitHub repository accidentally exposes API keys | High | Low | Use .gitignore from start, environment variables only, pre-submission audit |
| Browser geolocation denied by users | Low | High | Graceful fallback to manual entry, clear messaging |
| Time runs out before all Tech Assessment 2 features complete | Medium | Medium | Prioritize CRUD and date range (mandatory/high value), export formats are nice-to-have |

## Open Questions

- [ ] **Technology Stack Decision**: Next.js (TypeScript) vs Django (Python) vs other? (Recommend: Next.js for AWS deployment ease)
- [ ] **Database Hosting**: PostgreSQL on EC2 vs AWS RDS Free Tier? (Recommend: PostgreSQL on EC2 for simplicity)
- [ ] **Export Format Priority**: Which 2-3 formats most valuable? (Recommend: JSON, CSV, PDF)
- [ ] **Map vs Videos**: If time limited, which enrichment feature? (Recommend: Map with Leaflet.js - easier than YouTube API)
- [ ] **Domain Name**: Use AWS public IP or configure custom domain? (Recommend: Public IP acceptable for demo)
- [ ] **SSL Certificate**: Set up Let's Encrypt HTTPS or use HTTP for demo? (Recommend: HTTP acceptable, HTTPS nice-to-have)

## Glossary

- **CRUD**: Create, Read, Update, Delete - basic database operations
- **Geocoding**: Converting addresses/place names to geographic coordinates (lat/long)
- **Reverse Geocoding**: Converting coordinates to human-readable addresses
- **Fuzzy Matching**: Approximate string matching that tolerates typos and variations
- **API Rate Limit**: Maximum number of API requests allowed in a time period
- **EC2**: Elastic Compute Cloud - AWS virtual server service
- **RDS**: Relational Database Service - AWS managed database service
- **MVP**: Minimum Viable Product - smallest feature set that delivers core value

---
*This PRD is a living document. Updates should be tracked with version notes below.*

## Version History
- v1.0 - 2025-10-06 - Initial PRD with full Tech Assessment 1 & 2 requirements
- v1.1 - 2025-10-06 - Added AWS Ubuntu deployment constraint
