# Changelog

All notable changes to Marvel Champions Deck Collection will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Develop Branch

### ✨ **Enhanced User Experience**

#### **Conflict Modal Improvements (v1.1)**
- **Mobile-Optimized Layout**: Compact 2-line design for better mobile experience with inline deck names
- **Desktop Grid System**: 12-column layout for consistent alignment across all conflict entries  
- **Responsive Modal Design**: Full-height (90vh) modal reduces scrolling and maximizes screen usage
- **Enhanced Visual Hierarchy**: Improved spacing, faction colors, and professional typography
- **Template Bug Fix**: Resolved syntax error that prevented server startup

#### **Advanced Card Display System (v1.1)**
- **Faction-Based Organization**: Cards grouped by Marvel Champions factions with color-coded headers
- **Card Type Sub-Sorting**: Alphabetical organization within factions (Events → Supports → Upgrades)
- **Enhanced Readability**: Card quantities moved to front, full card names without truncation
- **Structured Layout**: Bordered faction groups with card type headers showing counts
- **Database Enhancement**: Added faction field to DeckCard model with proper migration

#### **Comprehensive Mobile UX (v1.1)**
- **Optimized Navigation**: Shortened app title "MarvelCDC" with smooth slide-in burger menu
- **Enhanced Dashboard**: Larger view toggle buttons and mobile-optimized card layouts
- **Touch-Friendly Controls**: Larger quantity controls and touch targets throughout app
- **Mobile Table Replacement**: Card-style list layout replaces cramped mobile tables
- **Responsive Typography**: Proper mobile spacing and typography improvements

#### **Professional Site Elements (v1.1)**
- **Site-Wide Footer**: Dark grey footer with clear visual distinction from body content
- **Comprehensive About Page**: Detailed explanation of MarvelCDC purpose and features
- **Creator Attribution**: Links to OrangeViking's MarvelCDB profile with proper acknowledgment
- **Legal Compliance**: Fantasy Flight Games IP acknowledgment using official MarvelCDB wording
- **Public Accessibility**: About page accessible without authentication for transparency

#### **Collection Management Enhancements (v1.1)**
- **Complete Pack Integration**: Full onboarding system with all pack categories including scenarios
- **Visual Collection Summary**: Compact summary cards showing ownership statistics
- **Optimized Pack Selection**: Enhanced pack table with better mobile controls

### 🔧 **Technical Improvements**

#### **API Enhancements**
- **Fixed Card Type Mapping**: Corrected conflicts API to use `card.cardType` instead of deprecated `card.type`
- **Improved Data Accuracy**: Enhanced conflict detection with proper card type information
- **Alphabetical Sorting**: Card types now sorted alphabetically for consistent organization

#### **Frontend Architecture**
- **Enhanced Utilities**: New `cardSorting.ts` utilities for faction-based organization
- **Responsive Components**: All components optimized for mobile-first design
- **Performance Optimization**: Improved rendering with proper grid alignment and efficient layouts

#### **Database Schema**
- **Faction Support**: Added faction field to DeckCard model with migration
- **Data Migration Scripts**: Automated faction data population for existing records

### 🐛 **Bug Fixes**
- **Template Syntax Error**: Fixed Vue template syntax preventing server startup
- **Card Type Display**: Resolved "Other" showing for all cards in conflict modal
- **Mobile Layout Issues**: Fixed grid height problems with multi-line card titles
- **Navigation Bugs**: Removed broken import links and improved menu functionality

### 📱 **Mobile Experience Highlights**
- **Conflict Modal**: Compact stacked layout with inline deck information
- **Dashboard Views**: Optimized card grids and improved table alternatives  
- **Navigation**: Smooth animations and larger touch targets
- **Collection Page**: Enhanced pack selection with mobile-friendly controls
- **Overall UX**: Consistent mobile-first design language throughout application

---

## [1.0.0] - 2025-01-16

### 🎉 **Initial Production Release**

The first stable release of Marvel Champions Deck Collection - a comprehensive web application for managing your Marvel Champions LCG deck collection and tracking conflicts.

### ✨ **New Features**

#### **Core Functionality**
- **Real-time Conflict Detection**: Automatically detect card conflicts between active decks based on your collection
- **Collection Management**: Track pack ownership with detailed statistics and summaries
- **Deck Import**: Import decks directly from MarvelCDB URLs with full validation
- **User Authentication**: Secure session-based authentication with Argon2 password hashing

#### **User Interface**
- **Dual View Modes**: Switch between card grid and detailed table layouts
- **Hero Thumbnails**: Visual deck representation using MarvelCDB hero card images
- **Enhanced Import Form**: Professional import interface with gradient backgrounds and rich feedback
- **Responsive Design**: Optimized for both desktop and mobile devices
- **External Deck Links**: Click deck titles to view original decks on MarvelCDB

#### **Advanced Features**
- **Expandable Table View**: Click deck rows to reveal detailed card lists and conflicts
- **Visual Status Indicators**: Color-coded deck status (Ready/Conflicts/Inactive)
- **Collection Summary**: Real-time statistics showing owned vs missing packs
- **Scenario Pack Support**: Complete pack categorization including scenario packs

#### **Data Integration**
- **Real MarvelCDB Data**: Syncs 55+ packs and 3,500+ cards from MarvelCDB API
- **Cross-Pack Card Aggregation**: Handles cards that appear in multiple packs (e.g., Quincarrier)
- **Accurate Conflict Detection**: Uses real card quantities per pack for precise calculations

### 🛡️ **Security Features**

- **Argon2 Password Hashing**: Industry-standard password security with optimal parameters
- **HTTP-Only Cookies**: Session tokens stored securely to prevent XSS attacks
- **CSRF Protection**: SameSite cookie configuration prevents cross-site attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, and Referrer-Policy
- **Input Validation**: Zod schemas validate all API inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection attacks
- **Cryptographically Secure Sessions**: Uses crypto.randomBytes() for session generation

### 🏗️ **Technical Implementation**

#### **Frontend**
- **Nuxt 3**: Modern Vue.js framework with TypeScript support
- **Vue 3 Composition API**: Reactive state management with TypeScript
- **Tailwind CSS**: Utility-first styling with Marvel Champions theme colors
- **Pinia**: State management for authentication, decks, and collection

#### **Backend**
- **Server API Routes**: RESTful API with proper error handling
- **Prisma ORM**: Type-safe database operations with PostgreSQL support
- **Session Management**: Secure session handling with automatic cleanup
- **External API Integration**: MarvelCDB API integration with error handling

#### **Database**
- **PostgreSQL Ready**: Production-ready PostgreSQL schema
- **SQLite Development**: Local SQLite for development convenience
- **Automated Migrations**: Database versioning with Prisma migrations
- **Data Seeding**: Automated MarvelCDB data synchronization

### 🚀 **Deployment Ready**

- **Heroku Support**: Complete Heroku deployment configuration
- **Docker Ready**: Containerization support for modern deployments
- **Environment Configuration**: Comprehensive environment variable management
- **Production Optimizations**: Security headers, build optimizations, and performance tuning

### 📁 **Project Structure**

```
├── components/          # Vue components (DeckCard, PackTable, AppHeader)
├── pages/              # Nuxt pages (Dashboard, Collection, Auth)
├── server/             # API routes and utilities
│   ├── api/           # RESTful API endpoints
│   └── utils/         # Authentication and database utilities
├── stores/            # Pinia stores (auth, decks, collection)
├── prisma/            # Database schema and migrations
├── scripts/           # Utility scripts (MarvelCDB sync)
└── assets/           # CSS and static assets
```

### 🔧 **Developer Experience**

- **TypeScript**: Full TypeScript support across frontend and backend
- **Hot Reload**: Fast development with Nuxt dev server
- **Database GUI**: Prisma Studio for database visualization
- **Code Quality**: ESLint and Prettier configuration
- **Documentation**: Comprehensive README and API documentation

### 📊 **Performance Features**

- **Optimized Queries**: Efficient database queries with proper indexing
- **Image Optimization**: Lazy loading and error handling for hero thumbnails
- **Caching**: Client-side caching with reactive updates
- **Bundle Optimization**: Tree-shaking and code splitting

### 🎯 **Use Cases**

Perfect for Marvel Champions LCG players who want to:
- Track their physical card collection across all released packs
- Import and manage multiple deck builds from MarvelCDB
- Identify card conflicts when multiple decks require the same cards
- Optimize deck selection based on available cards
- Plan future pack purchases based on deck requirements

### 🔄 **Future Roadmap**

While this release is feature-complete for core collection management, future enhancements may include:
- Advanced deck analytics and statistics
- Card usage tracking and recommendations
- Export functionality for collection reports
- Integration with additional deck databases
- Offline mode support

---

## Development History

This project evolved from a simple collection tracker to a comprehensive deck conflict management system. Key development milestones included:

1. **Authentication System**: Secure user management with session-based auth
2. **Collection Interface**: Pack selection with quantity management
3. **MarvelCDB Integration**: Real-time deck import and data synchronization
4. **Conflict Detection Algorithm**: Advanced card aggregation and conflict resolution
5. **UI/UX Enhancement**: Professional design with dual view modes
6. **Production Hardening**: Security review and deployment optimization

## Contributors

- **Primary Developer**: Full-stack development and architecture
- **UI/UX Design**: MarvelCDB-inspired visual design
- **Security Review**: Production security hardening
- **Testing**: Comprehensive manual testing and bug fixes

## Acknowledgments

Special thanks to:
- **MarvelCDB Community**: For providing the comprehensive card database API
- **Fantasy Flight Games**: For creating the amazing Marvel Champions LCG
- **Open Source Community**: For the excellent tools and frameworks used