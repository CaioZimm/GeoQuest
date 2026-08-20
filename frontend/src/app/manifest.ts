import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GeoQuest',
    short_name: 'GeoQuest',
    description: 'O Desafio Diário de Geografia. Descubra o país misterioso usando o menor número possível de dicas!',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a150f',
    theme_color: '#0a150f',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
