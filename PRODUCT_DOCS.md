# 📋 Product Documentation

## 1. Executive Summary (For Product Managers)
**Neon Tic-Tac-Toe** is a web-based, zero-refresh multiplayer gaming experience. What started as a classic standalone game evolved into a highly shareable online social activity. 
- **Value Proposition:** An instant-play game with absolutely zero sign-up friction. Users don't make accounts; they just share a link and play securely, directly connected with a friend.
- **Core User Flows:** 
  1. *Solo Play:* User vs Unbeatable Machine (keeps users engaged when alone).
  2. *Social Play:* Spontaneous link generation for playing via messaging apps and social media.

## 2. Technical Architecture (For Engineering Team)
This project intentionally avoids complex builds frameworks (No React, No Next, No Vite) to maximize performance and instantaneous deployment speed on purely static hosts (like GitHub Pages).

- **Stack Context:** Vanilla HTML5, Vanilla CSS3 (Variables & Animations), Vanilla ES6 JavaScript.
- **PvA Core:** Implements the `Minimax` algorithm natively. It recursively evaluates all possible future game states to make the optimal move. To ensure it feels natural, a `setTimeout` delays AI execution and positional randomness is added to the AI's opening moves.
- **Networking (Online Multiplayer):** 
  - Uses **WebRTC** (Web Real-Time Communication) implemented via the `PeerJS` library CDN wrapper.
  - Standard client-server polling/web sockets are *not* used. Instead, PeerJS negotiates an initial handshake using a free cloud brokering server, and then punches a direct UDP/TCP data hole between Browser A (Host) and Browser B (Joiner).
  - Data sent over the pipe is a lightweight JSON schema (e.g., `{ type: 'move', index: 4 }` or `{ type: 'reset' }`), keeping bandwidth ultra-low.
  - **State Management:** Both players maintain local JS states. When one interacts, it updates its DOM locally and fires a broadcast message to the peer connection to mirror the interaction.

## 3. Aesthetic & UI Strategy (For Design Team)
- **Design Philosophy:** "Premium Dark Neon" / "Cyberpunk Glass". High contrast aesthetics to make simple interactions feel incredibly satisfying.
- **Color Palette:** Deep navy/slate background (`#0b0f19`). Player 1/X is Cyan glow (`#00f2fe`), Player 2/O is Neon Pink glow (`#fe0979`).
- **Typography:** Uses Google Font `Outfit` emphasizing bold geometric headers and rounded numbers.
- **Micro-interactions:** 
    - The background utilizes an 8-second alternating pulse radial gradient to make the app feel "alive".
    - Game grid tiles use `.03` opacity backdrop filters (glassmorphism) and slightly scale up on hover (`transform: scale(1.03)`).
    - X and O tokens render using a `popIn` keyframe animation driven by bezier curves (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`) giving a heavy, satisfying bounce effect during gameplay.
