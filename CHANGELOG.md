# Changelog

All notable changes to Marvel Champions Deck Collection will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-08-25

### 🎴 **Card Layout Improvements**

#### **Playing Card Design**
- **Aspect Ratio**: Cards now use authentic playing card dimensions (66:91 ratio)
- **Flip Animation**: Smooth 3D card flip animation to view deck contents
- **Card Back Design**: Physical card-inspired layout with Hero/Aspect/Basic grouping
- **Multi-Aspect Support**: Proper card grouping for heroes like Gamora and Warlock with multiple aspects
- **Dynamic Header Colors**: Aspect-based coloring (Red=Aggression, Blue=Leadership, Green=Protection, Yellow=Justice, Grey=No Aspect)

#### **Deck Status Indicators**
- **Ready for Play Stamp**: Diagonal green stamp when deck has no conflicts and is active
- **Deactivated Stamp**: Grey diagonal stamp for inactive decks
- **Visual Opacity**: 50% opacity applied to deactivated deck elements (title, thumbnail, stamps, card backs)
- **Conditional Hero Thumbnail**: Shows only when conflicts exist, hidden when deck is ready

#### **Conflict Display**
- **On-Card Conflicts**: Conflicts displayed directly on card front in compact format
- **Two-Column Layout**: Automatic column split for long conflict lists
- **Simplified Popup**: Smaller, single-column conflict details modal (max-width: sm)
- **Conflict Context**: Shows "Used in: [deck names]" or "Not in collection" for each conflict

### 🗑️ **Deck Management**

#### **Deck Deletion**
- **Delete Button**: Trash icon appears next to Activate button for deactivated decks only
- **Confirmation Modal**: Clean confirmation dialog before permanent deletion
- **Cascade Deletion**: Automatically removes deck and all associated cards from database
- **Security**: Ownership verification before deletion

#### **Deck Sorting**
- **Updated Order**: Decks sorted by most recently updated first
- **Activity-Based**: Recently activated/deactivated decks appear at top
- **Persistent Ordering**: Sort order maintained across page refreshes

### 🎯 **User Experience Enhancements**

#### **Interaction Improvements**
- **Action Button Protection**: Action buttons bar doesn't trigger card flip
- **Click Stop Propagation**: Better button targeting without accidental flips
- **Mobile Layout**: Responsive delete button placement for mobile devices
- **Stamp Positioning**: Better spacing with mt-8 to avoid overlapping deck titles

#### **Visual Polish**
- **Stamp Rotation**: Increased to -35deg for more dramatic effect
- **Border Styling**: Top/bottom borders only on stamps for cleaner look
- **Green Intensity**: Adjusted stamp colors and transparency for better readability
- **Footer Fix**: Resolved mobile footer overlap on login/registration forms

### 🔧 **Technical Improvements**

#### **Component Architecture**
- **Clean Template Structure**: Fixed missing closing tags and template issues
- **Proper Event Handling**: Added delete-deck emit and handlers
- **State Management**: Updated store with deck deletion functionality
- **API Integration**: Leveraged existing DELETE endpoint for deck removal

---

## [1.3.0] - 2025-08-24

### 🔒 **Privacy & Legal Compliance**

#### **Comprehensive Privacy Policy**
- **GDPR-Compliant Documentation**: Complete privacy policy covering data collection, usage, storage, and user rights
- **User Data Transparency**: Clear explanation of what information is collected and how it's used
- **Contact Information**: Dedicated `privacy@marvelcdc.com` email for privacy-related inquiries
- **Data Protection Compliance**: Simplified GDPR section focusing on compliance rather than detailed rights breakdown
- **Legal Framework**: Coverage of data retention, children's privacy, policy changes, and third-party integrations

#### **Enhanced Authentication UI**
- **AuthFooter Component**: Dedicated footer for authentication pages with consistent branding and legal links
- **Footer Integration**: Added Privacy Policy links to both main AppFooter and AuthFooter components
- **Bottom-Positioned Footer**: Fixed footer positioning to stick to bottom of screen on auth pages
- **Responsive Design**: Maintains clean spacing and proper layout across all screen sizes

#### **Email Communication Clarity**
- **Transactional Email Policy**: Clear explanation that only essential emails (verification, security) are sent
- **Unsubscription Policy**: Simplified to account closure as primary opt-out method
- **No Marketing Communications**: Removed references to marketing emails or communication preferences

### 🛡️ **Security & Privacy Enhancements**

#### **Navigation Security**
- **Conditional Menu Display**: Hide burger menu and profile dropdown for non-authenticated users
- **Access Control**: Prevent UI access to authenticated-only features through navigation
- **Clean Public Interface**: Non-authenticated users see only app title/logo in header
- **Proper Route Protection**: Privacy policy accessible publicly while other routes remain protected

#### **Privacy Policy Security**
- **Removed Technical Details**: Eliminated specific encryption implementation details (Argon2) from public documentation
- **Generic Security Language**: Uses industry-standard terminology while maintaining user confidence
- **Contact Security**: Professional privacy contact system with dedicated email channel

### 🎨 **User Experience Improvements**

#### **Authentication Page Layout**
- **Fixed Footer Positioning**: AuthFooter now properly sticks to bottom using CSS positioning
- **Preserved Original Spacing**: Maintained tight spacing between title and form content
- **Consistent Branding**: Footer links match main site navigation and styling
- **Professional Appearance**: Clean, uncluttered auth pages with proper footer placement

#### **Public Access Enhancement**
- **Privacy Policy Route**: Added `/privacy-policy` to public routes in auth middleware
- **Footer Navigation**: Privacy Policy accessible from all pages, authenticated and unauthenticated
- **Consistent Link Styling**: Red accent color and hover effects match site theme

### 📱 **Mobile & Responsive**

#### **Authentication Mobile Experience**
- **Bottom Footer**: Footer properly positioned at bottom of mobile viewport
- **Touch-Friendly Links**: Appropriately sized footer links for mobile interaction
- **Responsive Layout**: Privacy policy content optimized for mobile reading
- **Consistent Navigation**: Footer links work seamlessly across all device sizes

### 🔧 **Technical Improvements**

#### **Component Architecture**
- **AuthFooter Component**: Reusable authentication page footer with legal links and branding
- **Conditional Rendering**: Smart navigation component that shows/hides elements based on auth status
- **Privacy Policy Page**: Comprehensive Vue component with proper SEO meta tags
- **Route Configuration**: Updated middleware to handle public privacy policy access

#### **State Management Integration**
- **isAuthenticated Computed**: Leverages existing session state for navigation control
- **Reactive Navigation**: Navigation elements update automatically with authentication state
- **Clean Component Logic**: Separation of authenticated and public navigation elements

### 🐛 **Bug Fixes**
- **Footer Positioning**: Fixed floating footer issue on authentication pages
- **Navigation Display**: Resolved navigation elements showing for unauthenticated users
- **Route Access**: Fixed privacy policy accessibility from public routes
- **Layout Preservation**: Maintained original auth page layout while fixing footer position

---

## [1.2.0] - 2025-01-24

### 🎨 **Visual & UX Enhancements**

#### **BETA Ribbon System**
- **Environment-Controlled Banner**: Configurable BETA ribbon with `SHOW_BETA_RIBBON` environment variable
- **Diagonal Design**: Professional top-right corner placement with 45-degree rotation
- **Responsive Styling**: Scales appropriately across desktop and mobile devices
- **Non-Intrusive**: Clean design that doesn't interfere with existing UI elements

#### **Enhanced Mobile Navigation**
- **Professional Profile Dropdown**: Desktop dropdown menu with user profile management
- **Improved Burger Menu**: Mobile navigation with clear sectioning and "Navigation" title
- **User Section Integration**: Profile and logout options properly organized in mobile menu
- **Responsive Padding**: Dynamic spacing to prevent UI element overlap with BETA ribbon

#### **Card Images Integration**
- **MarvelCDB Image Display**: Full card images displayed alongside conflict information
- **Two-Column Layout**: Dedicated image column (200px) with content column for optimal viewing
- **PNG/JPG Fallback System**: Automatic format detection and fallback for missing images
- **Loading States**: Professional placeholder display during image loading
- **Error Handling**: Graceful degradation when card images are unavailable

#### **Player Side Scheme Rotation**
- **Automatic Card Rotation**: 90-degree clockwise rotation for horizontal player_side_scheme cards
- **Proper Scaling**: 1.5x scale factor ensures rotated cards are properly sized
- **Clean Appearance**: Removed shadows and borders from rotated cards for better visual distinction
- **Consistent Container**: All cards use uniform container dimensions regardless of rotation
- **Perfect Fit**: `object-fit: contain` ensures full card visibility without cropping

#### **Smart Collection Onboarding**
- **Auto-Hide Logic**: Quickstart banner automatically disappears when user owns 1+ packs
- **Improved UX Flow**: Removes visual clutter once collection setup has begun
- **Manual Override**: Users can still manually dismiss banner if preferred
- **Intelligent Detection**: Checks actual pack ownership rather than just user activity

### 🔧 **Technical Improvements**

#### **Component Architecture**
- **BetaRibbon Component**: Reusable ribbon component with environment variable integration
- **ProfileDropdown Component**: Professional dropdown with click-outside-to-close functionality
- **Enhanced Conflicts Page**: Two-column grid layout with proper image integration
- **Responsive Design**: All components optimized for mobile and desktop viewing

#### **State Management**
- **Image Loading States**: Reactive image loading and error state management
- **Format Detection**: Dynamic PNG/JPG format switching based on availability
- **Collection Awareness**: Smart banner visibility based on user's collection status

#### **CSS Enhancements**
- **Card Image Styling**: Professional card display with hover effects and transitions
- **Rotation Transforms**: Proper CSS transforms for scheme card rotation
- **Mobile Optimization**: Responsive container sizing (150×225px desktop, 120×180px mobile)
- **Visual Polish**: Consistent spacing, shadows, and border radius throughout

### 🐛 **Bug Fixes**
- **Vue Template Syntax**: Fixed missing closing tag that prevented component compilation
- **Navigation Overlap**: Resolved BETA ribbon covering logout button on mobile
- **Image Placeholder**: Fixed placeholder visibility logic for failed image loads
- **Component Integration**: Proper component imports and dependency management

### 📱 **Mobile Experience**

#### **Enhanced Navigation**
- **Profile Management**: Clean dropdown integration for user profile access
- **Organized Menu**: Clear sectioning with navigation title and user section
- **Touch Optimization**: Larger touch targets and improved spacing

#### **Card Display**
- **Responsive Images**: Card images scale appropriately for mobile viewing
- **Two-Column Layout**: Maintains professional appearance across all device sizes
- **Touch-Friendly**: Optimized for touch interaction and mobile viewing

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