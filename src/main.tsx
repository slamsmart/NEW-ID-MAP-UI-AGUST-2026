import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import './index.css'
import App from './App.tsx'
import { ClerkProviderGate } from './components/clerk/ClerkContext'
import { convex } from './lib/convexClient'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

// Diagnostik startup — supaya cepat tahu kalau env ter-load
if (clerkKey) {
  console.log(
    `%c[ID-MAP] Clerk: %cACTIVE %c(${clerkKey.slice(0, 12)}…${clerkKey.slice(-4)})`,
    'font-weight:bold;color:#0d9488', 'font-weight:bold;color:#16a34a', 'color:#64748b',
  );
} else {
  console.warn(
    '%c[ID-MAP] Clerk: NOT CONFIGURED — VITE_CLERK_PUBLISHABLE_KEY tidak terbaca.\n' +
    'Pastikan .env.local ada baris:\n  VITE_CLERK_PUBLISHABLE_KEY=pk_test_…\n' +
    '(prefix VITE_, tanpa quote, tanpa spasi sekitar `=`)\n' +
    'Lalu STOP & RESTART `npm run dev` (auto-restart Vite kadang tidak cukup).',
    'font-weight:bold;color:#dc2626',
  );
}

const Root = (
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Clerk dimuat lazy-aggressive: provider baru ter-mount setelah chunk
        Clerk selesai diunduh, sehingga entry chunk jauh lebih ringan. */}
    <ClerkProviderGate>{Root}</ClerkProviderGate>
  </StrictMode>,
)
