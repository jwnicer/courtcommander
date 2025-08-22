
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShuttlecockIcon, CourtIcon, ScoreboardIcon, RacketIcon } from '@/components/icons/badminton'

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Home Page",
      icon: ShuttlecockIcon
    },
    {
      href: "/play",
      label: "Live Session",
      icon: ScoreboardIcon,
    },
    {
        href: "/qm",
        label: "Queue Master",
        icon: CourtIcon
    },
    {
      href: "/admin",
      label: "Dashboard",
      icon: RacketIcon
    },
  ]

  return (
    <nav className="flex items-center space-x-2 lg:space-x-4 border-b pb-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
