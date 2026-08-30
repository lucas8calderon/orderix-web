import React from 'react';
import { LANDING_IMAGES } from '../landingAssets';

/**
 * Imagem de marketing da landing com aspect-ratio e lazy loading.
 */
export function LandingImage({
  imageKey,
  className = '',
  lazy = true,
  priority = false,
}) {
  const image = LANDING_IMAGES[imageKey];
  if (!image) return null;

  const loading = priority || !lazy ? 'eager' : 'lazy';

  return (
    <figure className={`lp-media ${className}`.trim()}>
      <img
        className="lp-media__img"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      />
    </figure>
  );
}
