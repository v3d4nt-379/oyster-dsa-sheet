import * as React from "react"
import { cn } from "@/lib/utils"

export type Platform = "LeetCode" | "GeeksforGeeks" | "CodeChef"

interface PracticeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  platform: Platform
}

export function PracticeLink({ platform, className, href = "#", ...props }: PracticeLinkProps) {
  const getLogoPaths = (p: Platform) => {
    switch (p) {
      case "LeetCode": 
        return { light: "/platforms/leetcode-light.svg", dark: "/platforms/leetcode-dark.svg" }
      case "GeeksforGeeks": 
        return { light: "/platforms/gfg-light.svg", dark: "/platforms/gfg-dark.svg" }
      case "CodeChef": 
        return { light: "/platforms/codechef-light.svg", dark: "/platforms/codechef-dark.svg" }
      default: 
        return { light: "/platforms/default.svg", dark: "/platforms/default.svg" }
    }
  }

  const paths = getLogoPaths(platform)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-accent border border-border shadow-sm shrink-0",
        className
      )}
      title={`Practice on ${platform}`}
      aria-label={`Practice on ${platform}`}
      {...props}
    >
      <img 
        src={paths.light} 
        alt={platform} 
        className="h-4 w-4 object-contain dark:hidden" 
      />
      <img 
        src={paths.dark} 
        alt={platform} 
        className="hidden h-4 w-4 object-contain dark:block" 
      />
    </a>
  )
}
