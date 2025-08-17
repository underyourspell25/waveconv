import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'WaveConv - Convert Audio to Telegram Voice Messages | Free MP3 to OGG Converter',
  description: 'Transform any audio file (MP3, WAV, M4A) into perfect Telegram voice messages. Free online converter to OGG/Opus format. Fast, secure, and no file size limits.',
  keywords: [
    'telegram voice message converter',
    'audio to telegram voice',
    'mp3 to ogg converter',
    'voice message generator',
    'telegram audio converter',
    'ogg opus converter',
    'mp3 to telegram',
    'wav to telegram voice',
    'audio converter online',
    'voice message maker',
    'telegram voice format',
    'audio to opus converter'
  ].join(', '),
  
  // SEO Meta Tags
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  authors: [{ name: 'WaveConv Team', url: 'https://waveconv.com' }],
  creator: 'WaveConv',
  publisher: 'WaveConv',
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'WaveConv - Convert Any Audio to Telegram Voice Messages',
    description: 'Free online tool to convert MP3, WAV, M4A files to Telegram voice messages. Perfect OGG/Opus format, no limits, instant conversion.',
    url: 'https://waveconv.com',
    siteName: 'WaveConv',
    images: [
      {
        url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/waveconv-og-image.png', // Image 1200x630
        width: 1200,
        height: 630,
        alt: 'WaveConv - Audio to Telegram Voice Converter',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
    videos: [], // Ajoutez des vidéos si vous en avez
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'WaveConv - Convert Audio to Telegram Voice Messages',
    description: 'Free online converter: MP3, WAV, M4A → Telegram voice messages. Perfect OGG/Opus format, instant results.',
    site: '@waveconv', // Remplacez par votre handle Twitter si vous en avez un
    creator: '@waveconv',
    images: {
      url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/waveconv-twitter-card.png',
      alt: 'WaveConv Audio Converter',
    },
  },
  
  // Favicon et App Icons
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png' },
      { url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png',
    apple: [
      { url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png' },
      { url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png',
        color: '#8b5cf6',
      },
    ],
  },
  
  // Schema.org structured data
  other: {
    'application-name': 'WaveConv',
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#8b5cf6',
    'color-scheme': 'dark light',
  },
  
  // PWA Manifest
  manifest: '/manifest.json',
  
  // Verification (ajoutez si vous avez ces services)
  verification: {
    google: '', // Google Search Console verification code
    yandex: '', // Yandex verification code  
    yahoo: '',  // Yahoo verification code
    other: {
      'msvalidate.01': '', // Bing verification code
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://waveconv.com',
    languages: {
      'en-US': 'https://waveconv.com',
      'fr-FR': 'https://waveconv.com/fr', // Si vous ajoutez le français
    },
  },
  
  // Category for app stores
  category: 'productivity',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon et icônes */}
        <link rel="icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        
        {/* Theme and viewport */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Preconnect pour performance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "WaveConv",
              "description": "Convert any audio file to Telegram voice messages. Free online MP3, WAV, M4A to OGG/Opus converter.",
              "url": "https://waveconv.com",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "WaveConv"
              },
              "publisher": {
                "@type": "Organization",
                "name": "WaveConv",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png"
                }
              },
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString().split('T')[0],
              "inLanguage": "en-US",
              "isAccessibleForFree": true,
              "screenshot": "https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/waveconv-screenshot.png"
            })
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}