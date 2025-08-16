# Marvel Champions Collection Manager

A full-stack web application for managing your Marvel Champions LCG card collection and tracking deck conflicts in real-time.

![Marvel Champions Collection Manager](https://marvelcdb.com/bundles/cards/01001.png)

## Features

- **🔍 Real-time Conflict Detection**: Automatically detect card conflicts between active decks
- **📊 Collection Management**: Track pack ownership with detailed statistics
- **🃏 Deck Import**: Import decks directly from MarvelCDB URLs
- **🖼️ Hero Thumbnails**: Visual deck representation with hero card images
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🔄 Dual View Modes**: Switch between card grid and detailed table views
- **🔗 External Links**: Click deck titles to view on MarvelCDB
- **⚡ Performance**: Fast local database with real MarvelCDB data integration

## Tech Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Nuxt server API routes with session-based authentication
- **Database**: Prisma ORM with PostgreSQL (SQLite for development)
- **State Management**: Pinia stores
- **Authentication**: Argon2 password hashing with HTTP-only cookies
- **External API**: MarvelCDB integration for deck and card data

## Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL (for production) or SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/marvel-champions-collection-manager.git
   cd marvel-champions-collection-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Sync MarvelCDB data**
   ```bash
   npm run sync:marvelcdb
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing (64+ chars) | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |
| `NUXT_HOST` | Server host (default: localhost) | No |
| `NUXT_PORT` | Server port (default: 3000) | No |

## Production Deployment

### Heroku Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

1. **Manual deployment**:
   ```bash
   # Login to Heroku
   heroku login
   
   # Create new app
   heroku create your-app-name
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:essential-0
   
   # Set environment variables
   heroku config:set JWT_SECRET=$(openssl rand -base64 64)
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   
   # Run database migrations and seed data
   heroku run npm run db:migrate
   heroku run npm run db:seed
   ```

### Other Platforms

The application can be deployed to any Node.js hosting platform:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Database setup**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

## Database Management

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Deploy migrations (production)
npx prisma migrate deploy
```

### Data Sync
```bash
# Update MarvelCDB data
npm run sync:marvelcdb

# View database
npx prisma studio
```

## Development

### Project Structure
```
├── components/          # Vue components
├── pages/              # Nuxt pages (auto-routing)
├── server/             # API routes and utilities
│   ├── api/           # API endpoints
│   └── utils/         # Server utilities (auth, db)
├── stores/            # Pinia stores
├── prisma/            # Database schema and migrations
├── scripts/           # Utility scripts
└── assets/           # CSS and static assets
```

### Key Commands
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run sync:marvelcdb  # Sync MarvelCDB data
npx prisma studio       # Database GUI
```

## Security Features

- **Argon2 password hashing** with optimal parameters
- **Session-based authentication** with HTTP-only cookies
- **CSRF protection** via SameSite cookies
- **Security headers** (X-Frame-Options, CSP, etc.)
- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **External link safety** with proper rel attributes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MarvelCDB](https://marvelcdb.com) for providing the comprehensive card database API
- [Fantasy Flight Games](https://www.fantasyflightgames.com) for creating Marvel Champions LCG
- [Marvel](https://www.marvel.com) for the amazing characters and universe
