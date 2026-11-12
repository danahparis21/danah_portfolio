export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  summary: string;
  content: string[];
  takeaways?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "welcome-to-my-portfolio",
    slug: "welcome-to-my-portfolio",
    title: "Hi, Welcome to My Portfolio",
    subtitle: "Why I built an interactive desktop instead of a traditional resume.",
    date: "Nov 2026",
    readTime: "2 min read",
    tag: "Behind the Scenes",
    image: "/assets/images/blogs/welcome.png",
    summary: "A personal note on creating Danah OS — blending clean engineering, warmth, and software that feels fun to explore.",
    content: [
      "I built Danah OS because traditional resumes often feel flat. Software engineering is tactile, creative, and human — so I wanted my portfolio to reflect that with draggable folders, a secret garden, and live projects.",
      "I've always loved tinkering with computers and seeing ideas turn into working tools. This space brings together my technical projects, research in applied AI, and things I enjoy building.",
      "Feel free to explore the apps, read my field notes, or plant a wildflower in the garden. Welcome, and enjoy looking around!",
    ],
    takeaways: [
      "Software should be intuitive, engaging, and thoughtfully designed.",
      "Interactive projects show how you think better than any bullet point.",
    ],
  },
  {
    id: "cooperating-with-sned-students",
    slug: "cooperating-with-sned-students",
    title: "Testing SEÑAS with SNED Students",
    subtitle: "What real classrooms taught us about building accessible sign language AI.",
    date: "Oct 2026",
    readTime: "3 min read",
    tag: "Field Research",
    image: "/assets/images/blogs/senyas_blog.png",
    summary: "Taking our AI gesture recognition model to Special Needs Education classrooms in Batangas to test with deaf learners.",
    content: [
      "Before field testing, our model hit 90% accuracy on webcams under steady desk lighting. But in real classrooms with SNED (Special Needs Education) students and teachers, everything changed.",
      "Hand sizes, signing speeds, room lighting, and camera angles vary constantly. We learned quickly that latency and natural movement matter just as much as benchmark scores.",
      "Testing side-by-side with students helped us adjust frame rates, reduce jitter, and simplify the interface. Seeing a learner sign, get instant feedback, and smile made every late night of training worthwhile.",
    ],
    takeaways: [
      "Field tests with real users beat lab benchmarks every time.",
      "Accessibility tools must adapt to the user, not force the user to adapt.",
    ],
  },
  {
    id: "our-capstone-journey-senas",
    slug: "our-capstone-journey-senas",
    title: "Building SEÑAS: Our Capstone Story",
    subtitle: "From an ambitious thesis idea to a national competition finalist.",
    date: "Sep 2026",
    readTime: "3 min read",
    tag: "Capstone",
    image: "/assets/images/blogs/senyas_blog2.png",
    summary: "How our student team engineered a real-time Filipino Sign Language platform and reached the SiKAPTala 2026 finals.",
    content: [
      "Most digital sign language tools focus on ASL, leaving Filipino Sign Language (FSL) with few interactive learning apps. For our capstone, we set out to change that.",
      "We tested multiple architectures before pairing MediaPipe for lightweight hand tracking with an LSTM network for sequence recognition, wrapped in a React Native and Laravel stack that runs on everyday devices.",
      "Presenting at SiKAPTala 2026 at DLSU-Dasmariñas and being named a national finalist was an amazing milestone. It proved that student teams can turn research into tools that genuinely help communities.",
    ],
    takeaways: [
      "Choose practical architectures that run reliably on accessible consumer hardware.",
      "Great engineering solves real problems with empathy.",
    ],
  },
];
