"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DifficultyBadge } from "@/components/dsa/difficulty-badge"
import { PracticeLink } from "@/components/dsa/practice-link"
import { BookmarkButton } from "@/components/dsa/bookmark-button"
import { TopicDrawer } from "@/components/dsa/topic-drawer"
import { Star } from "lucide-react"

export default function DesignShowcasePage() {
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [isSolved, setIsSolved] = React.useState(false)

  return (
    <div className="space-y-12 pb-12">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Design System Showcase</h1>
        <p className="text-xl text-muted-foreground">
          Validating Phase 1 components for DSA Sheet.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight border-b pb-2">Brand Colors & Typography</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">Display Heading</div>
              <div className="text-2xl font-semibold">Section Heading</div>
              <div className="text-base font-medium">Card/Base Heading</div>
              <div className="text-sm">Regular body text goes here. The typography is modern and technical.</div>
              <div className="text-sm text-muted-foreground">Muted secondary text for descriptions.</div>
              <div className="font-mono text-sm bg-muted p-1 rounded inline-block">Monospace code text</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Brand Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded bg-[#FFB000]" title="Gold"></div>
                <div className="h-12 w-12 rounded bg-[#FF6600]" title="Orange"></div>
                <div className="h-12 w-12 rounded bg-[#E63380]" title="Pink"></div>
              </div>
              <div className="h-12 rounded bg-gradient-to-r from-brand-gold via-brand-orange to-brand-pink flex items-center justify-center font-bold text-white shadow-sm">
                Primary Brand Gradient
              </div>
              
              <div className="pt-4 border-t w-full space-y-4">
                <h4 className="text-sm font-medium">Official Logo (Light & Dark Variants)</h4>
                <div className="flex gap-4">
                  <div className="relative h-16 w-16 rounded overflow-hidden shadow-sm border border-border">
                    <img src="/logo-light.jpg" alt="Light Theme Logo" className="h-full w-full object-cover dark:hidden bg-white" />
                    <img src="/logo-dark.jpg" alt="Dark Theme Logo" className="hidden h-full w-full object-cover dark:block bg-[#09090b]" />
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col justify-center">
                    <p>Asset path: <code className="bg-muted px-1 rounded">/logo-light.jpg</code></p>
                    <p>Asset path: <code className="bg-muted px-1 rounded">/logo-dark.jpg</code></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight border-b pb-2">Components</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-start">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">PRIMARY (Solid Accent)</div>
                <Button>Primary Button</Button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">SECONDARY (Neutral)</div>
                <Button variant="secondary">Secondary Button</Button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">TERTIARY (Ghost)</div>
                <Button variant="tertiary">Tertiary Button</Button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">ICON (Utility)</div>
                <Button variant="icon" aria-label="Icon button"><Star /></Button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">BRAND (Major Moments)</div>
                <Button variant="brand">Continue with Google</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-start">
              <div className="flex gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <Badge variant="brand">Brand Badge</Badge>
              
              <div className="pt-4 border-t w-full space-y-4">
                <h4 className="text-sm font-medium">Difficulty Badges</h4>
                <div className="flex gap-2">
                  <DifficultyBadge difficulty="Easy" />
                  <DifficultyBadge difficulty="Medium" />
                  <DifficultyBadge difficulty="Hard" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Links & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Practice & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-start">
              <PracticeLink platform="LeetCode" />
              <PracticeLink platform="GeeksforGeeks" />
              <PracticeLink platform="CodeChef" />
              
              <div className="pt-4 border-t w-full space-y-4">
                <h4 className="text-sm font-medium">Interactive States</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={isSolved} onCheckedChange={setIsSolved} />
                    Solved State
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Bookmark:</span>
                    <BookmarkButton isBookmarked={isBookmarked} onToggleBookmark={setIsBookmarked} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight border-b pb-2">Main DSA Sheet Foundation</h2>
        
        <div className="space-y-4">
          <TopicDrawer title="ARRAYS" solvedCount={12} totalCount={25} defaultExpanded>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-left">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center">Status</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-16">ID</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Question</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-48">Practice</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-28">Difficulty</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-24">Solution</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center">Bookmark</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle text-center"><Checkbox checked={true} /></td>
                    <td className="p-4 align-middle text-muted-foreground">01</td>
                    <td className="p-4 align-middle font-medium">Largest Element in an Array</td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <PracticeLink platform="LeetCode" />
                      </div>
                    </td>
                    <td className="p-4 align-middle"><DifficultyBadge difficulty="Easy" /></td>
                    <td className="p-4 align-middle">
                      <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <BookmarkButton isBookmarked={false} />
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle text-center"><Checkbox checked={true} /></td>
                    <td className="p-4 align-middle text-muted-foreground">02</td>
                    <td className="p-4 align-middle font-medium">Second Largest Element</td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <PracticeLink platform="GeeksforGeeks" />
                      </div>
                    </td>
                    <td className="p-4 align-middle"><DifficultyBadge difficulty="Medium" /></td>
                    <td className="p-4 align-middle">
                      <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <BookmarkButton isBookmarked={true} />
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle text-center"><Checkbox checked={false} /></td>
                    <td className="p-4 align-middle text-muted-foreground">03</td>
                    <td className="p-4 align-middle font-medium">Check if Array Is Sorted</td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <PracticeLink platform="CodeChef" />
                        <PracticeLink platform="LeetCode" />
                      </div>
                    </td>
                    <td className="p-4 align-middle"><DifficultyBadge difficulty="Hard" /></td>
                    <td className="p-4 align-middle">
                      <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <BookmarkButton isBookmarked={false} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TopicDrawer>
          
          <TopicDrawer title="HASHING" solvedCount={8} totalCount={18}>
            <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
          </TopicDrawer>
          
          <TopicDrawer title="BINARY SEARCH" solvedCount={5} totalCount={15}>
            <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
          </TopicDrawer>
          
          <TopicDrawer title="LINKED LIST" solvedCount={3} totalCount={20}>
            <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
          </TopicDrawer>
        </div>
      </section>
      
    </div>
  )
}
