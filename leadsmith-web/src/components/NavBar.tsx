"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Lead Finder" },
  { href: "/sites", label: "Web Builder" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-5 border-b border-neutral-200 px-6 py-4 text-sm">
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "font-semibold text-neutral-900" : "text-neutral-500 hover:text-neutral-900"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
