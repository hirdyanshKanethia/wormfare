<div align="center">
  <img src="./frontend/public/logo.png" alt="Wormfare Logo" width="400" />

  # Wormfare: Battle on the Dirt
  
  *The garden wasn't big enough for both of us.*

  ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
  ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
  ![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=flat-square)
</div>

---

## About The Game
Wormfare is a real-time, multiplayer, grid-based tactical game inspired by classic Battleship. You command an elite slither-squad of earthworms, place them strategically in your garden, and take turns firing blindly at the enemy's soil until one army is completely wiped out!

<p align="center">
  <img src="./images/screenshot_1.png" alt="Screenshot 1" width="32%" />
  <img src="./images/screenshot_2.png" alt="Screenshot 2" width="32%" />
  <img src="./images/screenshot_3.png" alt="Screenshot 3" width="32%" />
</p>

## Features
- Real-Time Multiplayer: Engage in live 1v1 tactical mud-fights using WebSockets.
- Drag & Drop Deployment: Intuitively position and rotate your troops before the battle begins.
- Dynamic Coach: A helpful Coach Worm guides you through the heat of battle with contextual dialogues.
- Global Leaderboards: Earn ELO points and see who is truly the conqueror of the soil.
- Custom Artwork: Vibrant modern UI, fun animations, and plenty of dirt.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Zustand, React-DnD
- Backend: Go, Gin Framework, Gorilla WebSockets
- Database: Supabase (PostgreSQL) + Prisma ORM
- Deployment: Vercel (Frontend), Render (Backend)

## License
Distributed under the MIT License. See LICENSE for more information.
