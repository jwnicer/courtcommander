
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ClipboardList, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Home Page",
      icon: Home
    },
    {
      href: "/play",
      label: "Live Session",
      icon: ClipboardList,
    },
    {
        href: "/qm",
        label: "Queue Master",
        icon: ClipboardList
    },
    {
      href: "/admin",
      label: "Dashboard",
      icon: Settings
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
