import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'WaveConv - Convert Audio to Telegram Voice Messages',
  description: 'Transform any audio file into perfect Telegram voice messages. Fast, free, and reliable audio conversion to OGG/Opus format.',
  keywords: 'telegram, voice message, audio conversion, ogg, opus, mp3, wav, converter',
  authors: [{ name: 'WaveConv' }],
  creator: 'WaveConv',
  openGraph: {
    title: 'WaveConv - Convert Audio to Telegram Voice Messages',
    description: 'Transform any audio file into perfect Telegram voice messages. Fast, free, and reliable audio conversion.',
    url: 'https://waveconv.com',
    siteName: 'WaveConv',
    images: [
      {
        url: 'https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png',
        width: 1200,
        height: 630,
        alt: 'WaveConv - Audio to Telegram Voice Converter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WaveConv - Convert Audio to Telegram Voice Messages',
    description: 'Transform any audio file into perfect Telegram voice messages. Fast, free, and reliable.',
    images: ['https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png'],
  },
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
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon et icônes */}
        <link rel="icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" />
        
        {/* Meta tags supplémentaires */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}