import { Github, Linkedin } from "lucide-react";
import { links } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer">
      <p>Built with curiosity.</p>
      <div>
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn (opens in a new tab)"
        >
          <Linkedin size={22} />
        </a>
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub (opens in a new tab)"
        >
          <Github size={23} />
        </a>
      </div>
    </footer>
  );
}
