# NBA Trade Tool
# You can find this deployed here: https://lal-one.vercel.app/
A full-stack web application for building and evaluating NBA draft pick trades, built with Next.js and modern web technologies.

## Tech Stack & Implementation Choices

### Next.js
- Chosen as the primary framework for its simplicity and full-stack capabilities
- Server-side rendering (SSR) for improved performance and SEO
- Built-in API routes for backend functionality
- File-based routing system for intuitive navigation
- TypeScript support out of the box

### Database & ORM
- **PostgreSQL** (Neon DB) for reliable, scalable database storage
- **Prisma ORM** for type-safe database queries and migrations
- Database schema includes:
  - Users table for authentication
  - Trades table for storing trade configurations
  - TradeDraftPicks table for detailed pick information

### Authentication
- Next.js built-in authentication system
- Secure password hashing with bcrypt
- Protected routes using middleware
- Session management with next-auth

### UI/UX
- Tailwind CSS for responsive, utility-first styling
- Heroicons for consistent iconography
- Modern, clean interface with purple and gold accent colors
- Responsive design for all device sizes

## Key Components

### Trade Builder (`app/dashboard/trade-builder.tsx`)
- Core component for creating and editing trades
- Features:
  - Multi-team trade support (up to 4 teams)
  - Draft pick selection with year, round, and pick number
  - Real-time trade evaluation
  - Duplicate pick validation
  - Trade value calculation based on pick positions

### API Routes
- `/api/trades` - CRUD operations for trades
- `/api/users` - User management and authentication
- All routes protected with authentication middleware

### Database Models
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  trades    Trade[]
}

model Trade {
  id          String           @id @default(uuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  description String?
  createdAt   DateTime        @default(now())
  teams       String[]        
  draftPicks  TradeDraftPick[]
}

model TradeDraftPick {
  id              String   @id @default(uuid())
  trade           Trade    @relation(fields: [tradeId], references: [id])
  tradeId         String
  year            Int
  round           Int
  pickNumber      Int
  givingTeam      String   
  receivingTeam   String   
}
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```env
   POSTGRES_URL=your_neon_db_url
   NEXTAUTH_SECRET=your_secret
   ```
4. Run database migrations:
   ```bash
   pnpm prisma migrate dev
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Features

- User authentication (signup/login)
- Create and edit multi-team trades
- Add draft picks with year, round, and pick number
- Real-time trade evaluation
- Save and manage trades
- Responsive design for all devices
- Secure password handling
- Type-safe database operations

## Security Considerations

- Passwords are hashed using bcrypt
- Protected API routes
- Input validation on all forms
- Type safety with TypeScript
- Secure session management
- Environment variable protection

## Future Improvements

- Add varying value based on future draft picks
- Pick protection support
- Team win percentage (forecast team's performance) for future draft positions
- Add player trading capabilities
- Implement trade history and analytics
- Add team salary cap integration
- Enhanced trade evaluation metrics

