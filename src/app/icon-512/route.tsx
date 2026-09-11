import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          background: '#33503e',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fbfaf7',
          fontWeight: 700,
        }}
      >
        W
      </div>
    ),
    { width: 512, height: 512 }
  )
}