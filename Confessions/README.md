# 🎭 Confessions

An anonymous confession platform where users can post confessions publicly or inside private invite-only groups.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day tokens) |

---

## Folder Structure

```
Confessions/
├── backend/
│   ├── server.js              # Entry point
│   ├── .env.example
│   └── src/
│       ├── models/            # Mongoose models
│       │   ├── User.js
│       │   ├── Post.js
│       │   ├── Comment.js
│       │   ├── Group.js
│       │   └── Report.js
│       ├── routes/            # Express routes
│       │   ├── auth.js
│       │   ├── posts.js
│       │   ├── comments.js
│       │   ├── groups.js
│       │   ├── moderation.js
│       │   ├── admin.js
│       │   └── profile.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── adminAuth.js
│       │   └── rateLimiter.js
│       ├── utils/
│       │   ├── generateUsername.js
│       │   └── profanityFilter.js
│       └── seed.js
└── frontend/
    ├── index.html
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── ConfessionCard.jsx
        │   ├── PostModal.jsx
        │   └── CommentSection.jsx
        └── pages/
            ├── Auth.jsx
            ├── Home.jsx
            ├── Groups.jsx
            ├── Profile.jsx
            └── Admin.jsx
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
# Backend
cd Confessions/backend
cp .env.example .env      # edit values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Create `Confessions/backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/confessions
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
ADMIN_SECRET_KEY=admin-secret
```

Create `Confessions/frontend/.env` (optional):

```env
VITE_API_URL=http://localhost:5000
```

### 3. Seed sample data

```bash
cd Confessions/backend
node src/seed.js
```

This creates:
- **Admin**: `admin@confessions.app` / `admin123`
- 5 anonymous users
- 10 public confessions
- 2 groups: `NIGHT1`, `DEEP01`

### 4. Run

```bash
# Terminal 1 — Backend
cd Confessions/backend
npm start          # or: npm run dev (requires nodemon)

# Terminal 2 — Frontend
cd Confessions/frontend
npm run dev
```

Open: http://localhost:5173

---

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (auto-assigns random username) |
| POST | `/api/auth/login` | Login via email or username |

### Posts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/posts` | Public feed (paginated) |
| GET | `/api/posts/trending` | Top liked posts (last 7 days) |
| POST | `/api/posts` | Create confession |
| POST | `/api/posts/:id/like` | Toggle like |
| GET | `/api/groups/:id/posts` | Group feed |

### Comments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/comments` | Add comment (supports replies via parentId) |
| GET | `/api/comments/post/:id` | Get threaded comments |

### Groups
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/groups/create` | Create group |
| POST | `/api/groups/join` | Join via invite code |
| GET | `/api/groups` | List your groups |

### Moderation
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/report` | Report a post or comment |
| GET | `/api/admin/reports` | View all reports (admin) |
| DELETE | `/api/admin/post/:id` | Delete post (admin) |
| POST | `/api/admin/ban` | Ban user (admin) |

---

## Features

- 🎭 **Anonymous usernames** — auto-generated (e.g. `ShadowFox123`)
- 🔒 **Private groups** — invite-only via 6-char code
- ❤️ **Like/unlike** confessions
- 💬 **Comments** with 1-level replies
- 🚩 **Report** system with admin panel
- 🔥 **Trending** feed (most liked this week)
- 🛡️ **Profanity filter** + rate limiting (5 posts/day)
- 📱 **Mobile-first** dark UI
