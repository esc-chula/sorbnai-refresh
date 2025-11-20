# สอบไหน (Sorbnai)

> Exam schedule and room finder for faculty of engineering students at Chulalongkorn University

**Sorbnai** is a web application that helps students quickly and conveniently find their exam rooms and schedules. It supports sharing exam schedules with friends and adding events to personal calendars.

## ✨ Key Features

- 🔍 **Exam Room Finder**: Locate exam rooms and buildings based on student ID
- 📅 **Personal Exam Schedule**: Display upcoming and past exams
- 🔗 **Schedule Sharing**: Share selected courses with friends via URL
- 📲 **Calendar Export**: Export to Google Calendar, Apple Calendar, and Outlook
- 💾 **Auto-save**: Data stored in Local Storage - no worries about losing information

## 🚀 Getting Started

### For Users

1. Open the website
2. Enter your student ID (10 digits, ending with 21)
3. Select courses to view exam schedule
4. View exam room, building, and exam time information

### For Developers

#### Installation

```bash
# Clone repository
git clone <repository-url>
cd sorbnai-refresh

# Install dependencies
pnpm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Run development server
pnpm dev
```

The website will be available at `http://localhost:3000`

#### Important Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm serve            # Test production build

# Quality
pnpm check            # Format and lint together
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm test             # Run Vitest tests

# Deployment
pnpm deploy           # Deploy to Cloudflare
```

## 🏗️ Tech Stack

### Frontend Framework

- **TanStack Start** - React SSR framework with file-based routing
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **TanStack Form** - Form state management

### UI & Styling

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Radix UI-based component library
- **Framer Motion** - Animation library
- **IBM Plex Sans Thai** - Thai font

### Development Tools

- **TypeScript** - Type safety
- **Zod** - Runtime validation
- **Vitest** - Unit testing
- **ESLint & Prettier** - Code quality

### Deployment

- **Cloudflare Pages** - Edge deployment platform
- **Vite** - Build tool

## 📁 Project Structure

```
src/
├── routes/              # File-based routing
│   ├── index.tsx        # Landing page (student ID input)
│   ├── _protected/      # Protected routes requiring student ID
│   │   ├── select-exams.tsx  # Course selection
│   │   └── schedule.tsx      # Exam schedule
│   └── api/             # API routes
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── exam-card.tsx    # Exam information card
│   ├── exam-list.tsx    # Course list
│   └── share-button.tsx # Share button
├── data/                # TanStack Query functions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions
```

## 🔐 Privacy

- No personal data sent to server
- All data stored in browser's Local Storage

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Made with ❤️
