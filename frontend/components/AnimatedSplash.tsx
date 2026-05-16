'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 1.2,
          ease: 'power3.inOut',
          onComplete: () => onComplete(),
        });
      }
    });

    // 1. Initial State: Hide all paths
    // We target paths and circles that have the 'splash-draw-path' class
    gsap.set('.splash-draw-path', { 
      strokeDasharray: 1000, 
      strokeDashoffset: 1000,
      opacity: 0 
    });

    // 2. Animate Drawing
    tl.to('.splash-draw-path', {
      opacity: 1,
      strokeDashoffset: 0,
      duration: 2.8,
      stagger: {
        amount: 1.5,
        from: "start"
      },
      ease: 'power3.inOut',
    });

    // 3. Fade in text with letter spacing animation
    tl.fromTo('.splash-title', 
      { opacity: 0, y: 30, letterSpacing: '0.6em', filter: 'blur(10px)' },
      { opacity: 1, y: 0, letterSpacing: '0.15em', filter: 'blur(0px)', duration: 2, ease: 'expo.out' },
      '-=1.5'
    );

    // 4. Subtle scale up of the whole logo
    tl.to('.splash-logo-container', {
      scale: 1.08,
      duration: 4,
      ease: 'sine.inOut',
    }, '-=3.5');

    // 5. "Mordedura" effect - The "bite" happens suddenly
    tl.fromTo('.bite-overlay', 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(4)' },
      '-=0.5'
    );

  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0d0b09', // --bg-dark
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7aaa8a', // --green-primary
        overflow: 'hidden'
      }}
    >
      <div className="splash-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        {/* SVG Drawing */}
        <svg
          width="320"
          height="180"
          viewBox="0 0 320 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: '40px', filter: 'drop-shadow(0 0 8px rgba(122, 170, 138, 0.2))' }}
        >
          {/* Plate Outline - Sketchy dash */}
          <circle cx="160" cy="90" r="72" stroke="#7aaa8a" strokeWidth="0.5" strokeDasharray="4 8" className="splash-draw-path" />
          
          {/* Inner Plate */}
          <circle cx="160" cy="90" r="58" stroke="#7aaa8a" strokeWidth="1.5" className="splash-draw-path" />

          {/* Fork (Left) */}
          <path d="M70 45 L70 135" stroke="#7aaa8a" strokeWidth="2.5" strokeLinecap="round" className="splash-draw-path" />
          <path d="M58 45 Q58 75 70 75 Q82 75 82 45" stroke="#7aaa8a" strokeWidth="2.5" strokeLinecap="round" className="splash-draw-path" />
          <path d="M64 45 L64 70 M76 45 L76 70" stroke="#7aaa8a" strokeWidth="2" strokeLinecap="round" className="splash-draw-path" />

          {/* Knife (Right) */}
          <path d="M250 45 Q270 45 270 90 L270 135 L250 135 Z" stroke="#7aaa8a" strokeWidth="2.5" strokeLinejoin="round" className="splash-draw-path" />

          {/* Wine Glass (Center) */}
          <path d="M160 50 Q140 50 140 75 Q140 90 160 90 Q180 90 180 75 Q180 50 160 50" stroke="#7aaa8a" strokeWidth="1.8" className="splash-draw-path" />
          <path d="M160 90 L160 115 M145 115 L175 115" stroke="#7aaa8a" strokeWidth="2" strokeLinecap="round" className="splash-draw-path" />

          {/* Bite Overlay - The Mordedura */}
          <path 
            className="bite-overlay"
            d="M218 85 Q205 95 215 105 Q225 115 205 125 Q185 130 175 110" 
            fill="#0d0b09" 
            style={{ opacity: 0 }}
          />
        </svg>

        {/* Text */}
        <h1 
          className="splash-title"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            fontWeight: 700,
            color: '#ede0c8', // --text-primary
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.2
          }}
        >
          Club del Bodegón
        </h1>
        
        <div 
          className="splash-title"
          style={{
            fontSize: '11px',
            color: '#7aaa8a', // --green-primary
            marginTop: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            fontWeight: 700,
            opacity: 0,
          }}
        >
          Sabor & Tradición
        </div>
      </div>
    </div>
  );
}
