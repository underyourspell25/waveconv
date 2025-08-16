import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'WaveConv - Convert Audio to Telegram Voice Messages',
  description: 'Convert your audio and video files to .oga format',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}