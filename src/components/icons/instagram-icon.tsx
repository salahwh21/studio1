
import { cn } from "@/lib/utils";

export const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(className)}
  >
    <defs>
      <radialGradient id="insta-gradient" cx="0.3" cy="1.2" r="1.2">
        <stop offset="0" stopColor="#F58529" />
        <stop offset="0.4" stopColor="#DD2A7B" />
        <stop offset="0.9" stopColor="#8134AF" />
      </radialGradient>
    </defs>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="url(#insta-gradient)" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
