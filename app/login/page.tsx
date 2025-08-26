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
import apiFetch from '@/lib/api';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!identifier.trim() || !password.trim()) {
    setError("Please enter your handle and password");
    return;
  }
  setIsLoading(true);
  setError("");
  try {
    const res = await apiFetch('/auth/login/', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: identifier,
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || "Login failed";
      throw new Error(msg);
    }
    if (typeof window !== "undefined") {
      if (data.access) localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
    }
    router.push("/wallet");
  } catch (err: any) {
    console.error(err);
    setError(err?.message || "Something went wrong");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-sans">Welcome Back</CardTitle>
          <CardDescription className="font-serif">Please enter your handle and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-sans">
                Handle
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your handle"
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
