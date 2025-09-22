# Project Documentation: tikiTaP0

## 1. Project Overview

**tikiTaP0** is a modern, feature-rich web application that reimagines the classic Connect-N game. It elevates the traditional grid into a dynamic and strategic challenge where players must connect a variable number of pieces on an expanding board, often complicated by obstacles.

The game is built as a single-page application focusing on a high-quality user experience with immersive animated themes, responsive UI, audio feedback, and deep gameplay systems including a challenging offline AI, persistent player progression, and real-time online multiplayer. The Google Gemini API is integrated to provide unique, personalized content like player avatars, AI-driven opponent personalities, and custom victory images.

**Core Concepts:**

*   **Progressive Difficulty:** The game is structured into distinct difficulty tiers (`Simple`, `Hard`, `Pro`), each containing multiple levels of increasing challenge.
*   **Multiple Game Modes:** Players can challenge a sophisticated local computer opponent (`vs CPU`), play against an AI with a unique personality and rewards (`vs AI`), compete with a friend on the same device (`2 Player`), or face opponents worldwide (`Online`).
*   **Engaging UI/UX:** The interface is designed to be immersive, with responsive animations, cinematic round announcements, and three distinct, animated visual themes (Sci-Fi, Jungle, Ocean).
*   **Persistence:** All player data—including settings, level progress, match statistics, and unlocked achievements—is saved in the browser's local storage for a seamless experience across sessions.

**Core Technologies:**

*   **Frontend Framework:** React
*   **Styling:** Tailwind CSS for a utility-first, responsive design.
*   **Real-time Multiplayer:** Socket.IO for the online mode.
*   **AI Integration:** Google Gemini API (`gemini-2.5-flash`, `gemini-2.5-flash-image-preview`, `imagen-4.0-generate-001`) for content generation.
*   **Audio:** Native Web Audio API for generating sound effects programmatically.

---

## 2. Current Implemented Features

This section documents all features currently implemented in the application.

### 2.1. Game Core & Logic (`gameService.ts`, `App.tsx`)

*   **State Management:** The application's state is managed within React using state hooks and enums.
*   **Game Modes:**
    *   `vs CPU`: Player vs. a powerful local computer opponent.
    *   `vs AI`: Player vs. a local computer opponent that has a Gemini-powered personality and provides AI-generated rewards.
    *   `2 Player`: A "hot-seat" mode for two human players on the same device.
    *   `Online`: Real-time multiplayer against other players over the internet.
*   **Advanced Offline AI (`gameService.ts`):** The computer opponent uses a powerful, custom-built classical AI engine. Gemini is **not** used for move calculation.
    *   **Simple:** The AI plays defensively, first checking for an immediate winning move, then checking to block the opponent's winning move. If neither exists, it makes a random move.
    *   **Hard:** The AI uses a 1-ply heuristic search (`findBestMoveByHeuristic`) to evaluate every possible move and choose the one with the best immediate score.
    *   **Pro:** The AI uses a deep-searching **Minimax algorithm with Alpha-Beta Pruning**. The search depth (how many moves it "thinks" ahead) increases with each level, making it an extremely challenging opponent.
    *   **Adaptive "Comeback" AI:** In all modes, if the computer is losing a match, it increases its search depth for the next round to play more strategically.
*   **Structured Level System (`constants.ts`):** The game features independent progression for each difficulty tier. Board sizes, win conditions, and obstacle counts are carefully balanced for a smooth difficulty curve.
*   **Match & Round System:**
    *   **Best-of-Three:** Each level is a "best-of-three" match. The first player to win two rounds wins the level.
    *   **"Loser Starts" Rule:** The player who lost the previous round gets to make the first move in the next round, keeping matches competitive.
    *   **Tie-Breaker:** If a match score becomes 1-1, a "Final Round" is initiated with special UI callouts.
*   **Balanced Win Conditions (`gameService.ts`):** In `Simple` difficulty (Connect 3 & 4), diagonal wins are disabled to create a more strategic and fair game on smaller boards. Diagonals are enabled for `Hard` and `Pro`.

### 2.2. UI & UX

*   **Immersive Theming (`themes.ts`):**
    *   Players can choose from three distinct, "gamified" themes: `Sci-Fi`, `Jungle`, and `Ocean`.
    *   Each theme features multiple, unique, subtly animated backgrounds that change as the player progresses through levels.
    *   Themes also change the board's appearance (e.g., a holographic glow for Sci-Fi), cell hover effects, and UI accent colors.
*   **Responsive Layout:** The entire UI, including the info panel, adapts seamlessly from large desktop screens to small mobile devices.
*   **Animations & Effects:**
    *   **Pop-in:** Game pieces appear on the board with a satisfying scaling animation.
    *   **Glowing Win:** The winning line of pieces glows and pulses for a clear victory signal.
    *   **Fireworks:** A colorful, randomized firework display celebrates match victories.
*   **Redesigned Info Panel (`InfoPanel.tsx`):**
    *   On large screens, it's a vertical sidebar. On smaller screens, it becomes a sleek horizontal bar below the board.
    *   It features a live scoreboard for the current match, displays the current difficulty, and uses compact, colorful icons for controls (Pause, Suggest, Stop).
*   **Cinematic Announcements:**
    *   **Level Start Screen:** A "Mortal Kombat" style full-screen announcement (e.g., "LEVEL 1", "ROUND 1") appears before each round.
    *   **Difficulty Transition Screen:** When a player completes a difficulty tier, a special celebratory screen announces the unlock of the next tier.
    *   **Achievement Toasts:** A "toast" notification slides up from the bottom of the screen when a new achievement is unlocked.

### 2.3. Gemini AI Integration (`geminiService.ts`)

*   **AI Personality:** In `vs AI` mode, the opponent uses `gemini-2.5-flash` to generate witty, in-character comments and taunts after its turn, based on the current board state and difficulty.
*   **Personalized Victory Images:**
    *   If a player has created a custom avatar, the game uses the `gemini-2.5-flash-image-preview` ("nano-banana") model to remix their avatar into a heroic, celebratory portrait upon winning.
    *   If no avatar exists, it uses `imagen-4.0-generate-001` to create a high-quality victory image. The prompts are gender-swapped (a male profile gets a female character image, and vice-versa) and are strictly SFW.
*   **AI Avatar Creation:** Players can visit the Settings screen to generate a unique, personal avatar by providing a text prompt to the `imagen-4.0-generate-001` model.
*   **Gated Access:** AI features are gated by a simple multiplication problem to ensure responsible use.

### 2.4. Persistence & Player Data

*   **Settings (`settingsService.ts`):** The game saves the player's chosen theme, player names, and custom avatar URL to local storage. It also remembers the last-played mode and difficulty for a faster start.
*   **Player Statistics (`statsService.ts`):** A comprehensive stats system tracks wins, losses, and draws for every game mode and difficulty. This data is viewable on the `PlayerStatsScreen`.
*   **Level Progression (`progressService.ts`):** The player's unlocked level for each difficulty (`Simple`, `Hard`, `Pro`) is saved independently, allowing for non-linear progression.
*   **Achievements (`achievementsService.ts`):** A full system of 10 unique achievements rewards players for milestones (e.g., "First Win," "Grandmaster"). Unlocked achievements are saved and can be viewed on the `AchievementsScreen`.

### 2.5. Online Multiplayer (`onlineService.ts`)

*   **Real-time Backend:** The game uses Socket.IO to connect to a live server for real-time multiplayer matches.
*   **Lobby System (`OnlineLobbyScreen.tsx`):**
    *   Players can create their own public game lobby, choosing the board setup.
    *   Players can see a live list of available games created by other players.
    *   The lobby displays the host's name and custom avatar.
*   **Live Gameplay:** All moves are synchronized in real-time between players. The server acts as the source of truth to prevent cheating or desyncs.
*   **Avatars:** Player avatars are displayed in the in-game info panel during online matches.
*   **Disconnect Handling:** If an opponent disconnects, the remaining player is awarded the win.

### 2.6. Audio Feedback (`audioService.ts`)

*   **Programmatic Sound:** All sound effects are generated dynamically using the Web Audio API, requiring no external assets.
*   **Sound Events:** Unique audio cues are implemented for making a move, winning a round, a draw, UI interactions, and unlocking an achievement.

---

## 3. Future Roadmap: New Features & Enhancements

This section outlines potential features to enhance and expand the application.

*   **Advanced Online Features:**
    *   **Ranked Play:** Implement an ELO rating system and leaderboards.
    *   **Challenge a Friend:** A system to generate a private game link to share with a friend.
    *   **Emotes:** A selection of pre-defined emotes for safe in-game communication.
    *   **Spectator Mode:** Allow players to watch live matches of high-ranked players.
*   **Gameplay Mechanics:**
    *   **Advanced Obstacle Types:** Temporary or moving obstacles.
    *   **Power-Ups & Special Moves:** "Bomb" (clear an area), "Undo," or "Swap."
    *   **Timed Turns (Blitz Mode):** Add an optional timer for each move.
    *   **Campaign Mode:** A curated series of levels with unique challenges and pre-set boards.
*   **AI & Gemini Integration:**
    *   **Post-Game Analysis:** Use Gemini to analyze a completed match and provide feedback.
    *   **Custom Victory Prompts:** Allow the winning player to enter keywords to customize their victory image.
*   **UI/UX & Sound:**
    *   **Match History Viewer:** A screen to review past games move-by-move.
    *   **Background Music:** Add a selection of ambient background tracks with volume controls.
*   **Accessibility (a11y):**
    *   Implement a high-contrast mode, full keyboard navigation, and screen reader support.