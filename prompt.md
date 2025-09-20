# Project Documentation & Roadmap: Advanced Connect-N

## 1. Project Overview

**Advanced Connect-N** is a modern, feature-rich web application that reimagines the classic game of Tic-Tac-Toe. It elevates the traditional 3x3 grid into a dynamic and strategic challenge where players must connect a variable number of pieces on an expanding board, often complicated by obstacles.

The game is built as a single-page application using a modern tech stack, focusing on a high-quality user experience with smooth animations, audio feedback, and a clean, dark-themed interface. A key feature is its integration with the Google Gemini API, which provides a unique reward for players who win against the AI opponent.

**Core Concepts:**

*   **Progressive Difficulty:** The game is structured into levels, each increasing the board size, the number of pieces to connect (`winCondition`), and the quantity of randomly placed obstacles.
*   **Multiple Game Modes:** Players can challenge a sophisticated local computer opponent with multiple difficulty settings (`offline` mode) or play against an AI that celebrates the user's victory with a custom, AI-generated image (`ai` mode).
*   **Engaging UI/UX:** The interface is designed to be immersive, with responsive animations for player moves, a pulsating glow on winning lines, celebratory fireworks, and sound effects for key game events.

**Core Technologies:**

*   **Frontend Framework:** Angular (Standalone Components, Signals for state management)
*   **Styling:** Tailwind CSS for a utility-first, responsive design.
*   **AI Integration:** Google Gemini API (`imagen-3.0-generate-002`) for image generation.
*   **Audio:** Native Web Audio API for generating sound effects programmatically without external assets.

---

## 2. Current Implemented Features

This section documents all features currently implemented in the application.

### 2.1. Game Core & Logic (`game.service.ts`)

*   **State Management:** The application's state is managed reactively using Angular Signals. Key states include:
    *   `gameState`: `menu`, `ageCheck`, `profileSelect`, `playing`, `paused`, `gameOver`.
*   **Game Modes:**
    *   `offline`: Player vs. a local computer opponent.
    *   `ai`: Player vs. a local computer opponent, with the added feature of Gemini image generation upon a human win.
*   **Difficulty Levels (`offline` & `ai` mode):**
    *   **Simple:** The computer opponent selects a valid move completely at random.
    *   **Hard:** The computer first checks if it can win in the next move. If not, it checks if the human player can win in the next move and blocks them. If neither, it makes a random move.
    *   **Pro:** The most advanced AI. It performs the same checks as `Hard` for immediate wins/blocks. If none exist, it uses a heuristic scoring function (`findBestMoveByHeuristic`) to evaluate every possible move, choosing the one that maximizes its potential winning lines while simultaneously minimizing the opponent's.
*   **Level System:** The game features a structured level progression defined in `src/models.ts`.
    *   **Level 1:** 6x6 board, connect 3, 0 obstacles.
    *   **Level 2:** 8x8 board, connect 4, 2 obstacles.
    *   **Level 3:** 10x10 board, connect 5, 4 obstacles.
    *   **Level 4:** 12x12 board, connect 6, 6 obstacles.
*   **Dynamic Board Generation:**
    *   The board is created based on the `boardSize` of the current level.
    *   A specified number of `obstacles` are placed in random, non-overlapping empty cells at the start of each game, making each round unique.
*   **Win Condition Logic:** The `checkWin` function is robust and checks for a winner based on the current level's `winCondition`. It comprehensively scans for winning lines in all four directions:
    1.  Horizontal
    2.  Vertical
    3.  Diagonal (top-left to bottom-right)
    4.  Anti-Diagonal (top-right to bottom-left)
*   **Game Controls:**
    *   **Pause/Resume:** The game state can be paused at any time, freezing the board.
    *   **Suggest Move:** The player can request a hint. The suggestion logic prioritizes a winning move, then a blocking move, and finally a random move.
    *   **Stop/Restart:** Players can end the current game and return to the main menu at any time.

### 2.2. UI & UX (`app.component.html`, `app.component.ts`)

*   **Visual Design:** A sleek, modern dark theme with a subtle grid pattern in the background. Key text elements use gradients for visual appeal.
*   **Game Board:**
    *   The board is rendered as a dynamic CSS grid, adjusting its size based on the current level.
    *   Player pieces (`X` and `O`) and obstacles are rendered as SVG icons for crisp, scalable visuals.
*   **Animations & Effects:**
    *   **Pop-in:** When a piece is placed on the board, it appears with a subtle scaling and fading animation.
    *   **Pulsating Win:** The cells forming the winning line receive a pulsating glow effect, clearly highlighting the victory.
    *   **Fireworks:** Upon winning, a colorful, randomized firework display is triggered on the game-over screen.
*   **Information Panel:** A sidebar displays crucial game information:
    *   Current Level and Win Condition.
    *   Current Player's Turn, including their icon.
    *   Buttons for in-game controls.
*   **Responsive Layout:** The layout adapts to different screen sizes, stacking the game board and info panel vertically on smaller screens and placing them side-by-side on larger screens.

### 2.3. Gemini AI Integration (`ai.service.ts`)

*   **Gated Access:** To ensure responsible use, the AI mode is gated by an "age check" consisting of a simple multiplication problem.
*   **User Profiles:** Before starting an AI game, the player selects a profile (`man`, `woman`, or `child`). This choice determines the theme of the generated image.
*   **Image Generation on Win:** If the human player (`X`) wins the game, the application sends a request to the Gemini API.
    *   **Prompts:** The service uses carefully crafted prompts to generate high-quality, artistic images based on the selected profile (e.g., a Rembrandt-style portrait for 'man', a fantasy landscape for 'child').
*   **API State Handling:** The UI provides clear feedback during the image generation process:
    *   A loading spinner is shown while the API request is in progress.
    *   A detailed error message is displayed if the API call fails.
    *   The final, generated image is displayed prominently on the game-over screen.

### 2.4. Audio Feedback (`audio.service.ts`)

*   **Programmatic Sound:** The `AudioService` uses the Web Audio API to generate all sound effects dynamically. This is highly efficient, requires no external audio files, and avoids network latency.
*   **Sound Events:** Audio cues are implemented for:
    *   **Move:** A sharp, percussive click plays whenever a player or the computer makes a move.
    *   **Win:** An uplifting, rising arpeggio plays when a player wins.
    *   **Draw:** A lower, more somber two-note tune plays for a draw.
    *   **UI Interaction:** A soft, high-pitched click plays when the game is paused or resumed.

---

## 3. Future Roadmap: New Features & Enhancements

This section outlines potential features to enhance and expand the application.

### 3.1. Gameplay Mechanics & Modes

*   **Two-Player Offline Mode:** Implement a "hot-seat" mode for two human players to compete on the same device.
*   **Online Multiplayer:**
    *   **Backend:** Develop a real-time backend using WebSockets (e.g., with Node.js, or using a service like Firebase).
    *   **Features:** Implement user accounts, matchmaking (random and with friends), leaderboards, and ELO rating system.
*   **Advanced Obstacle Types:**
    *   **Temporary Obstacles:** Blocks that disappear after a set number of turns.
    *   **Moving Obstacles:** Obstacles that shift their position on the board after each round of turns.
*   **Power-Ups & Special Moves:**
    *   Introduce collectible power-ups on the board or allow a player one special move per game.
    *   **Examples:** "Bomb" (clear a 3x3 area), "Undo" (take back the last move), "Swap" (swap the position of two existing pieces).
*   **Timed Turns (Blitz Mode):** Add an optional timer for each move to increase the challenge and pace of the game.
*   **Campaign Mode:** A curated series of levels with pre-set board layouts, unique challenges (e.g., "win in under 10 moves"), and a narrative progression.

### 3.2. AI & Gemini Integration Enhancements

*   **AI Opponent Personality:** Use the Gemini chat model to give the AI opponent a personality. It could generate witty comments, praise good moves, or offer playful taunts in a chat box during the game.
*   **Post-Game Analysis:** After a game, send the move history to Gemini and ask for an analysis. The AI could identify the "turning point" of the game, suggest alternative moves, and provide feedback to help the player improve.
*   **Adaptive AI Difficulty:** Create a new difficulty mode where the computer's strategy adapts based on the player's win/loss record, becoming more challenging as the player improves.
*   **Custom Image Prompts:** Allow the winning player to enter a few keywords to customize the AI-generated victory image, adding another layer of personalization.

### 3.3. UI/UX & Visual Improvements

*   **Customizable Themes:** Allow players to select from a variety of visual themes (e.g., "Sci-Fi," "Jungle," "Ocean") that change the background, board style, and piece icons.
*   **Advanced Animations:** Implement smoother, more fluid animations for screen transitions (e.g., from menu to game board) and more elaborate win/loss sequences.
*   **Player Statistics & History:**
    *   Create a profile page that tracks detailed statistics: win/loss/draw record, win rate against each difficulty, fastest win, longest game, etc.
    *   Implement a match history viewer to review past games move-by-move.
*   **Accessibility (a11y):**
    *   **High-Contrast Mode:** A theme designed for users with visual impairments.
    *   **Keyboard Navigation:** Enable full control of the game board and menus using only the keyboard.
    *   **Screen Reader Support:** Add appropriate ARIA labels and roles to all interactive elements.

### 3.4. Sound & Music

*   **Background Music:** Add a selection of ambient, royalty-free background tracks that players can choose from. The music could change dynamically based on the game state (e.g., becoming more tense when a player is close to winning).
*   **Volume Controls:** Implement separate volume sliders for music and sound effects, including a master mute button.

### 3.5. Persistence

*   **Local Storage:** Use the browser's `localStorage` to save the state of an unfinished game, so a player can close the tab and resume later. Also, save user preferences like volume levels and selected theme.
*   **Achievements System:** Add a system of achievements or badges to reward players for milestones (e.g., "First Win on Pro," "Connect 6," "Win without using a suggestion").
