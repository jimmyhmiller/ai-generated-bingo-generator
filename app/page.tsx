"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Share2, Plus, Trash2, RefreshCw } from "lucide-react"
import BingoCard from "@/components/bingo-card"
import { start } from "repl"

export default function BingoGenerator() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [entries, setEntries] = useState<string[]>([])
  const [currentEntry, setCurrentEntry] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [startedWithNothing, setStartedWithNothing] = useState(true)

  // Load entries from URL if available - only once on initial load
  useEffect(() => {
    const encodedEntries = searchParams.get("entries")
    if (encodedEntries && entries.length === 0) {
      try {
        const decodedEntries = JSON.parse(atob(encodedEntries))
        if (Array.isArray(decodedEntries) && decodedEntries.length > 0) {
          setEntries(decodedEntries)
          setIsGenerating(true)
          setStartedWithNothing(false)
        }
      } catch (error) {
        console.error("Failed to parse entries from URL", error)
      }
    }
  }, [searchParams, entries.length])

  const addEntry = () => {
    if (currentEntry.trim() && !entries.includes(currentEntry.trim())) {
      setEntries([...entries, currentEntry.trim()])
      setCurrentEntry("")
    }
  }

  const removeEntry = (index: number) => {
    const newEntries = [...entries]
    newEntries.splice(index, 1)
    setEntries(newEntries)
  }

  const generateBingoCard = () => {
    if (entries.length < 9) {
      alert("Please add at least 9 entries to generate a bingo card")
      return
    }

    setIsGenerating(true)

    // Generate shareable URL
    const encodedEntries = btoa(JSON.stringify(entries))
    const url = `${window.location.origin}?entries=${encodedEntries}`
    // navigate to the generated URL
    router.push(url)
    setShareUrl(url)
  }

  const resetGenerator = () => {
    setEntries([])
    setCurrentEntry("")
    setIsGenerating(false)
    setShareUrl("")
    router.push("/")
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Bingo Card Generator</h1>

      {!isGenerating ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Bingo Card</CardTitle>
            <CardDescription>Add entries one at a time. You need at least 9 entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="entry" className="sr-only">
                  Entry
                </Label>
                <Input
                  id="entry"
                  placeholder="Add an entry..."
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEntry()}
                />
              </div>
              <Button onClick={addEntry} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {entries.length > 0 && (
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Your Entries ({entries.length})</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {entries.map((entry, index) => (
                    <li key={index} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                      <span className="truncate mr-2">{entry}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEntry(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={generateBingoCard} disabled={entries.length < 9}>
              Generate Bingo Card
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <BingoCard entries={entries} />

          {startedWithNothing ? <div className="space-y-3">
            <Button className="w-full flex items-center justify-center" onClick={copyShareUrl} variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Copy Shareable Link
            </Button>

            <Button className="w-full flex items-center justify-center" onClick={resetGenerator} variant="secondary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Create New Card
            </Button>
          </div> : <div />}
          
        </div>
      )}
    </div>
  )
}
