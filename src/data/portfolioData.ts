export interface Project {
  id: string;
  projectNumber: string;
  title: string;
  subtitle: string;
  badge: string;
  period: string;
  role: string;
  description: string;
  bullets: string[];
  metrics?: { label: string; value: string }[];
  tags: string[];
  videoUrl?: string;
  liveUrl?: string;
  githubUrls?: { label: string; url: string }[];
  colorTheme: {
    tabBg: string;
    cardBg: string;
    textColor: string;
    accentColor: string;
  };
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  bullets: string[];
  tags: string[];
}

export interface Certificate {
  id: string;
  pantoneCode: string;
  pantoneName: string;
  title: string;
  issuer: string;
  date: string;
  pdfPath: string;
  colorBars: string[];
  cmyk: string;
  rgb: string;
}

export interface Achievement {
  id: string;
  title: string;
  award: string;
  organization: string;
  year: string;
  description: string;
  videoUrl?: string;
  badgeColor?: string;
}

export const PORTFOLIO_DATA = {
  profile: {
    name: "Mica Danah Paris",
    shortName: "Danah",
    tagline: "Software Engineer & Applied AI Developer",
    subtitle: "Real-Time Computer Vision • Mobile Systems • Human-Centered AI",
    location: "Nasugbu, Batangas, Philippines",
    email: "danahparis.inf@gmail.com",
    phone: "0945-8543-1364",
    linkedin: "https://www.linkedin.com/in/mica-danah-paris-374a10289/",
    github: "https://github.com/danahparis21",
    resumePath: "/assets/documents/resume/MicaDanahParis_Resume.pdf",
    avatar: "/assets/images/avatar/professional_image.JPEG",
    pixelAvatar: "/assets/images/avatar/pixel_version.png",
    education: {
      degree: "Bachelor of Science in Information Technology",
      university: "Batangas State University, The National Engineering University – ARASOF",
      graduation: "Class of 2027",
    },
    summary:
      "Full-stack Software Engineer & Applied AI Developer specializing in real-time computer vision, cross-platform mobile development (React Native & Expo), and machine learning architectures. Passionate about building high-impact, human-centered systems with verified accuracy.",
    // The Warm, Human Bio
    aboutParagraphs: [
      "I’m an engineer and creative developer based in Batangas, Philippines. I grew up tinkering with computers, fascinated by how lines of code could solve real human hurdles. In applied AI, I found a way to bridge deep logic with genuine empathy.",
      "I enjoy understanding how models learn and shaping how technology feels in everyday hands. My process starts with listening, questioning assumptions, and testing side-by-side with the people who actually use the tools.",
      "The question I keep coming back to is: How can complex artificial intelligence feel gentle, natural, and empowering for the person using it?",
      "Away from the screen, you’ll usually find me tending to my plants, baking warm pastries, filling a sketchbook, or exploring creative hobbies.",
    ],
    whatIDo: [
      "Real-time Computer Vision",
      "Hand Gesture Recognition",
      "Cross-Platform Mobile (React Native & Expo)",
      "Neural Networks (LSTM / MobileNetV2)",
      "RESTful API & Laravel Backends",
      "Human-Centered Usability Testing",
      "Interactive Web Systems",
    ],
  },

  skills: {
    programming: ["Python", "JavaScript", "TypeScript", "PHP", "Java", "C++", "HTML/CSS"],
    frameworks: ["React Native", "Expo", "React.js", "Next.js", "Laravel", "Tailwind CSS"],
    ai_ml: ["MediaPipe", "MobileNetV2", "LSTM", "TensorFlow", "Scikit-Learn", "Computer Vision"],
    tools: ["Git & GitHub", "Docker", "Figma", "Canva", "MySQL", "Supabase", "XAMPP", "Vercel"],
  },

  experience: [
    {
      period: "2026 — Present",
      role: "Lead Software & Machine Learning Engineer",
      company: "SEÑAS (señas.tech)",
      bullets: [
        "Architected real-time hand gesture recognition for Filipino Sign Language (FSL) using MediaPipe landmarks and sequential LSTM models.",
        "Evaluated recognition accuracy achieving 90.12% accuracy, 92.04% precision, and 90.71% F1-score across live sign language datasets.",
        "Delivered full-stack mobile client with React Native and Expo, coupled with a Laravel REST backend and MySQL database.",
        "Presented research at SiKAPTala 2026: National CS & IT Competition (De La Salle University–Dasmariñas).",
      ],
      tags: ["MediaPipe", "LSTM", "React Native", "Laravel", "MySQL"],
    },
    {
      period: "Sep 2025 — Dec 2025",
      role: "Team Leader, Data Scientist & Full-Stack Developer",
      company: "Blessence Beauty AI",
      bullets: [
        "Trained a Python-based Random Forest recommendation model for undertone and skin tone classification.",
        "Integrated real-time computer vision facial detection for virtual lipstick try-on.",
        "Designed QR-based ordering workflow, automated inventory management, and customer profiling.",
      ],
      tags: ["Python", "Random Forest", "Computer Vision", "QR Ordering"],
    },
    {
      period: "2024",
      role: "Director, Scriptwriter & Video Producer",
      company: "College of Informatics & Computing Sciences",
      bullets: [
        "Won 1st Place / Best Advocacy Video for 'Advocating for Change: SDG in Action!'.",
        "Directed end-to-end video storytelling, creative narrative, and video editing to champion UN Sustainable Development Goals.",
      ],
      tags: ["Video Production", "Advocacy", "Storytelling", "Editing"],
    },
  ] as ExperienceItem[],

  projects: [
    {
      id: "senas",
      projectNumber: "PROJECT 01",
      title: "SEÑAS",
      subtitle: "AI-Powered Filipino Sign Language Learning Platform",
      badge: "Flagship AI & Mobile Platform",
      period: "2026 – Present",
      role: "Lead Software & Machine Learning Engineer",
      description:
        "An assistive learning platform that empowers individuals to learn Filipino Sign Language (FSL) through real-time AI hand gesture recognition, camera feedback, and teacher management dashboards.",
      bullets: [
        "Architected real-time hand gesture recognition using MediaPipe landmarks, MobileNetV2 feature extraction, and sequential LSTM models.",
        "Built complete mobile and backend infrastructure with React Native, Expo, Laravel, PHP, and MySQL.",
        "Evaluated recognition on real-world FSL gestures with 90.12% accuracy and 90.71% F1-score.",
        "Selected for National Research Presentation at SiKAPTala 2026 (De La Salle University–Dasmariñas).",
      ],
      metrics: [
        { label: "Accuracy", value: "90.12%" },
        { label: "Precision", value: "92.04%" },
        { label: "Recall", value: "90.21%" },
        { label: "F1-Score", value: "90.71%" },
      ],
      tags: ["React Native", "Expo", "MediaPipe", "MobileNetV2", "LSTM", "Laravel", "PHP", "MySQL"],
      videoUrl: "/assets/videos/projects/senas-promo.MP4",
      liveUrl: "https://señas.tech",
      githubUrls: [
        { label: "Mobile App Repository", url: "https://github.com/danahparis21/senas_mobile_app" },
        { label: "Teacher Web Dashboard", url: "https://github.com/MendozaCPE/Senas_TeacherWebDashboard" },
      ],
      colorTheme: {
        tabBg: "bg-blue-600",
        cardBg: "bg-[#18181b]",
        textColor: "text-white",
        accentColor: "text-blue-400",
      },
    },
    {
      id: "blessence",
      projectNumber: "PROJECT 02",
      title: "Blessence",
      subtitle: "Smart Beauty Recommendation System & Computer Vision",
      badge: "Team Lead & ML Architect",
      period: "Sep 2025 – Dec 2025",
      role: "Team Leader, Data Scientist & Full-Stack Engineer",
      description:
        "An intelligent beauty recommendation and virtual try-on application utilizing Computer Vision and Machine Learning algorithms to match cosmetics to facial skin tones and undertones.",
      bullets: [
        "Trained and evaluated a Python-based Random Forest recommendation model on diverse skin undertone datasets.",
        "Engineered real-time facial feature and undertone detection alongside interactive virtual lipstick try-on.",
        "Designed QR-based ordering workflow, customer profile tracking, and automated inventory management.",
      ],
      metrics: [
        { label: "Model", value: "Random Forest" },
        { label: "Vision", value: "Skin Tone Analysis" },
        { label: "Feature", value: "Virtual Try-On" },
      ],
      tags: ["Python", "Random Forest", "Computer Vision", "Full Stack", "System Architecture", "QR System"],
      colorTheme: {
        tabBg: "bg-amber-400",
        cardBg: "bg-[#fef08a]",
        textColor: "text-slate-900",
        accentColor: "text-amber-800",
      },
    },
    {
      id: "lakbay",
      projectNumber: "PROJECT 03",
      title: "LAKBAY",
      subtitle: "Trail Discovery & Real-Time Hiking Management Platform",
      badge: "Software Engineer & Backend Lead",
      period: "2025 – 2026",
      role: "Software Engineer & Backend Developer",
      description:
        "A full-featured hiking management and eco-tourism platform built for the Municipality of Nasugbu, Batangas. Connects Hikers, Tour Guides, Mountain Managers, and the Municipal Tourism Office with real-time GPS tracking, Tesseract OCR guide verification, and automated GCash payments.",
      bullets: [
        "Architected core REST APIs in PHP 8.2 and normalized MySQL database powering 4 unified user portals.",
        "Engineered real-time GPS trail tracking, boundary violation alerts, and crowd density heatmaps using Leaflet.js.",
        "Integrated Tesseract OCR with ImageMagick for automated guide ID verification and credential validation.",
        "Designed time-limited GCash payment validation with automated cron jobs and multi-role transactional messaging.",
      ],
      metrics: [
        { label: "Mountains", value: "4 Summits" },
        { label: "User Roles", value: "4 Portals" },
        { label: "OCR Vision", value: "Tesseract" },
        { label: "Mapping", value: "Leaflet.js" },
      ],
      tags: ["PHP 8.2", "MySQL", "Docker", "Leaflet.js", "Tesseract OCR", "REST APIs", "Apache", "ImageMagick"],
      githubUrls: [
        { label: "Project Repository", url: "https://github.com/danahparis21" },
      ],
      colorTheme: {
        tabBg: "bg-emerald-600",
        cardBg: "bg-[#064e3b]",
        textColor: "text-white",
        accentColor: "text-emerald-400",
      },
    },
    {
      id: "ai-reviewer",
      projectNumber: "PROJECT 04",
      title: "AI Assisted Reviewer",
      subtitle: "AI-Guided Interactive Technical Exam Reviewer",
      badge: "Creator & AI Engineer",
      period: "2025 – 2026",
      role: "Creator, Full-Stack & AI Integration Engineer",
      description:
        "An AI-guided, interactive technical exam reviewer engineered with instant Google Gemini reasoning, original scanned exam verification, session-based progress synchronization, and an ambient lo-fi study environment designed to make mastering technical certifications engaging.",
      bullets: [
        "Integrated Google Gemini API (gemini-2.5-flash) via Vercel Serverless Functions to generate step-by-step reasoning for chosen and distractor options.",
        "Engineered lightweight zero-dependency quiz engine with a 100-tile live progress map, missed-question retry modes, and real-time pass/fail projections.",
        "Built scanned exam page viewer linking each question to original technical diagrams and architecture schematics.",
        "Adopted by review cohorts with named session keys, JSON export/import progress synchronization, and dark mode tokens.",
      ],
      metrics: [
        { label: "Questions", value: "300+ Items" },
        { label: "AI Engine", value: "Gemini 2.5" },
        { label: "Framework", value: "Vanilla JS" },
        { label: "Status", value: "Live Vercel" },
      ],
      tags: ["Google Gemini API", "Vercel Functions", "JavaScript", "Custom CSS", "Exam Engine", "JSON Data"],
      liveUrl: "https://itpassportreviewer.vercel.app/",
      githubUrls: [
        { label: "Project Repository", url: "https://github.com/danahparis21" },
      ],
      colorTheme: {
        tabBg: "bg-rose-500",
        cardBg: "bg-[#fff1f2]",
        textColor: "text-slate-900",
        accentColor: "text-rose-600",
      },
    },
    {
      id: "secret-garden",
      projectNumber: "PROJECT 05",
      title: "Secret Garden",
      subtitle: "Interactive Botanical Drawing Canvas & Community Meadow",
      badge: "Creative Tech & Meadow",
      period: "2026",
      role: "Creator & Creative Developer",
      description:
        "An interactive, collaborative drawing canvas where visitors sketch blooms in pastel gouache. Every planted flower blossoms in real-time across a shared meadow with generative canvas physics and live cloud persistence.",
      bullets: [
        "Engineered smooth 60fps canvas drawing engine with synchronized coordinates and touch support.",
        "Created procedural botanical generation and whimsical particle confetti physics.",
        "Integrated multi-visitor cloud persistence via Upstash Redis REST API.",
      ],
      metrics: [],
      tags: ["HTML5 Canvas", "Creative Tech", "Interactive Art", "Upstash Redis", "Confetti FX"],
      colorTheme: {
        tabBg: "bg-pink-500",
        cardBg: "bg-[#fff5f7]",
        textColor: "text-slate-900",
        accentColor: "text-pink-600",
      },
    },
  ] as Project[],

  achievements: [
    {
      id: "advocacy-video",
      title: "Advocating for Change: SDG in Action!",
      award: "Best Advocacy Video Winner",
      organization: "College of Informatics and Computing Sciences",
      year: "2024",
      description:
        "First-place winning video production created to champion the United Nations Sustainable Development Goals. Blended creative storytelling, video editing, and human impact narrative.",
      videoUrl: "/assets/videos/achievements/sdg_advocacyvideo.mp4",
      badgeColor: "from-amber-400 to-amber-600",
    },
    {
      id: "self-pitch",
      title: "Technopreneurship Self-Pitch",
      award: "Tech Pitch & Vision Spotlight",
      organization: "Technopreneurship Program",
      year: "2025",
      description:
        "Personal technical pitch articulating my journey in engineering, technical problem-solving capabilities, and vision for applied AI in accessibility and tech ventures.",
      videoUrl: "/assets/videos/achievements/self-pitch.mp4",
      badgeColor: "from-sky-400 to-indigo-600",
    },
    {
      id: "sikaptala-research",
      title: "Human-Centered Usability Evaluation of SEÑAS",
      award: "National Research Presenter",
      organization: "SiKAPTala 2026: National CS & IT Competition, De La Salle University–Dasmariñas",
      year: "May 2026",
      description:
        "Presented empirical research on the human-centered usability and computer-vision accuracy of SEÑAS for Filipino Sign Language education before national evaluators and academic leaders.",
      badgeColor: "from-purple-400 to-pink-600",
    },
  ],

  // Pantone-Style Swatch Certificates (Image 4 Inspiration!)
  pantoneCertificates: [
    {
      id: "cert-data-analytics",
      pantoneCode: "PANTONE 2925 U",
      pantoneName: "Deep Data Cobalt",
      title: "IT Specialist – Data Analytics",
      issuer: "Certiport",
      date: "May 2026",
      pdfPath: "/assets/images/certificates/Data Analytics (1).pdf",
      cmyk: "C:85 M:45 Y:0 K:0",
      rgb: "R:0 G:122 B:255",
      colorBars: ["#94a3b8", "#818cf8", "#3b82f6", "#0284c7", "#0369a1", "#075985", "#0284c7", "#38bdf8", "#bae6fd"],
    },
    {
      id: "cert-sp",
      pantoneCode: "PANTONE 3415 U",
      pantoneName: "Polytechnic Evergreen",
      title: "Learning Express Programme",
      issuer: "Singapore Polytechnic",
      date: "Apr 2026",
      pdfPath: "/assets/images/certificates/Mica_Danah_P__Paris_6a1badc628eafe0554ca4a57.pdf",
      cmyk: "C:90 M:10 Y:85 K:30",
      rgb: "R:0 G:135 B:90",
      colorBars: ["#cbd5e1", "#86efac", "#22c55e", "#16a34a", "#15803d", "#166534", "#15803d", "#4ade80", "#bbf7d0"],
    },
    {
      id: "cert-device-mgmt",
      pantoneCode: "PANTONE 2028 U",
      pantoneName: "Tangerine Architecture",
      title: "Device Configuration & Management",
      issuer: "Certiport",
      date: "Dec 2025",
      pdfPath: "/assets/images/certificates/Device Configuration and Management.pdf",
      cmyk: "C:0 M:75 Y:95 K:0",
      rgb: "R:245 G:90 B:35",
      colorBars: ["#cbd5e1", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#ea580c", "#fed7aa", "#ffedd5"],
    },
    {
      id: "cert-databases",
      pantoneCode: "PANTONE 2685 U",
      pantoneName: "Relational Violet",
      title: "IT Specialist – Databases",
      issuer: "Certiport",
      date: "May 2025",
      pdfPath: "/assets/images/certificates/Databases.pdf",
      cmyk: "C:80 M:95 Y:0 K:10",
      rgb: "R:95 G:45 B:145",
      colorBars: ["#cbd5e1", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#9333ea", "#e9d5ff", "#f3e8ff"],
    },
    {
      id: "cert-excel",
      pantoneCode: "PANTONE 354 U",
      pantoneName: "Spreadsheet Emerald",
      title: "Microsoft Office Specialist – Excel",
      issuer: "Certiport",
      date: "Dec 2023",
      pdfPath: "/assets/images/certificates/Office Excel 2016.pdf",
      cmyk: "C:80 M:0 Y:90 K:0",
      rgb: "R:16 G:163 B:74",
      colorBars: ["#cbd5e1", "#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#059669", "#10b981", "#d1fae5", "#ecfdf5"],
    },
  ],

  get certificates() {
    return this.pantoneCertificates;
  },

  bakery: {
    shopName: "Butter Days Bakery",
    motto: "Good things come in pink.",
    subtext: "A bakery of dreams. No payment taken.",
    pastries: [
      { id: "cinnamon-swirl", name: "Cinnamon swirl", desc: "Warm cinnamon roll & vanilla glaze", price: 6.0, icon: "🥨", shelf: "top" },
      { id: "choco-chip", name: "Chocolate chip cookie", desc: "Warm gooey Belgian chocolate core", price: 4.0, icon: "🍪", shelf: "top" },
      { id: "butter-croissant", name: "Butter croissant", desc: "Flaky French golden layers", price: 4.5, icon: "🥐", shelf: "top" },
      { id: "cardamom-knot", name: "Cardamom knot", desc: "Aromatic Scandinavian spiced braid", price: 5.0, icon: "🥯", shelf: "bottom" },
      { id: "strawberry-danish", name: "Strawberry Danish", desc: "Glazed fresh berries & custard", price: 5.5, icon: "🍓", shelf: "bottom" },
      { id: "chocolate-babka", name: "Chocolate babka", desc: "Swirled dark cocoa brioche loaf", price: 5.0, icon: "🥖", shelf: "bottom" },
    ],
    frostings: [
      { id: "cream-cheese", name: "Cream cheese frosting", price: 1.0, color: "#fef9c3", icon: "🥛" },
      { id: "chocolate-crunch", name: "Chocolate crunch", price: 1.5, color: "#78350f", icon: "🍫" },
      { id: "pistachio-cream", name: "Pistachio cream", price: 1.5, color: "#bbf7d0", icon: "🫒" },
    ],
  },
};
