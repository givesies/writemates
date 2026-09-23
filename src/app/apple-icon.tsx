import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
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
              width: 67,
              height: 51,
              background: '#fffdf6',
              borderRadius: 6,
              transform: 'rotate(-13deg)',
              marginRight: -10,
            }}
          />
          <div
            style={{
              width: 67,
              height: 51,
              background: '#fffdf6',
              borderRadius: 6,
              transform: 'rotate(13deg)',
              marginLeft: -10,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
