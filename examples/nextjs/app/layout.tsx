export const metadata = { title: 'CaptchaLa + Next.js' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '48px auto', padding: '0 16px' }}>
        {children}
      </body>
    </html>
  )
}
