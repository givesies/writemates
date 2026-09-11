import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Writemates',
    short_name: 'Writemates',
    description: 'Track your writing progress with fellow writers',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfaf7',
    theme_color: '#33503e',
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png' },
    ],
  }
}