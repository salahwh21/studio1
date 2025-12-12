import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { initialStatuses } from "@/store/statuses-store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusInfo(statusName: string) {
  const status = initialStatuses.find(s => s.name === statusName);
  if (status) {
    return status;
  }
  // Default fallback
  return {
    name: statusName,
    color: "#64748b", // slate-500
    icon: "HelpCircle", // fallback icon name
  };
}