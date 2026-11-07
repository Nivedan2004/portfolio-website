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
export const experience = [
  {
    name: "Lawgical",
    logo: "/logos/lawgical.png",
    role: "Software Development Engineer Intern",
    dates: "Jun 2025 – Aug 2026",
    highlights: ["390+ production PRs", "15+ US law firm customers"],
    detail:
      "San Francisco startup · Remote. Second engineer; 390+ production PRs, contributing to growth from 0 to 15+ US law firm customers. End-to-end full-stack delivery across questionnaires, AI intake and follow-ups, browser voice, video pipelines, CI/CD, and code review. Led SOC 2 Type II readiness and HIPAA compliance efforts and penetration-test remediation. Preparing for penetration testing deepened my curiosity about security—and made me more deliberate about risks and trade-offs before shipping.",
  },
  {
    name: "U4U",
    logo: "/logos/u4u.png",
    role: "Tech Intern",
    dates: "Jan 2024 – Jun 2024",
    highlights: ["Teen wellbeing", "Fit Crush"],
    detail:
      "Berkeley, CA · Remote. Built educational and wellbeing features for teen girls, including Fit Crush and a compatibility-check game.",
  },
];
export const education = [
  {
    name: "University of Washington",
    logo: "/logos/uw-purple.png",
    role: "M.S. Computer Science & Software Engineering",
    dates: "2026 – present",
    highlights: ["Expected Aug 2028", "UW Bothell"],
    detail:
      "University of Washington, Bothell. Expected graduation: August 2028.",
  },
  {
    name: "RV University",
    logo: "/logos/rvu.png",
    role: "B.Tech (Hons.), Computer Science",
    dates: "2022 – 2026",
    highlights: ["Fintech minor", "Bangalore, India"],
    detail: "Bangalore, India. Minor in Fintech.",
  },
];
export const projects = [
  {
    name: "Learnify",
    label: "Less noise. Better learning.",
    stack: "Next.js · Supabase · Tailwind",
    detail:
      "I built Learnify because getting an answer isn’t the same as understanding a topic. When I used ChatGPT to study, I often ended up with more information than I needed and too few visuals to make things click. I wanted something more focused: clear explanations, visual learning material, and questions to check what I’d understood.\n\nSix professors at RV University used it to cover topics in class, and more than 63 students used it to prepare for a class quiz. Students told me it helped them earn better grades, and classmates later returned to it for exam preparation. What started as a project for my report became something people actually chose to study with.",
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
