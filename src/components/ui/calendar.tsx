"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative p-0 w-full", className)}
      classNames={{
        months: "flex flex-col w-full",
        month: "w-full",
        month_caption: "relative mx-10 mb-4 flex h-9 items-center justify-center",
        caption_label: "text-sm font-semibold tracking-widest uppercase text-[#d4af37]",
        nav: "absolute top-0 flex w-full justify-between z-10",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-[rgba(245,244,240,0.4)] hover:text-[#d4af37]"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-[rgba(245,244,240,0.4)] hover:text-[#d4af37]"),
        weekdays: "flex justify-center mb-2",
        weekday: "w-10 text-center text-[10px] font-bold tracking-[0.2em] uppercase text-[rgba(245,244,240,0.3)] py-1",
        weeks: "flex flex-col gap-1",
        week: "flex justify-center",
        day: cn(
          "group w-10 h-10 flex justify-center items-center",
          "data-[selected]:bg-[#d4af37]"
        ),
        day_button: cn(
          "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-none transition-colors",
          "text-[rgba(245,244,240,0.8)] hover:bg-[rgba(212,175,55,0.12)] hover:text-[#d4af37]",
          "group-data-[selected]:text-black group-data-[selected]:font-bold group-data-[selected]:hover:bg-transparent",
          "group-data-[disabled]:text-[rgba(245,244,240,0.15)] group-data-[disabled]:line-through group-data-[disabled]:cursor-not-allowed group-data-[disabled]:hover:bg-transparent group-data-[disabled]:hover:text-[rgba(245,244,240,0.15)]",
          "group-data-[outside]:opacity-0 group-data-[outside]:pointer-events-none",
          "group-data-[today]:after:absolute group-data-[today]:after:bottom-1 group-data-[today]:after:left-1/2 group-data-[today]:after:-translate-x-1/2 group-data-[today]:after:w-1 group-data-[today]:after:h-1 group-data-[today]:after:rounded-full group-data-[today]:after:bg-[#d4af37] relative"
        ),
        ...classNames,
      }}
      components={{
        Chevron: (props) =>
          props.orientation === "left"
            ? <ChevronLeft size={16} strokeWidth={2} />
            : <ChevronRight size={16} strokeWidth={2} />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
