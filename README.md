# APEX — Find Your Ultimate Machine

[![Live Site](https://img.shields.io/badge/Live-Demo-red?style=for-the-badge&logo=vercel)](https://apex-brackets.vercel.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev/)

An enthusiast-focused elimination engine designed to benchmark sports cars, supercars, and hypercars head-to-head to reveal your definitive taste profile. Built with a clean, high-performance aesthetic reminiscent of modern editorial automotive journalism.

**🔗 Live Website:** [https://apex-brackets.vercel.app/](https://apex-brackets.vercel.app/)

---

## ⚡ Core Features

- **16-Car Elimination Brackets**: Pit the world's finest machines head-to-head across 4 elimination rounds to crown a single champion.
- **Dynamic Tournament Tree**: Recharts round progression and matchups as they happen, displaying a full tournament graph on completion.
- **Interactive Taste Profile**: Visualizes your statistical automotive preferences using a Recharts Radar Chart mapping **Power, Speed, Value, Agility, and Prestige** based on your tournament picks.
- **Detailed Spec Showcase**: Full specifications for 58 sports cars, supercars, and hypercars with dynamic currency formatting ($k for sub-millions, $m to 3 decimals for millions).
- **Personal Garage**: Save your favorite builds directly in-browser using LocalStorage (no registration or accounts needed).
- **Fully Responsive Design**: Premium glassmorphism layout tailored for both desktop displays and mobile touch targets.
- **Dynamic SEO & Prerendering**: Includes a post-build build script generating search engine crawler-friendly canonical files, JSON-LD structured data (`Product` and `WebSite`), custom XML sitemaps, and robots.txt.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/APEX.git
   cd APEX
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Production Build & Static Prerendering

Build the optimized application bundle and automatically run the static route prerenderer:
```bash
npm run build
```

The post-build script (`scripts/prerender.cjs`) reads the built client templates and generates static index files under `dist/` for search crawlers:
- Individual vehicle pages (`/car/:id`) with JSON-LD Product schemas.
- Shareable bracket results (`/bracket/result/:id`) for tournament deep-linking.
- Main routes (`/catalog`, `/bracket`, `/garage` with `noindex`).
- Sitemap generation (`sitemap.xml`) and search configurations (`robots.txt`).
