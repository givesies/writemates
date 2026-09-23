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
              width: 71,
              height: 54,
              background: '#fffdf6',
              borderRadius: 7,
              transform: 'rotate(-13deg)',
              marginRight: -10,
            }}
          />
          <div
            style={{
              width: 71,
              height: 54,
              background: '#fffdf6',
              borderRadius: 7,
              transform: 'rotate(13deg)',
              marginLeft: -10,
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
