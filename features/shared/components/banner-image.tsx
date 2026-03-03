import Image, { type ImageLoader } from 'next/image'

import { cn } from '@/features/shared/lib/utils'

interface BannerImageProps {
  src: string
  alt: string
  className?: string
}

const pexelsLoader: ImageLoader = ({ src }) => {
  const url = new URL(src)
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('w', '1200')
  url.searchParams.set('h', '500')
  url.searchParams.set('crop', 'faces')
  url.searchParams.set('auto', 'compress')
  return url.toString()
}

const unsplashLoader: ImageLoader = ({ src }) => {
  const url = new URL(src)
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('w', '1200')
  url.searchParams.set('h', '500')
  url.searchParams.set('auto', 'format,compress')
  return url.toString()
}

const defaultLoader: ImageLoader = ({ src }) => src

function getLoader(src: string): ImageLoader {
  if (src.includes('images.pexels.com')) return pexelsLoader
  if (src.includes('images.unsplash.com')) return unsplashLoader
  return defaultLoader
}

export function BannerImage({ src, alt, className }: BannerImageProps) {
  return (
    <div
      className={cn(
        'relative w-full h-30 overflow-hidden rounded-t-md',
        className
      )}>
      <Image
        loader={getLoader(src)}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
  )
}
