import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1747e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              width: 190,
              height: 145,
              background: '#fffdf6',
              borderRadius: 18,
              transform: 'rotate(-13deg)',
              marginRight: -28,
            }}
          />
          <div
            style={{
              width: 190,
              height: 145,
              background: '#fffdf6',
              borderRadius: 18,
              transform: 'rotate(13deg)',
              marginLeft: -28,
            }}
          />
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
