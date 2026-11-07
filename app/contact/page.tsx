import type { Metadata } from "next";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { links } from "@/lib/content";
import { BookingCalendar } from "@/components/booking-calendar";
export const metadata: Metadata = { title: "Contact" };
export default function Contact() {
  return (
    <main id="main" className="contact-page">
      <section className="contact-intro" aria-labelledby="contact-title">
        <p className="eyebrow">Contact</p>
        <h1 id="contact-title">Let’s talk.</h1>
        <p className="contact-description">
          A project, an opportunity, or just a good conversation.
        </p>
        <div className="contact-links">
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin />
            <span>
              <strong>Connect on LinkedIn</strong>
              <small>Let’s stay connected</small>
            </span>
            <ArrowUpRight />
          </a>
          <a href={links.github} target="_blank" rel="noopener noreferrer">
            <Github />
            <span>
              <strong>GitHub</strong>
              <small>github.com/Nivedan2004</small>
            </span>
            <ArrowUpRight />
          </a>
          <a href={links.email}>
            <Mail />
            <span>
              <strong>Email</strong>
              <small>nivedanbr18@gmail.com</small>
            </span>
            <ArrowUpRight />
          </a>
        </div>
        <p className="inbox-note">Prefer email? My inbox is open.</p>
      </section>
      <BookingCalendar />
    </main>
  );
}
