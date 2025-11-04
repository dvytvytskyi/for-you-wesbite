Public Website Development Plan
Project Structure
website/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── [locale]/                 # i18n routes (en, ru)
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx          # Properties list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Property detail
│   │   │   ├── map/
│   │   │   │   └── page.tsx          # Map page
│   │   │   ├── areas/
│   │   │   │   ├── page.tsx          # All areas
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Area detail
│   │   │   ├── developers/
│   │   │   │   ├── page.tsx          # All developers
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Developer detail
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # About page
│   │   │   └── blog/
│   │   │       ├── page.tsx          # Blog list
│   │   │       └── [slug]/
│   │   │           └── page.tsx      # Blog post
│   │   ├── layout.tsx                # Root layout with SEO
│   │   └── metadata.ts               # Metadata config
│   ├── components/
│   │   ├── filters/
│   │   │   ├── QuickFilter.tsx       # Homepage quick filter
│   │   │   ├── PropertyFilters.tsx   # Advanced filters
│   │   │   ├── BedroomDropdown.tsx   # Multiselect bedrooms
│   │   │   └── PriceRange.tsx        # Price filter
│   │   ├── cards/
│   │   │   ├── PropertyCard.tsx      # Property card component
│   │   │   ├── AreaCard.tsx          # Area card
│   │   │   └── DeveloperCard.tsx     # Developer card
│   │   ├── map/
│   │   │   ├── MapboxMap.tsx         # Main map component
│   │   │   ├── PropertyMarker.tsx    # Map marker
│   │   │   ├── PolygonDraw.tsx       # Polygon drawing tool
│   │   │   └── PropertyPopup.tsx     # Map popup modal
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Site header
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   └── LanguageSwitcher.tsx  # i18n switcher
│   │   ├── pagination/
│   │   │   └── Pagination.tsx        # Pagination component
│   │   └── auth/
│   │       ├── InvestorDashboard.tsx # Investor features
│   │       ├── BrokerDashboard.tsx   # Broker features
│   │       └── CollectionsManager.tsx # Collections for brokers
│   ├── lib/
│   │   ├── api.ts                   # API client (axios)
│   │   ├── mapbox.ts                 # Mapbox config
│   │   ├── i18n.ts                   # i18n config
│   │   └── utils.ts                  # Utility functions
│   ├── hooks/
│   │   ├── useProperties.ts          # Properties data hook
│   │   ├── useFilters.ts             # Filter state hook
│   │   └── useAuth.ts                # Auth hook
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   └── styles/
│       └── globals.css               # Global styles
├── public/
│   ├── images/
│   └── locales/                      # i18n JSON files
│       ├── en.json
│       └── ru.json
├── next.config.js                    # Next.js config
├── tsconfig.json
├── package.json
└── .env.local                        # API keys, Mapbox token
Technology Stack
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS
i18n: next-intl or next-i18next
Maps: Mapbox GL JS
HTTP Client: Axios
State Management: React Context + Hooks (or Zustand)
Forms: React Hook Form + Zod
Image Optimization: Next.js Image component
SEO Configuration
1. Metadata Setup (src/app/metadata.ts)
Generate dynamic metadata for all pages
Open Graph tags
Twitter Card tags
Canonical URLs
Structured data (JSON-LD) for properties
Sitemap generation
robots.txt
2. Page-Level SEO
Each page exports generateMetadata() function
Dynamic meta titles/descriptions based on content
Image alt tags
Semantic HTML (header, nav, main, article, etc.)
i18n Implementation
Configuration
Default locale: en
Supported locales: en, ru
URL structure: /[locale]/...
Middleware for locale detection and redirection
Language switcher component
Translation Files
locales/en.json - English translations
locales/ru.json - Russian translations
Namespaced keys: common, home, properties, filters, etc.
API Integration
Base API Client (src/lib/api.ts)
- Create axios instance
- Set base URL from env (NEXT_PUBLIC_API_URL)
- Add X-API-Key and X-API-Secret headers
- Handle errors and loading states
- Type-safe responses
API Endpoints Used
GET /api/public/data - All data (properties, areas, developers, etc.)
GET /api/news - Blog posts
GET /api/properties - Filtered properties
GET /api/properties/:id - Single property
Auth endpoints (to be added - see separate plan)
Pages Implementation
1. Homepage (/[locale]/page.tsx)
Features:

Hero section with quick filter:
Search input
Bedrooms selector
Search button
Top 3 Areas section:
Business Bay, Dubai Marina, JVC
Show project count for each
Link to area detail
Top 3 Developers section:
Emaar, Damac, Binghatti
Show project count for each
Link to developer detail
SEO: Dynamic meta for homepage
2. Properties List (/[locale]/properties/page.tsx)
Filters:

Property type toggle (New Building / Secondary)
Search bar
Bedrooms dropdown (multiselect)
Size range (from - to)
Price range (from - to)
Apply/Reset buttons
Display:

36 properties per page
Property cards with:
Photo carousel (multiple images with scroll)
Property name
Location (area, city)
Price (USD, AED, EUR)
Developer name
Bedrooms count
Bathrooms count
Size (sqm/sqft)
Link to detail page
Pagination component (36 items per page)
SEO: Dynamic meta based on filters
3. Property Detail (/[locale]/properties/[id]/page.tsx)
Display:

All data from API schema
Image gallery
Map with property location
Share buttons
Contact form/button
Similar properties section
SEO: Rich metadata with property details, images
4. Map Page (/[locale]/map/page.tsx)
Mapbox Integration:

Mapbox GL JS setup
Display all properties as markers
Toggle between "New Building" and "Secondary"
Property type filtering
Polygon drawing tool:
Draw area on map
Filter properties within polygon
Clear polygon
Property popup on marker click:
Property photo
Name
Developer
Price
Bedrooms
Link to detail page
Clustering for markers when zoomed out
SEO: Map page metadata
5. Areas List (/[locale]/areas/page.tsx)
Grid of area cards
Each card shows:
Area name
City name
Property count
Image (when available)
Link to area detail
SEO: Areas listing metadata
6. Area Detail (/[locale]/areas/[slug]/page.tsx)
Content:

Area name (EN/RU)
Description (from API - to be added in admin)
Photo gallery (from API - to be added in admin)
Location map
Properties list:
All properties in this area
Property cards (same as main list)
Pagination
SEO: Dynamic meta with area name, description, images
7. Developers List (/[locale]/developers/page.tsx)
Grid of developer cards
Each card shows:
Developer logo
Developer name
Property count
Link to developer detail
SEO: Developers listing metadata
8. Developer Detail (/[locale]/developers/[slug]/page.tsx)
Content:

Developer name
Logo
Description (from API)
Photo gallery (from API - to be added in admin)
Properties list:
All properties by this developer
Property cards
Pagination
SEO: Dynamic meta with developer info
9. About Page (/[locale]/about/page.tsx)
Marketing content
Team section (if needed)
Contact information
SEO: About page metadata
10. Blog List (/[locale]/blog/page.tsx)
Fetch from /api/news
Display news posts as cards
Pagination
SEO: Blog listing metadata
11. Blog Post (/[locale]/blog/[slug]/page.tsx)
Full article from API
Multi-language content support
Related posts
SEO: Article metadata with images, description
Authentication System
Auth Routes ((auth)/login, (auth)/register)
Login form (email/password)
Register form (with role selection: Investor/Broker)
JWT token storage (httpOnly cookies for security)
Role-based redirect after login
Investor Dashboard (protected route)
Features:

List of invested properties (requires backend API)
Property status tracking
Investment details
Sync with mobile app (requires API endpoints)
Broker Dashboard (protected route)
Features:

Collections management:
Create/edit/delete collections
Add/remove properties to collections
View collections (sync with app)
Liked properties list (sync with app)
Knowledge base access (from /api/courses)
Sync with mobile app (requires API endpoints)
Mapbox Implementation
Setup (src/lib/mapbox.ts)
Mapbox access token from env
Default map style
Center coordinates (Dubai)
Zoom levels
Components
MapboxMap.tsx: Main map container
PropertyMarker.tsx: Custom marker with property data
PolygonDraw.tsx: Draw and edit polygon functionality
PropertyPopup.tsx: Modal popup on marker click
Features
Marker clustering
Property type filtering
Polygon area selection
Property details on click
State Management
Context Providers
AuthContext - User authentication state
FilterContext - Global filter state
LanguageContext - Current locale
Custom Hooks
useProperties() - Fetch and cache properties
useFilters() - Filter state management
useAuth() - Authentication logic
useMapbox() - Map instance management
Responsive Design
Mobile-first approach
Breakpoints: sm, md, lg, xl, 2xl
Touch-friendly map controls
Responsive property cards
Mobile navigation menu
Performance Optimization
Next.js Image optimization
Code splitting per route
Lazy loading for maps
Property data caching
SSR for SEO-critical pages
ISR for dynamic content (areas, developers)
Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_API_SECRET=your_api_secret
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
Additional Notes
Areas and Developers need additional fields in backend (description, images) - see separate API extension plan
Authentication endpoints for website users need to be added to backend
Mobile app sync requires new API endpoints (collections, likes, investments)