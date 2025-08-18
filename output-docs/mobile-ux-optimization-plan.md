# Mobile View Optimization Plan for MarvelCDC

## Current Mobile Issues Identified

1. Header & Navigation

- Long app title "Marvel Champions Deck Collection" takes up too much horizontal space
- Header username/logout section could be better positioned for mobile
- Burger menu slides out well but could have better mobile UX

2. Dashboard Page (index.vue)

- Import section has good responsive design but could use more mobile-optimized spacing
- View toggle buttons (Cards/Table) are small for touch interaction
- Table view on mobile has cramped cells and poor readability
- Card grid has good responsive breakpoints but cards could be optimized for mobile real estate

3. Collection Page

- Collection summary cards stack well but could use more compact design
- PackTable has basic mobile responsiveness but quantity controls are small for touch
- Table scrolls horizontally but this isn't ideal UX for mobile

4. DeckCard Component

- Good mobile layout but action buttons could be larger for touch
- Hero thumbnails are appropriately sized but card content could be more compact

## Proposed Mobile Optimizations

### Phase 1: Header & Navigation

- Shorten app title to "Marvel CDC" on mobile screens
- Improve burger menu with better spacing and visual hierarchy
- Add subtle animations for better UX

### Phase 2: Dashboard Improvements

- Larger touch targets for view toggle buttons
- Mobile-optimized table view with better cell spacing
- Improved card grid with optimized spacing for mobile real estate
- Better mobile layout for conflict indicators

### Phase 3: Collection Page Enhancements

- More compact collection summary cards for mobile
- Replace table with mobile-friendly card layout for pack selection
- Larger quantity controls optimized for touch interaction
- Better visual hierarchy for pack categories

### Phase 4: Component-Level Mobile Polish

- Optimize DeckCard for mobile with larger action buttons
- Improve touch targets throughout the app
- Add mobile-specific spacing utilities
- Enhance responsive typography

## Technical Approach

- Add new mobile-first Tailwind CSS classes
- Create mobile-specific component variants where needed
- Use CSS breakpoints and conditional rendering for optimal layouts
- Maintain existing functionality while improving mobile UX