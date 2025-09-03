import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { type NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a helpful customer support assistant for Borderless, a cross-border payment platform that enables instant transfers across Africa using stablecoins.

Key information about Borderless:

SERVICES:
- Instant cross-border payments across Africa
- Multi-currency wallets supporting cNGN (Nigerian Naira), cXAF (CFA Franc), USDx (US Dollar), and EURx (Euro) stablecoins
- Real-time currency exchange with live FX rates
- Smart swaps between different stablecoins
- Secure wallet management with bank-grade security

FEATURES:
- Instant transfers (payments complete in seconds/milliseconds)
- Real-time exchange rates updated every minute
- Transaction history and tracking
- Secure and compliant platform
- Multi-currency wallet support
- Live transaction explorer

GETTING STARTED:
- Users can create an account by clicking "Get Started" or "Create Your Wallet"
- Existing users can sign in through the "Sign In" button
- The platform offers both web wallet access and live transaction viewing

SECURITY:
- Bank-grade security and compliance
- Secure wallet infrastructure
- Real-time transaction monitoring

Be helpful, friendly, and informative. If users ask about specific technical details you're unsure about, direct them to contact support or check the platform directly. Always maintain a professional but approachable tone.

Keep responses concise but comprehensive. If users ask about getting started, guide them to the appropriate sign-up or sign-in options.`

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build conversation context
    const conversationHistory =
      history
        ?.slice(-5) // Limit to last 5 messages for context
        ?.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })) || []

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages: [
        ...conversationHistory,
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
