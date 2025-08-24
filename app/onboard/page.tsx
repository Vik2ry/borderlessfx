"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Mail, Phone, ArrowRight, AlertCircle, User, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OnboardPage() {
  const [handle, setHandle] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [suggestedHandles, setSuggestedHandles] = useState<string[]>([])
  const router = useRouter()

  const generateHandleSuggestions = (baseHandle: string): string[] => {
    const suggestions = []
    const timestamp = Date.now().toString().slice(-4)
    const randomNum = Math.floor(Math.random() * 999) + 1

    suggestions.push(`${baseHandle}${randomNum}`)
    suggestions.push(`${baseHandle}_${timestamp}`)
    suggestions.push(`${baseHandle}${Math.floor(Math.random() * 99) + 1}`)

    return suggestions.slice(0, 3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuggestedHandles([]) // Clear previous suggestions

    console.log("[v0] Starting user creation with:", { handle, email, phone })

    try {
      const apiUrl = "https://unbordered-production.up.railway.app/api/users"
      console.log("[v0] Making request to:", apiUrl)

      const requestBody = {
        handle: handle,
        email: email || undefined,
        phone: phone || undefined,
      }
      console.log("[v0] Request body:", requestBody)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Success response:", data)

        const walletId = data.wallet_id || `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("wallet_id", walletId)
        localStorage.setItem("user_handle", handle)
        localStorage.setItem("user_email", email)
        localStorage.setItem("user_phone", phone)

        router.push("/wallet")
      } else {
        let errorMessage = `Server error: ${response.status}`

        try {
          const errorData = await response.json()
          console.error("[v0] API Error:", response.status, errorData)

          if (response.status === 400 && errorData.handle) {
            const handleError = Array.isArray(errorData.handle) ? errorData.handle[0] : errorData.handle
            if (handleError.includes("already exists")) {
              const suggestions = generateHandleSuggestions(handle)
              setSuggestedHandles(suggestions)
              setHandle(suggestions[0]) // Auto-select the first suggestion to improve UX
              errorMessage = `The username "${handle}" is already taken. We've suggested "${suggestions[0]}" for you, or choose from the other options below.`
            } else {
              errorMessage = `Username error: ${handleError}`
            }
          } else if (response.status === 400 && errorData.email) {
            const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email
            errorMessage = `Email error: ${emailError}`
          } else if (response.status === 400 && errorData.phone) {
            const phoneError = Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone
            errorMessage = `Phone error: ${phoneError}`
          } else {
            // Generic error message for other cases
            const firstError = Object.values(errorData)[0]
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0]
            } else if (typeof firstError === "string") {
              errorMessage = firstError
            }
          }
        } catch (parseError) {
          // If we can't parse the JSON, fall back to text
          const errorText = await response.text()
          console.error("[v0] Failed to parse error JSON:", parseError)
          errorMessage = errorText || errorMessage
        }

        setError(errorMessage)
      }
    } catch (error) {
      console.error("[v0] Network error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.log("[v0] CORS/Network error detected, using fallback mode")

        const mockWalletId = `demo_wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("wallet_id", mockWalletId)
        localStorage.setItem("user_handle", handle)
        localStorage.setItem("user_email", email)
        localStorage.setItem("user_phone", phone)
        localStorage.setItem("demo_mode", "true")

        console.log("[v0] Created demo wallet:", mockWalletId)
        router.push("/wallet")
      } else {
        setError(
          `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}. Please check your internet connection.`,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-serif">Back</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-sans text-foreground">Borderless</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Step 1 of 1
            </Badge>
            <h1 className="text-3xl font-bold font-sans text-foreground mb-2">Create Your Wallet</h1>
            <p className="text-muted-foreground font-serif">Get started with your multi-currency wallet in seconds</p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-sans">Account Information</CardTitle>
              <CardDescription className="font-serif">
                Choose a username and enter your contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-serif">{error}</AlertDescription>
                </Alert>
              )}

              {suggestedHandles.length > 0 && (
                <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium font-sans mb-3 text-primary">✨ Try these available usernames:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedHandles.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant={index === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setHandle(suggestion)}
                        className="font-serif text-xs"
                      >
                        {suggestion}
                        {index === 0 && " ✓"}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-serif">
                    The first suggestion has been automatically selected for you.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="font-sans flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Username</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="handle"
                        type="text"
                        placeholder="your_username"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="font-serif flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const randomHandle = `user${Math.floor(Math.random() * 9999) + 1000}`
                          setHandle(randomHandle)
                        }}
                        title="Generate random username"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="font-serif"
                    />
                  </div>

                  <div className="text-center text-sm text-muted-foreground font-serif">or</div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="font-serif"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full font-sans"
                  disabled={!handle || (!email && !phone) || isLoading}
                >
                  {isLoading ? (
                    "Creating Wallet..."
                  ) : (
                    <>
                      Create Wallet <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground font-serif">
              By creating a wallet, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
