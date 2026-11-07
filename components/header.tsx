"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
export function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link className="avatar" href="/" aria-label="About me — home">
        <Image
          src="/images/illustration.png"
          alt="Illustration of me holding Simba"
          width={64}
          height={64}
          sizes="65px"
          priority
        />
      </Link>
      <nav aria-label="Main navigation">
        <Link
          href="/"
          className={pathname === "/" ? "nav-link selected" : "nav-link"}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          About me
        </Link>
        <Link
          href="/contact"
          className={pathname === "/contact" ? "nav-link selected" : "nav-link"}
          aria-current={pathname === "/contact" ? "page" : undefined}
        >
          Contact me
        </Link>
        <a
          className="resume-link"
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          View résumé <ArrowUpRight size={18} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </nav>
    </header>
  );
}
