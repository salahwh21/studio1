
import { cn } from "@/lib/utils";

export const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("text-[#1877F2]", className)}
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89H8.078v-2.906h2.36V9.356c0-2.328 1.39-3.623 3.522-3.623 1.006 0 1.87.074 2.122.107v2.585h-1.528c-1.13 0-1.35.536-1.35 1.326v1.734h2.867l-.373 2.906h-2.494v7.02C18.343 21.128 22 16.991 22 12z" />
  </svg>
);
