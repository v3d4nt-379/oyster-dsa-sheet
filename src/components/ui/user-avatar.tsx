"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  photoURL?: string | null
  name?: string | null
  email?: string | null
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ photoURL, name, email, size = "md", className, ...props }: UserAvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  // Reset error state if URL changes
  React.useEffect(() => {
    setImgError(false)
  }, [photoURL])

  const getInitials = () => {
    const text = name || email || ""
    if (!text) return "U"
    
    if (!name && email) {
      return email.charAt(0).toUpperCase()
    }
    
    const parts = text.trim().split(/\s+/)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-24 w-24 text-4xl"
  }

  const containerClass = cn(
    "relative flex shrink-0 overflow-hidden rounded-full border bg-muted items-center justify-center font-bold text-muted-foreground uppercase",
    sizeClasses[size],
    className
  )

  if (photoURL && !imgError) {
    return (
      <div className={containerClass} {...props}>
        <img 
          src={photoURL} 
          alt={name || email || "Avatar"} 
          className="aspect-square h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className={containerClass} {...props}>
      {getInitials()}
    </div>
  )
}
