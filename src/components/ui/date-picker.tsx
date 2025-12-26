"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "اختر تاريخ", className }: DatePickerProps) {
  return (
    <div className="relative" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>
      <style>{`
        input[type="date"] {
          font-variant-numeric: tabular-nums lining-nums !important;
          font-feature-settings: "lnum" 1 !important;
          font-family: var(--font-tajawal), 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          direction: ltr !important;
          unicode-bidi: plaintext !important;
          text-align: left !important;
        }
      `}</style>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <CalendarIcon className="h-3 w-3" />
      </div>
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "h-7 px-2 pr-6 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 outline-none focus:border-purple-400 transition-all duration-200 focus:scale-105",
          "text-slate-900 dark:text-slate-100",
          className
        )}
      />
    </div>
  )
}
