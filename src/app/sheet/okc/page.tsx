import React from "react"
import { Badge } from "@/components/ui/badge"

export default function OkcSheetPage() {
  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[50vh]">
        <Badge variant="brand" className="mb-2 shadow-sm text-sm py-1 px-4">Club Exclusive</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          OKC DSA Sheet
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Club-exclusive DSA platform. Daily Sets and Normal Sheets will be available here soon.
        </p>
      </div>
    </div>
  )
}
