import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Difficulty = "Easy" | "Medium" | "Hard"

interface DifficultyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  difficulty: Difficulty
}

export function DifficultyBadge({ difficulty, className, ...props }: DifficultyBadgeProps) {
  let difficultyClass = ""
  
  switch (difficulty) {
    case "Easy":
      difficultyClass = "border-transparent bg-difficulty-easy/10 text-difficulty-easy hover:bg-difficulty-easy/20"
      break
    case "Medium":
      difficultyClass = "border-transparent bg-difficulty-medium/10 text-difficulty-medium hover:bg-difficulty-medium/20"
      break
    case "Hard":
      difficultyClass = "border-transparent bg-difficulty-hard/10 text-difficulty-hard hover:bg-difficulty-hard/20"
      break
  }

  return (
    <Badge 
      className={cn(difficultyClass, className)} 
      {...props}
    >
      {difficulty}
    </Badge>
  )
}
