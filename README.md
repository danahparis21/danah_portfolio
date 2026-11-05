# Mica Danah Paris — Interactive Portfolio

> Software Engineer & Applied AI Developer  
> Portfolio repository: [https://github.com/danahparis21/danah_portfolio](https://github.com/danahparis21/danah_portfolio)

---

## Overview

An interactive, high-fidelity developer portfolio blending modern **Apple macOS desktop design language** with tactile 3D physical computing and collaborative canvas interactions. 

Engineered with **Next.js 15**, **React 19**, **Three.js / React Three Fiber**, and **Tailwind CSS**, this platform showcases flagship software engineering systems, applied computer vision research, professional credentials, and interactive creative experiments without reliance on stock templates or emojis.

---

## Preview & Gallery

<!-- Drop your screenshot paths or hosted image URLs in the placeholders below -->

### 1. Interactive macOS Desktop & Hero
```markdown
![Hero Desktop Showcase](docs/images/hero-desktop.png)
```
*Floating stationery workspace with interactive 3D ID badge, dynamic macOS menu bar, and Control Center.*

---

### 2. About & Technical Capabilities
```markdown
![About & Stack](docs/images/about-toolbox.png)
```
*Clean editorial layout with parallax motion, interactive folder widgets, and categorized technology competencies.*

---

### 3. Projects — Unified macOS Finder Window
```markdown
![Projects Finder Window](docs/images/projects-finder.png)
```
*Single-window macOS Finder story with sidebar navigation tabs, pagination chevrons, and deep-dive technical metrics for flagship systems.*

---

### 4. Official Credentials — Quick Look Deck
```markdown
![Certificates Quick Look](docs/images/certificates-quicklook.png)
```
*Accordion folder deck featuring 5 staggered cardstock tabs with smooth cubic-bezier hover expansion.*

---

### 5. Achievements & Experiences — QuickTime Video Reel
```markdown
![Achievements Showcase](docs/images/achievements-reel.png)
```
*Balanced 3-column landscape QuickTime stage with synchronized video playback and soft-faded accolade highlights.*

---

### 6. Contact — 3D Mechanical Numpad
```markdown
![3D Contact Numpad](docs/images/contact-numpad.png)
```
*Floating 3D mechanical keycaps with realistic spring physics, authentic keyboard audio sampling, and an ASMR tactile switch.*

---

### 7. Danah's Secret Garden — Collaborative Meadow
```markdown
![Secret Garden Meadow](docs/images/secret-garden.png)
```
*Full-bleed bottom horizon meadow where visitors draw gouache wildflowers and plant them into a persistent cloud garden.*

---

## Design Inspiration & Architecture

The design philosophy unites three core influences:

1. **macOS Human Interface Aesthetic**  
   Frosted-glass window chrome, subtle traffic light controls, system menu bars, and Finder sidebars provide an intuitive, instantly recognizable desktop environment.
2. **Tactile Physical Computing**  
   Real-time 3D models with physical material transmission, rough reflections, contact shadows, and authentic acoustic click responses.
3. **Editorial & Organic Harmony**  
   Curved serif typography (`Cormorant Garamond`), handwritten accents (`Caveat`), and soft ambient pastel blurs (`#ffc9dc`, `#d9ccff`, `#ffe3cc`) on clean white canvas backgrounds.

---

## Key Features

### 1. Unified Project Finder
- Replaced fragmented multi-window popups with a single, responsive macOS Finder container.
- Sidebar folder tabs enable instant switching between flagship projects (e.g., **SEÑAS** — AI-powered Filipino Sign Language learning platform with MediaPipe + LSTM, **Blessence** — E-Commerce system).
- Integrated toolbar with disabled-state navigation chevrons, live metrics, and GitHub repository links.

### 2. Official Credentials Quick Look
- Interactive certificate deck using staggered folder tabs (*Data Analytics*, *Social Innovation*, *Device Management*, *Relational Databases*, *Advanced Excel*).
- Debounced hover and click expansion states with detailed credential verification data.

### 3. Achievements QuickTime Reel
- Three-column video stage featuring national competition pitches and research showcases.
- Autoplay looping video previews with individual mute/unmute controls.
- Keyframe-animated subtitle transitions detailing championship awards, research milestones, and program accolades.

### 4. 3D Mechanical Numpad Contact Section
- Built with `@react-three/fiber` and `@react-three/drei`.
- 6-key matrix (Email, LinkedIn, GitHub, Resume, Call, and ASMR tactile key).
- Custom spring dynamics simulate mechanical key travel (`PRESS_DEPTH = 0.16`, `SPRING = 20`).
- Audio synthesis and real MP3 sampling:
  - Sweep hover audio across keycaps
  - Authentic mechanical tactile bottom-out click

### 5. Collaborative Secret Garden
- Full-bleed meadow landscape positioned along the bottom screen horizon.
- Procedural gouache rendering engine paints organic grass blades, sunflowers, and visitor artwork.
- In-browser drawing pad with custom color palette, undo stack, and confetti launch.
- Shared cloud persistence via Upstash Redis REST API with local offline fallback.

### 6. Recruiter Fast Track Mode
- One-click recruiter toggle in the macOS menu bar switches the layout to an executive summary and printable resume format.

---

## Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Framework & Core** | Next.js 15 (App Router), React 19, TypeScript |
| **3D & Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Styling & System** | Tailwind CSS, CSS Custom Properties, Frosted Glass Backdrop Filters |
| **Motion & Canvas** | HTML5 2D Canvas API, Framer Motion, Canvas Confetti |
| **Storage & API** | Next.js Route Handlers, Upstash Redis |
| **Icons & Audio** | Lucide Icons (Strictly zero emojis), HTML5 Web Audio API |

---

## Project Structure

```
danah_portfolio/
├── public/
│   ├── assets/
│   │   ├── images/          # Project mockups, badges, certificates
│   │   ├── sounds/          # Keyboard hover and click audio files
│   │   └── videos/          # Showcase pitch and demonstration videos
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── flowers/     # Collaborative garden persistence route
│   │   ├── globals.css      # Core styles, glassmorphism, and color variables
│   │   ├── layout.tsx       # Root metadata and shell
│   │   └── page.tsx         # Main single-page scroll story
│   ├── components/
│   │   ├── About/           # HumanAbout narrative and technical toolbox
│   │   ├── Achievements/    # AchievementTheater 3-column video stage
│   │   ├── Certificates/    # CertificateCarousel accordion folder quick look
│   │   ├── Contact/         # ContactNumpad 3D mechanical keyboard
│   │   ├── Garden/          # DanahSecretGarden bottom meadow & drawing pad
│   │   ├── Hero/            # HeroStationery workspace & 3D ID badge
│   │   ├── Navigation/      # MacMenuBar, ControlCenterModal, MacDock
│   │   ├── Projects/        # ProjectsScrollStory unified macOS Finder window
│   │   └── RecruiterMode/   # RecruiterResumeView fast-track layout
│   ├── data/
│   │   └── portfolioData.ts # Central structured data source
│   └── utils/
│       └── sound.ts         # Audio synthesis and sound triggers
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or newer
- **Package Manager**: npm, pnpm, or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/danahparis21/danah_portfolio.git
   cd danah_portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env.local` file in the root directory if you wish to enable cloud persistence for the Secret Garden:
   ```env
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
   ```
   *(Note: The garden works locally out of the box even without Redis configured).*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Create a production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Author & Engineering Inquiries

**Mica Danah Paris**  
Software Engineer & Applied AI Developer  

- **GitHub**: [github.com/danahparis21](https://github.com/danahparis21)
- **LinkedIn**: [linkedin.com/in/danahparis](https://linkedin.com/in/danahparis)
- **Email**: [micadanahparis.dev@gmail.com](mailto:micadanahparis.dev@gmail.com)

---

## License

This project is open-source under the [MIT License](LICENSE).

