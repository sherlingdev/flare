# Flare Exchange Rate - Currency Converter

A modern, fast, and reliable currency converter built with Next.js, featuring real-time exchange rates for 160+ currencies worldwide.

**🌐 Live Site:** [flarexrate.com](https://flarexrate.com)

## Features

- 🔄 **Real-time Exchange Rates** - Get up-to-date currency conversion rates
- 🌍 **Multi-language Support** - Available in English, Spanish, French, and Portuguese
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⚡ **Fast Performance** - Built with Next.js 15 and React 19
- 🔒 **Privacy Focused** - Calculations performed locally in your browser

## Supported Currencies

**160+ currencies worldwide** including:

- **Major Currencies:** USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY
- **Latin American:** DOP, ARS, BRL, MXN, CLP, COP, PEN, UYU
- **European:** EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK
- **Asian:** JPY, CNY, KRW, INR, THB, SGD, HKD, TWD
- **African:** ZAR, EGP, NGN, KES, MAD, TND, GHS
- **Middle East:** AED, SAR, QAR, KWD, OMR, ILS, TRY
- **And many more...**

*Complete list available in the application interface*

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Font:** DM Sans

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env.local` file in the root directory
   - See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions
   - Required variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
     - `RATES_UPDATE_SECRET` (for API authentication)
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Legal Pages

- **Terms and Conditions** - `/terms`
- **Privacy Policy** - `/privacy`
- **About Us** - `/about`

## Contact

For questions or support, contact us at: [hello@flarexrate.com](mailto:hello@flarexrate.com)

## License

Copyright © 2025 Flare Exchange. All rights reserved.
