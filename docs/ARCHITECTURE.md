# TikiTaP0 Architecture

## Overview

TikiTaP0 is a Connect-N strategy game built with React, TypeScript, and Capacitor for cross-platform mobile support.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite 6
- **Mobile**: Capacitor 8
- **Testing**: Vitest
- **AI**: Google Gemini, OpenAI-compatible APIs

## Project Structure

```
tikitapo/
├── App.tsx              # Main application component
├── types.ts             # TypeScript interfaces and types
├── constants.ts         # Game constants (levels, achievements)
├── themes.ts            # UI themes configuration
│
├── components/         # React components
│   ├── GameBoard.tsx   # Main game board
│   ├── MenuScreen.tsx  # Main menu
│   ├── SettingsScreen.tsx
│   ├── GameOverScreen.tsx
│   └── ...
│
├── hooks/               # Custom React hooks
│   ├── useGameLogic.ts
│   ├── useOnlineGame.ts
│   └── useAI.ts
│
├── context/             # React Context
│   └── GameStateContext.tsx
│
├── services/            # Business logic
│   ├── gameService.ts   # Game logic, AI moves
│   ├── geminiService.ts
│   ├── aiProviderService.ts
│   └── ...
│
└── android/            # Capacitor Android project
```

## State Management

### Game State

- Uses React hooks (useState, useEffect, useCallback)
- GameStateContext provides global game state
- Settings stored in localStorage

### Settings Persistence

- All user preferences saved to localStorage
- Includes theme, player names, AI configuration

## Game Logic

The game uses a state machine pattern with `GameState` enum:

- `Menu` - Main menu
- `Playing` - Active game
- `GameOver` - Victory/defeat
- `Settings` - Settings screen

## AI System

### Unified AI Service

- Supports multiple providers: OpenAI, Gemini, Anthropic
- Custom OpenAI-compatible endpoints
- BYOK (Bring Your Own Key) for user API keys

### Image Generation

- Uses Google Gemini for victory images
- Supports custom avatars

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Reduced motion preference
- Focus management

## Testing

- Unit tests with Vitest
- Component tests with @testing-library/react

## Build & Deploy

- Web: Vite build to `dist/`
- Mobile: Capacitor sync + Gradle build
- CI/CD: GitHub Actions

## Security

- API keys stored in localStorage
- User inputs sanitized
- No sensitive data on server
