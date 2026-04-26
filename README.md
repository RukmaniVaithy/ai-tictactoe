# 🎮 Neon Tic-Tac-Toe

A completely serverless, highly-aesthetic Tic-Tac-Toe web application featuring an unbeatable Minimax AI mode, and a true real-time Online Multiplayer (WebRTC) mode.

## 🚀 Play the Game
**[Click here to play live!](https://RukmaniVaithy.github.io/ai-tictactoe/)**

## 🕹️ Game Modes
1. **1 Player (PvA)**: Play against the integrated AI. The AI uses the Minimax algorithm and is mathematically designed to never lose. Can you force a draw?
2. **Online PvP (Multiplayer)**: Play against anyone in the world instantly over the internet.
   - Click `Online PvP`.
   - Wait 1-2 seconds for your connection to securely initialize.
   - Click `Copy Link` to grab your unique room URL.
   - Send that link to a friend. When they open it, their browser will instantly synchronize with your game board!

## 💻 Local Development
Since the app uses vanilla HTML/CSS/JS and the PeerJS CDN, you don't need `npm` to run it.
Just clone the repository, and open `index.html` in your web browser. Or serve it using python:
```bash
python3 -m http.server 8080
```
