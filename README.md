# 🌍 BorderlessFX - Cross-Border Payment Platform

> **Operation Borderless**: Move money across Africa in milliseconds with stablecoins

A modern, secure cross-border payment platform that enables instant transfers using stablecoins (cNGN, cXAF, USDx, EURx) with real-time exchange rates and transparent pricing.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: React hooks with custom services
- **API Integration**: RESTful API with Railway backend
- **Real-time Data**: Live exchange rate updates
- **Authentication**: JWT-based auth with refresh tokens
- **Package Manager**: pnpm

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/vik2ry/borderlessfx.git
   cd borderlessfx
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_API_BASE_URL=https://unbordered-production.up.railway.app/api
   NEXT_PUBLIC_API_BASE=https://unbordered-production.up.railway.app/api
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
\`\`\`bash
pnpm build
pnpm start
\`\`\`

## 🔐 Admin Credentials

Currently, the platform uses user-based authentication. Admin features are accessible through the wallet dashboard after login.

**Test Account Creation**: Use the onboarding flow at `/onboard` to create a new account with:
- Handle (username)
- Email address
- Phone number
- Password

## 🎯 Feature Walkthrough

### 🏠 **Landing Page** (`/`)
- **Live Exchange Rates**: Real-time FX rates updated every 3 minutes
- **Hero Section**: Clear value proposition with email capture
- **Feature Overview**: Multi-currency wallets, instant transfers, smart swaps
- **Rate Preview**: Live rates for USDx→cNGN, USDx→cXAF, EURx→USDx, cNGN→cXAF

### 🔐 **Authentication System**
- **Login** (`/login`): Secure login with handle/email and password
- **Onboarding** (`/onboard`): New user registration with comprehensive form
- **JWT Authentication**: Access and refresh token management

### 💰 **Wallet Dashboard** (`/wallet`)
- **Multi-Currency Balances**: View cNGN, cXAF, USDx, EURx balances
- **Balance Charts**: Visual representation of portfolio distribution
- **Quick Actions**: Send, receive, swap currencies
- **Transaction History**: Detailed transaction logs with filtering

### 🔍 **Transaction Explorer** (`/explorer`)
- **Live Transaction Feed**: Real-time transaction monitoring
- **Transaction Details**: Comprehensive transaction information
- **Search & Filter**: Find specific transactions by various criteria
- **Network Statistics**: Platform usage metrics

### 💸 **Transfer System**
- **Instant Transfers**: Cross-border payments in seconds
- **Smart Currency Conversion**: Automatic FX conversion with live rates
- **Recipient Management**: Save and manage frequent recipients
- **Transfer Confirmation**: Multi-step confirmation process

### 📊 **Real-Time Features**
- **Live Exchange Rates**: Updated every 3 minutes with fallback to cached data
- **Rate Service**: Intelligent rate management with retry logic
- **Transaction Updates**: Real-time transaction status updates
- **Balance Synchronization**: Automatic balance updates

## 🏗️ Architecture Highlights

### **Service Layer**
- `RateService`: Manages live exchange rates with intelligent caching
- `ApiService`: Centralized API communication with error handling
- `DemoData`: Fallback data for offline/development scenarios

### **Component Structure**
- **Modular Components**: Reusable UI components with shadcn/ui
- **Custom Hooks**: `use-mobile`, `use-toast` for enhanced UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### **Error Handling**
- **Graceful Degradation**: Falls back to cached data when API unavailable
- **User Feedback**: Toast notifications for all user actions
- **Network Resilience**: Automatic retry logic with exponential backoff

## 🌟 Key Features

- ⚡ **Instant Transfers**: Cross-border payments in milliseconds
- 🔒 **Bank-Grade Security**: JWT authentication with refresh tokens
- 📱 **Mobile Responsive**: Optimized for all device sizes
- 🌍 **Multi-Currency**: Support for cNGN, cXAF, USDx, EURx
- 📊 **Real-Time Rates**: Live FX data with transparent pricing
- 🎯 **User-Friendly**: Intuitive interface with clear navigation
- 🔄 **Offline Resilience**: Graceful handling of network issues

## 🚀 Deployment

The application is designed for deployment on Vercel with the Railway backend. Environment variables are automatically configured in the Vercel dashboard.

---

**Built with ❤️ for seamless cross-border payments across Africa**
