"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Wallet, Send, RefreshCw, History, Globe, Shield, Zap, LogIn, Activity } from "lucide-react"
import Link from "next/link"
import { RateService } from "@/lib/rate-service"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [rates, setRates] = useState<any>({})
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    RateService.startRateUpdates()
    setRates(RateService.getCurrentRates())
    setLastUpdated(RateService.getLastUpdated())

    const handleRateUpdate = (newRates: any) => {
      setRates(newRates)
      setLastUpdated(new Date())
    }

    RateService.addRateListener(handleRateUpdate)

    return () => {
      RateService.removeRateListener(handleRateUpdate)
      RateService.stopRateUpdates()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-sans text-foreground">Borderless</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#rates" className="text-muted-foreground hover:text-foreground transition-colors">
              Rates
            </Link>
            <Link href="/explorer" className="text-muted-foreground hover:text-foreground transition-colors">
              Explorer
            </Link>
            <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/onboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Operation Borderless
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-sans text-foreground mb-6 leading-tight">
            Move Money Across
            <span className="text-primary"> Africa</span>
            <br />
            In Milliseconds
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-serif leading-relaxed">
            Instant, transparent cross-border payments powered by stablecoins. Send cNGN, cXAF, USDx, and EURx with
            real-time FX rates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center space-x-2 max-w-md w-full">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button asChild>
                <Link href="/onboard">
                  Start Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mb-12">
            <p className="text-muted-foreground font-serif mb-4">Already have an account?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button variant="outline" asChild>
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Your Wallet
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/explorer">
                  <Activity className="w-4 h-4 mr-2" />
                  View Live Transactions
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold font-sans mb-2">Instant Transfers</h3>
              <p className="text-sm text-muted-foreground font-serif">Cross-border payments in seconds</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold font-sans mb-2">Secure & Compliant</h3>
              <p className="text-sm text-muted-foreground font-serif">Bank-grade security and compliance</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold font-sans mb-2">Real-time Rates</h3>
              <p className="text-sm text-muted-foreground font-serif">Live FX rates for best value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-foreground mb-4">
              Everything You Need for Cross-Border Payments
            </h2>
            <p className="text-lg text-muted-foreground font-serif max-w-2xl mx-auto">
              A complete platform for managing multi-currency wallets and instant transfers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Multi-Currency Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-serif text-center">
                  Hold cNGN, cXAF, USDx, and EURx in one secure wallet with real-time balances
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Instant Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-serif text-center">
                  Send money across borders instantly with automatic currency conversion
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Smart Swaps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-serif text-center">
                  Exchange stablecoins at competitive rates with real-time FX data
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-serif text-center">
                  Track all your transfers, swaps, and deposits with detailed history
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Rates Preview */}
      <section id="rates" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-sans text-foreground mb-4">Live Exchange Rates</h2>
            <p className="text-lg text-muted-foreground font-serif">
              Real-time rates updated every minute for transparent pricing
            </p>
            <p className="text-sm text-muted-foreground font-serif mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-sans">Current Rates</CardTitle>
              <CardDescription className="font-serif">Live exchange rates for supported stablecoins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-lg">
                  <div>
                    <span className="font-semibold font-sans">USDx → cNGN</span>
                    <p className="text-sm text-muted-foreground font-serif">US Dollar to Nigerian Naira</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-sans text-primary">
                      ₦{(1 / (rates.cNGN || 0.0012)).toLocaleString()}
                    </span>
                    <p className="text-sm text-green-600 font-serif">Live</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-card rounded-lg">
                  <div>
                    <span className="font-semibold font-sans">USDx → cXAF</span>
                    <p className="text-sm text-muted-foreground font-serif">US Dollar to CFA Franc</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-sans text-primary">
                      ₣{(1 / (rates.cXAF || 0.0016)).toLocaleString()}
                    </span>
                    <p className="text-sm text-green-600 font-serif">Live</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-card rounded-lg">
                  <div>
                    <span className="font-semibold font-sans">EURx → USDx</span>
                    <p className="text-sm text-muted-foreground font-serif">Euro to US Dollar</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-sans text-primary">${(rates.EURx || 1.08).toFixed(2)}</span>
                    <p className="text-sm text-green-600 font-serif">Live</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-card rounded-lg">
                  <div>
                    <span className="font-semibold font-sans">cNGN → cXAF</span>
                    <p className="text-sm text-muted-foreground font-serif">Nigerian Naira to CFA Franc</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-sans text-primary">
                      ₣{((rates.cNGN || 0.0012) / (rates.cXAF || 0.0016)).toFixed(3)}
                    </span>
                    <p className="text-sm text-green-600 font-serif">Live</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-6">Ready to Move Money Without Borders?</h2>
          <p className="text-lg mb-8 opacity-90 font-serif">
            Join thousands of users already sending money across Africa instantly and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/onboard">
                Create Your Wallet <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link href="/login">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-sans text-foreground">Borderless</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground font-serif">
              <span>© 2025 Borderless. All rights reserved.</span>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
