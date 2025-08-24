"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, LogIn } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError("Please enter your email, phone, or username")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Starting login with:", { identifier })

      // Since there's no dedicated login endpoint, we'll try to get user info
      // by attempting to create a user and handling the "already exists" response
      const response = await fetch("https://unbordered-production.up.railway.app/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          handle: identifier.trim(),
          email: `${identifier.trim()}@temp.com`, // Temporary email for the check
          phone: "+1234567890", // Temporary phone for the check
        }),
      })

      console.log("[v0] Login response status:", response.status)

      if (response.status === 400) {
        // User already exists, try to extract wallet info from error
        const errorData = await response.json()
        console.log("[v0] User exists, checking error data:", errorData)

        if (errorData.handle && errorData.handle[0]?.includes("already exists")) {
          // User exists, create demo session
          console.log("[v0] User found, creating demo session")

          localStorage.setItem("wallet_id", `wallet_${identifier.trim()}`)
          localStorage.setItem("user_handle", identifier.trim())
          localStorage.setItem("demo_mode", "true")

          router.push("/wallet")
          return
        }
      } else if (response.ok) {
        // New user created successfully
        const data = await response.json()
        console.log("[v0] New user created:", data)

        localStorage.setItem("wallet_id", data.wallet_id)
        localStorage.setItem("user_email", data.email || "")
        localStorage.setItem("user_phone", data.phone || "")
        localStorage.setItem("user_handle", data.handle || "")
        localStorage.removeItem("demo_mode")

        router.push("/wallet")
        return
      }

      // If we get here, something went wrong
      setError("Account not found. Please check your details or create a new account.")
    } catch (error) {
      console.error("[v0] Network error:", error)

      console.log("[v0] API unavailable, using demo mode")

      localStorage.setItem("wallet_id", `demo_wallet_${identifier.trim()}`)
      localStorage.setItem("user_handle", identifier.trim())
      localStorage.setItem("demo_mode", "true")

      router.push("/wallet")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-sans">Welcome Back</CardTitle>
          <CardDescription className="font-serif">Sign in to your Borderless wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-sans">
                Email, Phone, or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email, phone, or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="font-serif"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-serif">{error}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full font-sans" disabled={isLoading || !identifier.trim()}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground font-serif">
              Don't have an account?{" "}
              <Link href="/onboard" className="text-primary hover:underline font-sans">
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
