# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Database operations
npx prisma generate      # Generate Prisma client after schema changes
npx prisma migrate dev   # Create and apply new migrations
npx prisma studio       # Open database GUI for data inspection
npx prisma db push      # Push schema changes without migration (dev only)

# Build and deployment
npm run build           # Build for production
npm run preview         # Preview production build
```

## Architecture Overview

This is a **Nuxt 3 full-stack application** for Marvel Champions LCG collection management with the following architecture:

### Tech Stack
- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Nuxt server API routes with JWT authentication
- **Database**: Prisma ORM with PostgreSQL (both local and Railway production)
- **State**: Pinia stores for client-side state management

### Data Flow Architecture
1. **User Authentication**: JWT tokens stored in HTTP-only cookies, validated via `requireAuth()` utility
2. **Collection Management**: Users define owned pack quantities → used for conflict calculation
3. **Deck Import**: MarvelCDB URLs → parsed deck data → stored with cards → conflict detection
4. **Conflict Detection**: Active decks × card requirements vs. collection × pack quantities = conflicts

## Key Implementation Patterns

### Server API Routes (`server/api/`)
All protected routes use this pattern:
```typescript
export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)
  // ... route logic
})
```

### State Management (`stores/`)
Three main stores:
- **auth.ts**: User authentication state and token management
- **decks.ts**: Deck collection, import, activation, and conflict resolution
- **collection.ts**: Pack ownership tracking and collection updates

### Database Schema (`prisma/schema.prisma`)
- **User** → **Collection** (pack ownership) + **Deck** → **DeckCard** relationships
- Conflict detection queries across active decks and user collection

## Current Implementation State - PRODUCTION READY WITH ENHANCED UX

### MarvelCDB Integration Status ✅ COMPLETE
The application now uses **real MarvelCDB data** instead of mock data:

1. **Pack Database** (`/scripts/sync-marvelcdb-data.ts`): 
   - Syncs 55+ packs from marvelcdb.com/api/public/packs/ 
   - Stores in local `packs` table with proper categorization
   - Run: `npm run sync:marvelcdb`

2. **Card Database**: 
   - Syncs 3,500+ cards from marvelcdb.com/api/public/cards/{pack_code}
   - Stores in local `cards` table with pack relationships
   - Real card quantities per pack (not assumed 1)

3. **Deck Import** (`server/api/import.post.ts`): 
   - Fetches real deck data from marvelcdb.com/api/public/decklist/{id}
   - Uses local card database for validation and conflict detection
   - **NEW**: Enhanced import form with professional UI design

### Latest UI/UX Enhancements ✅ COMPLETE (v2.0)

#### Enhanced Deck Display System
1. **Dual View Modes**: 
   - **Card View**: Grid layout with MarvelCDB-inspired design
   - **Table View**: Compact tabular layout with expandable details
   - Toggle between views with persistent user preference

2. **Hero Thumbnails Integration**:
   - Real hero card images from MarvelCDB API
   - Graceful fallback for missing images
   - Consistent sizing and styling across all views

3. **Professional Import Interface**:
   - Gradient background with Marvel Champions theme colors
   - Enhanced input field with better placeholder text
   - Improved button styling with loading states and icons
   - Rich error/success message display with icons
   - Enter key support for quick importing

4. **Advanced Table View Features**:
   - **Expandable Deck Details**: Click any deck row to show full card list and conflicts
   - **Visual Indicators**: Chevron arrows with smooth rotation animations
   - **Comprehensive Card Display**: Shows card types, quantities, and conflict status
   - **Dedicated Conflicts Section**: Detailed conflict information with visual indicators

5. **Responsive Card Layout**:
   - Fixed grid alignment with `items-start` - prevents multi-line titles from affecting other cards
   - Each card maintains independent height based on content
   - Improved visual hierarchy and spacing

6. **External Deck Links**:
   - **Clickable Deck Titles**: Both card and table views link to original MarvelCDB deck pages
   - Opens in new tabs with security attributes
   - Visual hover feedback with red accent color
   - Proper event handling to prevent conflicts with table expansion

### Enhanced Conflict Detection Algorithm ✅ COMPLETE
Located in `server/api/conflicts.get.ts` and `server/api/import.post.ts`:

**Key Features:**
1. **Real Pack Ownership**: `packsOwned × cardsPerPack = totalAvailable`
2. **Card Name Aggregation**: Cards like "Quincarrier" that appear in multiple packs (bkw, wsp, warm) are properly aggregated by name instead of card code
3. **Cross-Pack Totaling**: If user owns Black Widow (1 Quincarrier) + Wasp (1 Quincarrier) = 2 total Quincarrier cards available

**Algorithm Flow:**
1. Group deck card usage by **card name** (not card code)
2. Query ALL cards with same name across all packs
3. Calculate total ownership: `Σ(packsOwned × cardsPerPack)` for each pack containing that card
4. Generate conflicts only when `totalNeeded > totalAvailable`

### Database Schema Updates ✅ COMPLETE
**New Tables:**
- `packs`: id, code, name, type, released, position
- `cards`: id, code, name, pack_code, card_type, faction, cost, traits, quantity
- `collections`: Updated to reference pack.code instead of storing pack names

**Key Relationships:**
- Pack → Cards (one-to-many)
- Collection → Pack (foreign key on pack_code)
- No foreign key constraints between DeckCard → Card (avoids import conflicts)

### UI Components Architecture
- **DeckCard.vue**: MarvelCDB-inspired design with hero thumbnails, conflict indicators, and external links
- **PackTable.vue**: Responsive table component for pack collection management with quantity controls
- **AppHeader.vue**: Streamlined navigation (removed redundant import link)
- **pages/index.vue**: Dual-view dashboard with enhanced import form and table expansion features
- **pages/collection.vue**: Complete pack collection interface with scenario pack support
- Custom CSS classes in `assets/css/main.css` using Marvel Champions brand colors

### Sync Script Commands
```bash
# Sync latest pack and card data from MarvelCDB
npm run sync:marvelcdb

# View database in Prisma Studio
npx prisma studio
```

## Known Issues Resolved

### ✅ FIXED: False Conflict Detection
- **Issue**: Conflict detection showed cards as unavailable when user owned required packs
- **Cause**: Algorithm used `packQuantity` instead of `packQuantity × cardsPerPack`
- **Solution**: Updated to use real card quantities per pack

### ✅ FIXED: Multi-Pack Card Aggregation  
- **Issue**: Cards like "Quincarrier" appear in multiple packs (bkw, wsp, warm) but conflicts only counted one pack
- **Cause**: Algorithm grouped by card code instead of card name
- **Solution**: Group by card name and aggregate ownership across all packs containing that card

### ✅ FIXED: Collection Summary Calculation
- **Issue**: Collection summary showed "Missing 5 packs" even when all visible packs were owned
- **Cause**: Scenario packs were missing from the UI but included in total count
- **Solution**: Added scenario pack section to collection page with proper styling

### ✅ FIXED: Navigation Menu 404
- **Issue**: Menu contained broken "Import Deck" link that resulted in 404 errors
- **Solution**: Removed redundant import link since import functionality exists on dashboard

### ✅ FIXED: Card Grid Height Issues
- **Issue**: Cards with multi-line titles affected the height of other cards in the same row
- **Solution**: Added `items-start` to grid container to prevent height synchronization

### ✅ FIXED: Railway Deployment Issues (January 2025)
- **Issue**: Node.js version compatibility - Railway used v22.11.0 but app required >=22.12.0
- **Solution**: Created Dockerfile with `FROM node:22.12.0` (standard, not Alpine)

- **Issue**: Prisma engine compatibility with Alpine Linux - OpenSSL library missing
- **Solution**: Switched from `node:22.12.0-alpine` to `node:22.12.0` for OpenSSL support

- **Issue**: SQLite migrations incompatible with PostgreSQL production database
- **Solution**: Migrated to PostgreSQL for both local and production environments

- **Issue**: Failed migration state in production database
- **Solution**: Used `railway run npx prisma migrate reset --force` to clean and reapply

## Database Environment

**Production (Railway)**: PostgreSQL database with automated migrations
**Local Development**: PostgreSQL via Docker container for environment consistency

### Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string (Railway production or local Docker container)
- `JWT_SECRET`: JWT signing secret

### Local PostgreSQL Setup:
```bash
# Start local PostgreSQL container
docker run --name marvelcdc-postgres \
  -e POSTGRES_DB=marvelcdc_dev \
  -e POSTGRES_USER=marvelcdc \
  -e POSTGRES_PASSWORD=marvelcdc123 \
  -p 5432:5432 \
  -d postgres:14

# Apply migrations and seed data
npx prisma migrate deploy
npm run sync:marvelcdb
```

### Database Deployment Process:
1. **Schema**: Uses hardcoded `provider = "postgresql"` for consistency
2. **Migrations**: PostgreSQL-specific migrations in `prisma/migrations/`
3. **Local**: Docker PostgreSQL container for development
4. **Production**: Railway PostgreSQL with standard Node.js image
5. **Migration Commands**:
   ```bash
   # Local development
   npx prisma migrate deploy
   npm run sync:marvelcdb
   
   # Railway production
   railway run npx prisma migrate deploy
   railway run npm run sync:marvelcdb
   ```

## Production Notes

The application is **production-ready** with comprehensive MarvelCDB integration and enhanced user experience:

### Feature Completeness (v2.0)
- ✅ **Real-time conflict detection** with cross-pack card aggregation
- ✅ **Professional UI design** matching MarvelCDB aesthetics  
- ✅ **Dual view modes** (card grid + expandable table)
- ✅ **Hero thumbnail integration** with graceful fallbacks
- ✅ **External deck linking** to original MarvelCDB pages
- ✅ **Complete pack collection management** including scenario packs
- ✅ **Enhanced import experience** with rich visual feedback
- ✅ **Responsive design** optimized for desktop and mobile

### Maintenance
- **Database Sync**: Run `npm run sync:marvelcdb` periodically when new packs are released
- **Image Cache**: Hero thumbnails are served directly from MarvelCDB CDN
- **Performance**: Local PostgreSQL ensures production environment consistency

### Deployment Readiness
- **Railway Platform**: Deployed with PostgreSQL database and Node.js 22.12.0
- **Docker Configuration**: Standard Node.js image for Prisma OpenSSL compatibility  
- **Database Migrations**: PostgreSQL-specific migrations successfully applied
- **Environment Variables**: DATABASE_URL (Railway PostgreSQL), JWT_SECRET, NODE_ENV
- **Static Asset Optimization**: Nuxt build process optimized for production
- **Security Measures**: JWT tokens, external link safety, input validation