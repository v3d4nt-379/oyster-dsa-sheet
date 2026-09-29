"use client"

import * as React from "react"
import { SolvedRecord } from "@/lib/firestore/user-progress"

interface ActivityCalendarProps {
  solvedRecords: SolvedRecord[]
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ActivityCalendar({ solvedRecords }: ActivityCalendarProps) {
  // Aggregate solved counts by date (YYYY-MM-DD)
  const activityMap = React.useMemo(() => {
    const map = new Map<string, number>()
    
    solvedRecords.forEach(record => {
      // Normalize timestamp to JS Date safely
      let dateObj: Date | null = null
      if (record.solvedAt) {
        if (typeof record.solvedAt.toDate === 'function') {
          dateObj = record.solvedAt.toDate()
        } else if (record.solvedAt instanceof Date) {
          dateObj = record.solvedAt
        } else if (typeof record.solvedAt.seconds === 'number') {
          dateObj = new Date(record.solvedAt.seconds * 1000)
        }
      }
      
      // Fallback for pending serverTimestamp() which is null in the local cache initially
      if (!dateObj) {
        dateObj = new Date()
      }
      
      if (dateObj) {
        const dateKey = formatLocalDateKey(dateObj)
        map.set(dateKey, (map.get(dateKey) || 0) + 1)
      }
    })
    
    return map
  }, [solvedRecords])

  // Generate calendar dates from 1 year ago (aligned to Sunday) up to today
  const calendarDays = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Go back ~1 year
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)
    
    // Align to the most recent Sunday before or on startDate
    const startDayOfWeek = startDate.getDay() // 0 = Sunday
    startDate.setDate(startDate.getDate() - startDayOfWeek)
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= today) {
      const dateKey = formatLocalDateKey(current)
      const count = activityMap.get(dateKey) || 0
      
      let intensity = 0
      if (count === 1) intensity = 1
      else if (count === 2) intensity = 2
      else if (count >= 3 && count <= 4) intensity = 3
      else if (count >= 5) intensity = 4
      
      days.push({
        dateKey,
        date: new Date(current),
        count,
        intensity
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [activityMap])

  // Group by weeks
  const weeks = React.useMemo(() => {
    const w = []
    let currentWeek = []
    
    for (const day of calendarDays) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        w.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      w.push(currentWeek)
    }
    return w
  }, [calendarDays])

  // Generate month labels
  const monthLabels = React.useMemo(() => {
    const labels: { name: string; colIndex: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, i) => {
      const firstValidDay = week.find(d => d !== null)
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth()
        if (month !== lastMonth) {
          labels.push({ 
            name: firstValidDay.date.toLocaleString('default', { month: 'short' }), 
            colIndex: i 
          })
          lastMonth = month
        }
      }
    })
    return labels
  }, [weeks])

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 1: return "bg-brand/30"
      case 2: return "bg-brand/60"
      case 3: return "bg-brand/80"
      case 4: return "bg-brand"
      default: return "bg-muted dark:bg-zinc-800"
    }
  }

  // Still render the calendar structure even if there's no activity
  // but we can show a polite empty state message nearby if desired.
  // The user requested: "Do NOT replace the calendar with a giant empty state. Still render the calendar grid."

  return (
    <div className="w-full space-y-4">
      {solvedRecords.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No problems solved yet. Your activity will appear here!</p>
      )}
      
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-2 w-max">
          
          {/* Day Labels Column */}
          <div 
            className="grid gap-1 text-[10px] text-muted-foreground pt-5 pr-2 items-center" 
            style={{ gridTemplateRows: 'repeat(7, 12px)' }}
          >
            <span style={{ gridRow: 2 }}>Mon</span>
            <span style={{ gridRow: 4 }}>Wed</span>
            <span style={{ gridRow: 6 }}>Fri</span>
          </div>
          
          {/* Calendar Grid & Months */}
          <div className="flex flex-col">
            
            {/* Month Labels Row */}
            <div 
              className="grid gap-1 mb-1" 
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 12px)` }}
            >
              {monthLabels.map((m, i) => (
                <div 
                  key={i} 
                  className="text-xs text-muted-foreground whitespace-nowrap overflow-visible" 
                  style={{ gridColumn: m.colIndex + 1 }}
                >
                  {m.name}
                </div>
              ))}
            </div>

            {/* Week Columns using CSS Grid with auto-flow column */}
            <div 
              className="grid gap-1 grid-flow-col" 
              style={{ 
                gridTemplateColumns: `repeat(${weeks.length}, 12px)`, 
                gridTemplateRows: 'repeat(7, 12px)' 
              }}
            >
              {weeks.flatMap((week, wIndex) => 
                week.map((day, dIndex) => {
                  if (!day) {
                    return <div key={`${wIndex}-${dIndex}`} className="w-3 h-3 bg-transparent" />
                  }
                  
                  return (
                    <div 
                      key={`${wIndex}-${dIndex}`} 
                      className={`w-3 h-3 rounded-sm transition-colors hover:ring-2 hover:ring-foreground/30 cursor-crosshair ${getIntensityClass(day.intensity)}`}
                      title={`${day.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} — ${day.count} problem${day.count === 1 ? '' : 's'} solved`}
                    />
                  )
                })
              )}
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-sm ${getIntensityClass(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getIntensityClass(1)}`} />
          <div className={`w-3 h-3 rounded-sm ${getIntensityClass(2)}`} />
          <div className={`w-3 h-3 rounded-sm ${getIntensityClass(3)}`} />
          <div className={`w-3 h-3 rounded-sm ${getIntensityClass(4)}`} />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
