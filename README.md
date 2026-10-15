# PHANTOM 

An ultra-luxury, editorial e-commerce platform and administrative console engineered with React 19, TypeScript, Tailwind CSS, Express, Prisma ORM, and PostgreSQL.

---

## ⚡ Tech Stack

- **Client**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Server**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Neon.tech / AWS)
- **Media & Assets**: Cloudinary (`f_auto`, `q_auto:best`)
- **Transactional Email**: Resend
- **Payments**: Stripe

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database URL

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env # Fill in your DB, Cloudinary & Resend credentials
npx prisma generate
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🛡️ License
Private proprietary luxury software for **Phantom**.
