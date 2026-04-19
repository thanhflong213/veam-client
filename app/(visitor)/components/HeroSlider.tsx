'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HeroSlide } from '../../lib/types';

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const go = useCallback((idx: number) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(t);
  }, [current, go, total]);

  if (!slides.length) return null;

  return (
    <div className="hero-slider">
      {slides.map((slide, i) => (
        <div key={i} className={`hero-slide${i === current ? ' active' : ''}`}>
          {slide.type === 'image' && slide.imageUrl ? (
            <div className="hs-img" style={{ backgroundImage: `url('${slide.imageUrl}')` }}>
              <div className="hs-img-overlay">
                <div className="inner">
                  {slide.badge && (
                    <span style={{
                      background: 'var(--gold)',
                      color: 'var(--navy)',
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      marginBottom: 12,
                    }}>
                      {slide.badge}
                    </span>
                  )}
                  <h2>{slide.title}</h2>
                  {slide.subtitle && <p>{slide.subtitle}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="hs-text">
              <div className="inner">
                <div className="slide-label">VEAM Conference</div>
                <h1>{slide.title}</h1>
                {slide.subtitle && <p>{slide.subtitle}</p>}
              </div>
            </div>
          )}
        </div>
      ))}
      {total > 1 && (
        <>
          <button className="slider-btn slider-prev" onClick={() => go(current - 1)} aria-label="Previous">&#8249;</button>
          <button className="slider-btn slider-next" onClick={() => go(current + 1)} aria-label="Next">&#8250;</button>
          <div className="slider-dots">
            {slides.map((_, i) => (
              <button key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
          <div className="slide-counter">{current + 1} / {total}</div>
        </>
      )}
    </div>
  );
}
