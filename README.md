# Neropage - Social Media Link Landing Page Builder

A modern, neon-themed social media link landing page builder.

## Features

- 🎨 Stunning neo-neon design aesthetics
- ⚡ Lightning-fast performance with PWA technology
- 📊 Advanced analytics and insights
- 🎯 Link scheduling and prioritization
- 🔒 Enterprise-grade security
- 🌐 Custom domain support
- 📱 Mobile-first responsive design
- 🎭 Full customization options

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** for styling
- **Shadcn/ui** for component library
- **TanStack Query** for data fetching and caching
- **Wouter** for routing
- **Service Worker** for offline support

### Backend
- **Express.js** for API server
- **File-based storage** (easily swappable with database)
- **Zod** for validation
- **TypeScript** for type safety

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd neropage
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Other Platforms

The app can be deployed to any Node.js hosting platform:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=5000` (or your platform's port)

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   │   ├── manifest.json  # PWA manifest
│   │   └── service-worker.js  # Service worker for offline support
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── lib/           # Utilities and configs
│       └── hooks/         # Custom React hooks
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
│   └── schema.ts        # Zod schemas and types
└── data/                # File-based data storage
```

## API Endpoints

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `GET /api/profiles/:username` - Get profile by username
- `PATCH /api/profiles/me` - Update profile
- `PATCH /api/profiles/:id` - Update profile by ID

### Links
- `GET /api/links` - Get all links for current profile
- `GET /api/profiles/:username/links` - Get links by username
- `POST /api/links` - Create new link
- `PATCH /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `PATCH /api/links/reorder` - Reorder links

## Offline Support

The app includes comprehensive offline support:

1. **Service Worker**: Caches static assets and API responses
2. **Local Storage**: Persists React Query cache for offline data access
3. **PWA Manifest**: Enables app installation on mobile devices

When offline, the app will:
- Serve cached pages and assets
- Display previously loaded data
- Queue mutations for when connection is restored

## Customization

### Theming

The app uses a custom neon theme defined in `client/src/index.css`. You can customize colors by modifying the CSS variables:

```css
--primary: 262 83% 66%;        /* Purple neon */
--neon-blue: 211 85% 63%;      /* Blue accent */
--neon-cyan: 189 94% 43%;      /* Cyan accent */
```

### Storage Backend

By default, the app uses file-based storage. To switch to a database:

1. Update `server/storage.ts` to implement your database adapter
2. Ensure the `IStorage` interface is properly implemented
3. Update environment variables as needed

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run check` - TypeScript type checking

### Code Quality

- TypeScript for type safety
- Zod for runtime validation
- ESM modules throughout
- Organized file structure

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.