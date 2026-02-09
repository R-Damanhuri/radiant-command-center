# Command Center

AI Agent Management Dashboard for Radiant Projects.

## Features

- **Agent Dashboard** - Monitor all AI agents (Radiant, Narralink, IDN Poetry, etc.)
- **Task Kanban Board** - Manage tasks with TODO / IN PROGRESS / DONE columns
- **Agent Controls** - Execute tasks, toggle agent status
- **OpenClaw Integration** - Connect to OpenClaw sessions API

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
command-center/
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main dashboard
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # Base UI components (Card, Button, Badge)
│   │   ├── AgentCard.tsx    # Agent display card
│   │   ├── TaskCard.tsx     # Task card for kanban
│   │   └── KanbanBoard.tsx  # Kanban board component
│   ├── lib/
│   │   ├── api.ts           # OpenClaw API integration
│   │   ├── utils.ts         # Utility functions
│   │   └── constants.ts     # Constants
│   └── types/
│       └── index.ts         # TypeScript types
```

## OpenClaw Integration

Set environment variable to connect to OpenClaw:

```
NEXT_PUBLIC_OPENCLAW_API=http://localhost:3001
```

## TODO

- [ ] Drag & drop for kanban cards
- [ ] Real-time agent status updates via WebSocket
- [ ] Task creation modal
- [ ] Agent configuration page
- [ ] Activity log / history
- [ ] Authentication
