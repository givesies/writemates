import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: '#1747e0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fffdf6',
          fontWeight: 700,
        }}
      >
        W
      </div>
    ),
    { width: 192, height: 192 }
  )
}
