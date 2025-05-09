"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BingoCardProps {
  entries: string[]
}

export default function BingoCard({ entries }: BingoCardProps) {
  const [shuffledEntries, setShuffledEntries] = useState<string[]>([])
  const [markedSquares, setMarkedSquares] = useState<boolean[]>([])
  const [cardId, setCardId] = useState<string>("")

  // Generate a unique ID for this bingo card based on entries
  useEffect(() => {
    // Create a stable ID based on the entries content
    const entriesString = entries.sort().join("|")
    const id = btoa(entriesString).substring(0, 10)

    if (cardId !== id) {
      setCardId(id)

      // Load marked squares from localStorage if they exist
      const savedMarks = localStorage.getItem(`bingo-marks-${id}`)
      if (savedMarks) {
        setMarkedSquares(JSON.parse(savedMarks))
      } else {
        // Initialize all squares as unmarked
        setMarkedSquares(Array(Math.min(25, entries.length)).fill(false))
      }
    }
  }, [entries, cardId])

  // Shuffle entries when component mounts or entries change
  useEffect(() => {
    // Only shuffle if we don't have shuffled entries yet or if entries changed
    if (shuffledEntries.length === 0 || shuffledEntries.length !== Math.min(25, entries.length)) {
      const shuffled = [...entries]

      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      // Take only what we need for the card (up to 25 entries)
      setShuffledEntries(shuffled.slice(0, 25))
    }
  }, [entries, cardId, shuffledEntries.length])

  // Save marked squares to localStorage whenever they change
  useEffect(() => {
    if (cardId && markedSquares.length > 0) {
      localStorage.setItem(`bingo-marks-${cardId}`, JSON.stringify(markedSquares))
    }
  }, [markedSquares, cardId])

  const toggleMark = (index: number) => {
    const newMarkedSquares = [...markedSquares]
    newMarkedSquares[index] = !newMarkedSquares[index]
    setMarkedSquares(newMarkedSquares)
  }

  // Determine grid size based on number of entries
  const getGridSize = () => {
    const count = Math.min(25, shuffledEntries.length)
    if (count <= 9) return "grid-cols-3" // 3x3
    if (count <= 16) return "grid-cols-4" // 4x4
    return "grid-cols-5" // 5x5
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold text-center mb-4">BINGO</h2>
        <div className={cn("grid gap-2", getGridSize())}>
          {shuffledEntries.slice(0, 25).map((entry, index) => (
            <div
              key={index}
              onClick={() => toggleMark(index)}
              className={cn(
                "aspect-square border rounded-md p-1 flex items-center justify-center text-center text-xs sm:text-sm cursor-pointer transition-colors",
                markedSquares[index] ? "bg-violet-400 text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {entry}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
