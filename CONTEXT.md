# 🧠 Project Context & Prompt History

*This document serves as a contextual save-state summarizing the interactions that led to the current codebase, making it easier for future LLMs or developers to resume work without losing context.*

## Initial Goal
The user requested to design and deploy a Tic-Tac-Toe game from scratch. The mandate was to build a visually impressive, modern application that could be hosted on GitHub Pages.

### Phase 1: Core Game & AI
- **Prompt Direction:** Build a single-player game playing against the computer.
- **Result:** Created `index.html`, `styles.css`, and `script.js` featuring dark mode, glassmorphism, glowing micro-animations, and responsive layout. Included the "Minimax Algorithm" to ensure the AI plays perfectly.

### Phase 2: Remote Deployment Setup
- **Prompt Direction:** Deploy to GitHub pages under the user's account (`rukmanivaithy@gmail.com`).
- **Result:** Assessed local Git environment, discovered lack of SSH authentication, generated an ED25519 SSH Key, linked it to macOS `ssh-agent`, and pushed the codebase to the `gh-pages` and `main` branches to trigger the web deployment.

### Phase 3: Online Multiplayer Pivot
- **Prompt Direction:** "Can we allow 2 users to play against each other when they have the URL instead of both sharing the same device..."
- **Challenge:** GitHub Pages only accommodates static files (HTML/CSS/JS) and cannot host a backend database or Node.js WebSocket socket server to sync multiple users.
- **Solution:** Suggested and integrated `PeerJS` (WebRTC). Completely refactored `script.js` to support an asynchronous Peer-to-Peer internet connection where clicking a grid cell propagates a data payload to the opponent. Added a Multiplayer lobby UI to generate a sharable URL injected with a generated `?gameId`.

## Future Work (Ideas for Resuming Context)
When resuming this feature set later, functionalities that could be worked on next:
- Text Chat Box inside the multiplayer lobby.
- Robust "Play Again" consent requests instead of an immediate forced board reset.
- Allow players to choose whether they want to play as X or O.
- High Scoreboard persistence using browser `localStorage`.
