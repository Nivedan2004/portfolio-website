export const links = {
  linkedin: "https://www.linkedin.com/in/nivedan-ravisha-4b4564239/",
  github: "https://github.com/Nivedan2004",
  email: "mailto:nivedanbr18@gmail.com",
  booking: "https://calendar.app.google/ccd5TQmyFxi5uPE1A",
  bookingEmbed:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ28Lq5PHYRsz1ZVQ4GjeiyrouWCkil7bd8h722dsnykLAjP4-phHGc4nImiIVDhA8g77hFdXTW4?gv=true",
};
// Technical tools listed in the supplied résumé; no proficiency ratings added.
export const skillGroups = [
  { name: "Languages", tools: "Java, JavaScript, TypeScript, Python, C" },
  {
    name: "Web & databases",
    tools:
      "React, Next.js, NestJS, Node.js, Tailwind CSS, PostgreSQL, Supabase, RPCs, webhooks",
  },
  {
    name: "Cloud & quality",
    tools:
      "GCP, Cloud Run Jobs, GitHub Actions, CI/CD, automated testing, structured logging",
  },
  {
    name: "AI & data",
    tools:
      "OpenAI APIs, Vertex AI, ElevenLabs, OpenAI Codex, PySpark, GeoPandas, Plotly",
  },
];
export type ResumeEntry = {
  name: string;
  logo: string;
  role: string;
  dates: string;
  highlights: string[];
  detail: string;
  bullets?: string[];
  undergraduateSemesters?: { title: string; subjects: string[] }[];
  courses?: { title: string; topics: string[]; source: string }[];
};
export const experience: ResumeEntry[] = [
  {
    name: "Lawgical",
    logo: "/logos/lawgical-mark.png",
    role: "Software Development Engineer Intern",
    dates: "Jun 2025 – Aug 2026",
    highlights: ["San Francisco, CA"],
    detail: "San Francisco, CA (Remote)",
    bullets: [
      "Joined as the startup’s second engineer; shipped 390+ production pull requests and built full-stack services supporting growth from 0 to 15+ US law firm customers in one year.",
      "Owned features from problem definition and system design through implementation, testing, and production readiness; made technical decisions and coordinated delivery with stakeholders.",
      "Engineered a graph-based legal-intake questionnaire system using NestJS, TypeScript, and Supabase/PostgreSQL, with conditional branching, batched question delivery, flow validation, and row-level security.",
      "Designed an asynchronous video-processing pipeline using FFmpeg and Cloud Run Jobs, with signed uploads and idempotent database operations to support safe retries; addressed database scaling limitations using PostgreSQL RPCs.",
      "Built AI-powered intake and follow-up workflows integrating ElevenLabs, Twilio, OpenAI, and Vertex AI, including browser-based voice calls, webhook processing, and lead scoring.",
      "Automated testing and deployment workflows with GitHub Actions CI/CD and structured cloud logging; reviewed pull requests for architecture, security, correctness, and maintainability.",
      "Led SOC 2 Type II readiness and HIPAA compliance efforts; remediated penetration-test findings involving XSS, CSRF, authentication, session management, and access control, and automated dependency-security checks.",
    ],
  },
  {
    name: "U4U",
    logo: "/logos/u4u.png",
    role: "Tech Intern",
    dates: "Jan 2024 – Jun 2024",
    highlights: ["Berkeley, CA"],
    detail: "Berkeley, CA (Remote)",
    bullets: [
      "Collaborated with a cross-functional team to build educational and wellbeing platform features for teen girls, including Fit Crush and a compatibility-check game based on user-engagement goals.",
    ],
  },
];
export const education: ResumeEntry[] = [
  {
    name: "University of Washington",
    logo: "/logos/uw-purple.png",
    role: "M.S. Computer Science & Software Engineering",
    dates: "2026 – present",
    highlights: ["Bothell, WA"],
    detail:
      "My first quarter at the University of Washington, studying parallel computing and how to build more secure software systems.",
    courses: [
      {
        title: "Parallel Programming in Grid and Cloud",
        topics: [
          "Shared-memory and message-passing programming with OpenMP and MPI.",
          "Task and data parallelism with MapReduce and Spark; benchmarking parallel performance and managing parallel jobs.",
        ],
        source: "https://courses.washington.edu/css534/syllabi/f26.html",
      },
      {
        title: "Information Assurance and Cybersecurity",
        topics: [
          "Secure development lifecycle; identifying threats, vulnerabilities, and security risks.",
          "Confidentiality, integrity, and availability; cryptology, privacy, and security governance.",
        ],
        source: "https://www.washington.edu/students/crscatb/css.html",
      },
    ],
  },
  {
    name: "RV University",
    logo: "/logos/rvu.png",
    role: "B.Tech (Hons.), Computer Science, Minor in Fintech",
    dates: "2022 – 2026",
    highlights: ["Bangalore, India"],
    detail: "Undergraduate study spanning software engineering, systems, AI and data, cloud computing, and fintech, alongside internships, research, and project work.",
    undergraduateSemesters: [
      { title: "Semester 1", subjects: ["Fundamentals of Programming with C", "Digital Systems and Computer Architecture", "Data Analysis with Python", "Discrete Mathematics and Graph Theory", "Exploring Science", "Technical Communication", "Structured Innovation"] },
      { title: "Semester 2", subjects: ["Data Structures and Algorithms", "Embedded Systems and Microcontrollers", "Full Stack Web Development", "Linear Algebra", "Engineering Explorations", "Community Service", "Entrepreneurial Mindset"] },
      { title: "Semester 3", subjects: ["Introduction to Blockchain", "Introduction to Business", "Design and Analysis of Algorithms", "Agile Software Engineering", "Operating Systems and Systems Software", "Database Management Systems", "Probability and Statistics"] },
      { title: "Semester 4", subjects: ["Advanced Blockchain", "Object Oriented Programming with Java", "Computer Networks", "Introduction to Machine Learning", "Special Topics", "Calculus for Computer Science", "Generative AI and Prompt Engineering"] },
      { title: "Semester 5", subjects: ["Universal Human Values", "English Communication – I", "Summer Internship – I", "IoT and Edge Computing", "Introduction to Robotic Process Automation", "Fundamentals of Data Engineering", "Introduction to Full Stack Web Development", "Google Cloud Computing Foundations", "Big Data Computing", "Introduction to Fintech Product Development", "Theory of Computation", "Game Theory"] },
      { title: "Semester 6", subjects: ["Yoga", "Constitution of India", "English Communication", "Computer Graphics", "Data Warehousing and Mining", "Recommender Systems", "Web Application Development", "Network Security", "Compiler Design", "Advanced Graph Theory", "Mini Project", "Essentials of Digital Marketing"] },
      { title: "Semester 7", subjects: ["Summer Internship – II", "Accelerated Computing", "Image Processing", "Distributed Systems", "Mobile Application Development", "Software Defined Networks", "Advanced Google Cloud Platform", "Developing Soft Skills and Personality", "Research Methodology"] },
      { title: "Semester 8", subjects: ["Technical Seminar", "Major Project"] },
    ],
  },
];
export const projects = [
  {
    name: "Learnify",
    label: "Less noise. Better learning.",
    stack: "Next.js · NeonDB · Tailwind",
    detail:
      "When I used ChatGPT to study, the answers were often too long and short on visuals. I built Learnify to make topics click through focused explanations, visual learning material, and questions that check understanding.\n\nProfessors at RV University brought Learnify into their classes, and students used it to prepare for a quiz. They told me it helped them earn better grades; classmates later returned for exam preparation. What began as a project for my report became a tool people chose to study with.",
  },
  {
    name: "Japan Visa Data Analysis",
    label: "Making messy data useful.",
    stack: "PySpark · Plotly · Python",
    detail:
      "This one started as a requirement for my data engineering course. I chose Japan’s visa data as a way to explore a practical question: how do you turn scattered public records into trends someone can actually understand?\n\nBefore I could answer that, I had to make the data consistent—cleaning records, reconciling country names, and standardizing datasets with PySpark. I then built interactive visualizations to explore the results. The project taught me how much of useful data engineering happens before you ever draw a chart.",
  },
  {
    name: "ColdChain IQ",
    label: "The route matters as much as the destination.",
    stack: "Python · GeoPandas · Streamlit",
    detail:
      "The idea started with spoiled groceries. My friends and I had ordered food that arrived in poor condition, and it made us question what happened between dispatch and delivery. Conversations with people in healthcare brought up a more serious version of the same problem: temperature-sensitive vaccines going to waste.\n\nWe built ColdChain IQ to explore how delivery routes could account for heat exposure alongside distance. Using heat-island data, route information, and temperature thresholds, it assesses where spoilage risk could rise along a journey. Our goal was to help delivery teams choose routes that better protect what they’re carrying.",
  },
];
