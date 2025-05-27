# NBA Trade Tool
# You can find this deployed here: https://lal-one.vercel.app/
A full-stack web application for building and evaluating NBA draft pick trades, built with Next.js and modern web technologies.

## Application Usage Workflow
1. You will be directed to a login/signup page, where you can create an account with your email and then log in.
2. Once logged in, you will see the trade builder and saved trades tab, and you should already be on the trade builder tab.
3. Select add team, then choose a team, the draft pick you want to trade away, and the recepient of that pick. Since teams need not give away picks all the time, the pick receipient is not automatically added to the trade, but you can easily add that team to send a pick back. 
4. You can add only up to 4 "sending" teams in the trade, and each of those sending teams can send picks to any other team.
5. Validation exists if fields are left empty, so you will be alerted if you leave something blank.
6. Evaluate trade will evaluate the trade, and save trade will save the trade for your profile. 
7. You can view all saved trades in the saved trades tab in the sidebar, where you can also edit and delete these trades.


## Tech Stack & Implementation Choices

### Next.js
- Chosen as the primary full-stack framework for its simplicity, ability for front and backend development
- Server-side rendering (SSR) for improved performance
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

## Key Components

### Dashboard ('app/dashboard/page.tsx)
The main interface for creating and editing trades. Handles:
- User authentication and session management
- Loading existing trades for editing
- Calculating draft pick values
- Rendering the TradeBuilder component
- Also has a sidebar where you can view saved trades and edit those past trades/

The page dynamically switches between "Create New Trade" and "Edit Trade" modes based on URL parameters.

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

## Future Improvements

- Add varying value based on future draft picks
- Pick protection support
- Team win percentage (forecast team's performance) for future draft positions
- Trade recommender system
- Add player trading capabilities
- Implement trade history and analytics
- Add team salary cap integration
- Enhanced trade evaluation metrics

