# TECHRONICS // Cyber Tic-Tac-Toe Esports Arena

> **High-octane competitive 3x3 tactical arena game powered by React 18, Spring Boot 3, and Microsoft SQL Server.**
> Faithfully engineered from Google Stitch UI designs with authentic cyberpunk aesthetics, procedural Web Audio synthesizer sound effects, and intelligent minimax neural opponents.

---

## 🎮 Features & Highlights

- **Stitch Cyberpunk Design System**: Preserves all design tokens, reticle targeting cards, glow filters, scanline textures, and responsive layout grids.
- **Minimax AI Opponent Engine**: Real-time neural AI with 4 tactical threat levels:
  - `RECRUIT` (Casual random play)
  - `STANDARD` (Tactical offensive/defensive play)
  - `HARDENED` (Optimal minimax pathing with heuristic depth)
  - `CYBER_NET` (Unbeatable minimax game tree evaluation)
  - Integrated stratagem recommendation engine suggesting optimal grid moves.
- **Audio Synthesizer Engine**: Zero-dependency Web Audio API procedural sound effects for lasers, clicks, victory stingers, defeat drones, and hover hums.
- **Full-Featured Spring Boot 3 API**:
  - Stateless JWT Authentication with Spring Security 6 & JJWT 0.12.6.
  - Strict Data Transfer Object (DTO) pattern isolating persistence models.
  - Flyway version-controlled schema migrations (`V1__init_schema.sql`, `V2__seed_data.sql`).
  - Microsoft SQL Server 2025 Express with Windows Integrated Authentication.
- **Global Esports Leaderboards & Combat Telemetry**:
  - Real-time ranking tiers: *Bronze, Silver, Gold, Platinum, Diamond, Apex Predator*.
  - Full match replay telemetry stored in SQL Server with JSON move logs.
  - Daily & Weekly quest progression system.

---

## 🏗️ Architecture & Project Structure

```text
web dev project/
├── database/
│   └── migrations/
│       ├── V1__init_schema.sql         # Users, Matches, Quests, Achievements schema
│       └── V2__seed_data.sql           # Seed accounts, leaderboards, and daily quests
├── backend/
│   ├── pom.xml                         # Spring Boot 3.3.3, Java 17, JJWT, MSSQL JDBC
│   └── src/
│       └── main/
│           ├── java/com/yourorg/appname/
│           │   ├── config/             # SecurityConfig, CorsConfig
│           │   ├── controller/         # Auth, User, Match, Leaderboard, Quest controllers
│           │   ├── dto/                # Request & Response DTOs
│           │   ├── entity/             # JPA Entities: User, MatchRecord, Quest, Achievement
│           │   ├── exception/          # GlobalExceptionHandler, Custom REST exceptions
│           │   ├── mapper/             # UserMapper, MatchMapper
│           │   ├── repository/         # Spring Data JPA Repositories
│           │   ├── security/           # JwtUtil, JwtAuthFilter, UserPrincipal, CustomUserDetailsService
│           │   ├── service/            # Core business logic services
│           │   └── AppnameApplication.java
│           └── resources/
│               ├── application.properties
│               └── db/migration/       # Flyway SQL migrations
└── frontend/
    ├── package.json                    # React 18, Vite, Tailwind CSS, Axios, Lucide
    ├── vite.config.js
    ├── tailwind.config.js               # Stitch neon cyber color tokens & fonts
    ├── index.html
    └── src/
        ├── components/
        │   ├── common/                 # ReticleCard, CyberButton, CyberLogo
        │   └── layout/                 # Layout, Header, Sidebar
        ├── constants/                  # config.js, routes.js, ranks.js
        ├── context/                    # AuthContext.jsx
        ├── hooks/                      # useAuth, useAudio, useTicTacToe
        ├── pages/
        │   ├── Auth/                   # LoginPage.jsx, RegisterPage.jsx
        │   ├── Lobby/                  # LobbyPage.jsx
        │   ├── PlayArena/              # PlayArenaPage.jsx (tactical 3x3 arena)
        │   ├── MatchResult/            # MatchResultPage.jsx
        │   ├── Leaderboard/            # LeaderboardPage.jsx
        │   └── MatchHistory/           # MatchHistoryPage.jsx
        ├── routes/                     # AppRoutes.jsx, ProtectedRoute.jsx
        ├── services/                   # apiClient.js, authService, userService, matchService, ...
        └── utils/                      # aiOpponent.js (Minimax), sound.js (Web Audio)
```

---

## 🗄️ Database Setup (Microsoft SQL Server)

The application utilizes Microsoft SQL Server (tested on MSSQL 2025 Express / `localhost\SQLEXPRESS`).

1. Ensure SQL Server is running:
   ```powershell
   Get-Service -Name "MSSQL$SQLEXPRESS"
   ```

2. Create the target database `techronics_db`:
   ```powershell
   sqlcmd -S "localhost\SQLEXPRESS" -E -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'techronics_db') CREATE DATABASE techronics_db;"
   ```

3. Flyway handles schema creation and seeding automatically upon backend startup. If you wish to run migrations manually via `sqlcmd`:
   ```powershell
   sqlcmd -S "localhost\SQLEXPRESS" -d techronics_db -E -i "database\migrations\V1__init_schema.sql"
   sqlcmd -S "localhost\SQLEXPRESS" -d techronics_db -E -i "database\migrations\V2__seed_data.sql"
   ```

---

## ⚙️ Backend Setup & Execution

### Prerequisites
- **Java Development Kit (JDK) 17+**
- **Apache Maven 3.8+**

### Configuration
### Profiles & Database Modes
The backend comes configured with two distinct profiles:
- **`dev` (Default)**: Uses in-memory H2 in MSSQL compatibility mode with automatic schema generation and pilot/quest seeding via `DataInitializer`. **Starts up in ~3 seconds with zero external database configuration.**
- **`mssql`**: Connects directly to Microsoft SQL Server Express (`localhost\SQLEXPRESS`) with Flyway migrations.

To run with Microsoft SQL Server:
In `backend/src/main/resources/application.properties`, change:
```properties
spring.profiles.active=mssql
```

> [!NOTE]
> **Enabling TCP/IP for SQL Server Express:**
> By default, SQL Server Express installs with the TCP/IP protocol disabled and the SQL Browser service stopped. If you see `SocketTimeoutException: Receive timed out (UDP port 1434)`, enable TCP/IP:
> 1. Open **SQL Server Configuration Manager** (run `compmgmt.msc` or search Windows start).
> 2. Navigate to **SQL Server Network Configuration** -> **Protocols for SQLEXPRESS**.
> 3. Right-click **TCP/IP** and select **Enable**.
> 4. Double-click **TCP/IP**, go to the **IP Addresses** tab, scroll to **IPAll**, and set **TCP Port** to `1433`.
> 5. Under **SQL Server Services**, set **SQL Server Browser** to Automatic and **Start** it, then restart **SQL Server (SQLEXPRESS)**.

### Build & Run
From IntelliJ IDEA or the terminal:
```powershell
cd backend
mvn spring-boot:run
```
The backend REST API will start at `http://localhost:8080`.

### Pre-Seeded Test Accounts
| GamerTag | Email | Password | Rank | Combat Rating |
| :--- | :--- | :--- | :--- | :--- |
| `CYBER_VIPER` | `viper@techronics.gg` | `CyberViper2026!` | Diamond III | 2,450 CR |
| `NEXUS_GHOST` | `ghost@techronics.gg` | `NexusGhost2026!` | Apex Predator | 3,120 CR |
| `VALKYRIE_01` | `valk@techronics.gg` | `Valkyrie2026!` | Platinum I | 1,980 CR |

---

## 💻 Frontend Setup & Execution

### Prerequisites
- **Node.js v18+ or v24+**
- **npm v9+**

### Installation & Development
From the project root:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Production Build
```powershell
npm run build
npm run preview
```

---

## 🔒 Security & Authentication Architecture

1. **JWT Header Injection**: `frontend/src/services/apiClient.js` intercepts all outbound Axios HTTP requests, injecting `Authorization: Bearer <token>` from browser `localStorage`.
2. **Session Eviction**: If any backend request returns `401 Unauthorized`, `apiClient.js` automatically purges expired tokens and redirects the client to `/login`.
3. **Route Protection**: `ProtectedRoute.jsx` checks the reactive `AuthContext` state. Unauthenticated access attempts redirect to `/login` with clean back-navigation preservation.
4. **CORS Configuration**: `backend/src/main/java/com/yourorg/appname/config/CorsConfig.java` permits requests from `http://localhost:5173`, `http://localhost:3000`, and `http://127.0.0.1:5173`.

---

## 📡 REST API Reference Summary

| Endpoint | Method | Security | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new player account |
| `/api/auth/login` | `POST` | Public | Authenticate player and receive JWT token |
| `/api/users/me` | `GET` | Authenticated | Retrieve logged-in player profile & stats |
| `/api/matches` | `POST` | Authenticated | Initialize tactical match encounter |
| `/api/matches/quick-result` | `POST` | Authenticated | Submit match telemetry & receive XP / CR reward |
| `/api/matches/history` | `GET` | Authenticated | Fetch paginated match records & replay logs |
| `/api/matches/last-encounter`| `GET` | Authenticated | Retrieve most recent match summary |
| `/api/leaderboard/global` | `GET` | Authenticated | Global leaderboard rankings (Top 100) |
| `/api/quests/daily` | `GET` | Authenticated | Active daily quests & combat challenges |
#   T e c h r o n i c  
 