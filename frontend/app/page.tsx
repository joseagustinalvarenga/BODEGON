'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { promotionApi } from '@/lib/api';
import type { Promotion } from '@/lib/types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const heroSlides = [
  { image: '/images/hero1.png', title: 'Honrando La Mejor Comida',  subtitle: 'Cada plato es una experiencia. Vení a disfrutar y sumá puntos con cada visita.' },
  { image: '/images/hero2.png', title: 'Sabores Que Te Enamoran',   subtitle: 'Empanadas, provoleta, asado… lo mejor de la cocina argentina te espera.' },
  { image: '/images/hero3.png', title: 'El Asado Perfecto',          subtitle: 'Cortes premium a la parrilla. Una tradición que se vive en cada bocado.' },
];

const imageCards = [
  { image: '/images/card_menu.png',     label: 'Nuestro Menú',       href: '#how-it-works' },
  { image: '/images/card_location.png', label: 'Encontrá tu Club',   href: '#promos' },
  { image: '/images/card_rewards.png',  label: 'Tus Recompensas',    href: '/register' },
];

// Título con reveal — wrapper overflow:hidden + línea dorada animada
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      {/* Eyebrow */}
      <div
        className="section-eyebrow"
        style={{
          fontSize: 11, fontWeight: 700, color: 'var(--green-primary)',
          letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16,
          opacity: 0,
        }}
      >
        {eyebrow}
      </div>

      {/* Línea dorada que se dibuja */}
      <div
        className="section-gold-line"
        style={{
          width: 48, height: 2,
          background: 'linear-gradient(90deg, #c9a84c, #fbbf24)',
          margin: '0 auto 20px',
          transformOrigin: 'left center',
          scaleX: 0,
        }}
      />

      {/* Título con mask reveal */}
      <div style={{ overflow: 'hidden' }}>
        <h2
          className="section-title-reveal"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.12,
            transform: 'translateY(110%)',
          }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [promos, setPromos]     = useState<Promotion[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const headerRef     = useRef<HTMLElement>(null);
  const imageCardsRef = useRef<HTMLElement>(null);
  const stepsRef      = useRef<HTMLDivElement>(null);
  const levelsRef     = useRef<HTMLDivElement>(null);
  const promosRef     = useRef<HTMLDivElement>(null);
  const ctaRef        = useRef<HTMLElement>(null);
  const ctaBgRef      = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    promotionApi.getPublic().then(setPromos).catch(() => {});
  }, []);

  const goToSlide = useCallback((i: number) => setCurrentSlide(i), []);
  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % heroSlides.length), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length), []);

  useEffect(() => {
    const t = setInterval(nextSlide, 5000);
    return () => clearInterval(t);
  }, [nextSlide]);

  useGSAP(() => {

    // 1. Header slide down
    gsap.from(headerRef.current, { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out' });

    // 2. Hero text stagger
    gsap.from('.hero-slide.active .hero-slide-text > *', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out', delay: 0.3,
    });

    // 3. Image cards scale+fade
    gsap.from('.image-card', {
      scrollTrigger: { trigger: imageCardsRef.current, start: 'top 85%' },
      scale: 0.88, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
    });

    // 4. Steps slide up
    gsap.from('.step-item', {
      scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
      y: 60, opacity: 0, duration: 0.75, stagger: 0.2, ease: 'power3.out',
    });

    // 5. Level cards slide up
    gsap.from('.level-card', {
      scrollTrigger: { trigger: levelsRef.current, start: 'top 80%' },
      y: 50, opacity: 0, duration: 0.75, stagger: 0.18, ease: 'power3.out',
    });

    // 6. Promo cards
    gsap.from('.promo-card', {
      scrollTrigger: { trigger: promosRef.current, start: 'top 82%' },
      y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
    });

    // 7. CTA content
    gsap.from('.cta-content > *', {
      scrollTrigger: { trigger: ctaRef.current, start: 'top 75%' },
      y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
    });

    // 8. CTA parallax
    gsap.to(ctaBgRef.current, {
      scrollTrigger: { trigger: ctaRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
      y: -60, ease: 'none',
    });

    // ── TITLE REVEALS ─────────────────────────────────────────────
    // Para cada bloque de título: eyebrow fade → línea dorada → título slide-up
    gsap.utils.toArray<HTMLElement>('.section-eyebrow').forEach((eyebrow) => {
      const section   = eyebrow.closest('.landing-section, section') as HTMLElement;
      const goldLine  = eyebrow.nextElementSibling as HTMLElement;
      const titleWrap = goldLine?.nextElementSibling as HTMLElement;
      const title     = titleWrap?.querySelector('.section-title-reveal') as HTMLElement;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: eyebrow, start: 'top 82%' },
      });

      // Eyebrow: letter-spacing wide → normal + fade in
      tl.fromTo(eyebrow,
        { opacity: 0, letterSpacing: '0.6em' },
        { opacity: 1, letterSpacing: '0.25em', duration: 0.7, ease: 'power2.out' }
      )
      // Línea dorada se dibuja de izquierda a derecha
      .fromTo(goldLine,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.inOut' },
        '-=0.3'
      )
      // Título sube desde abajo del mask
      .to(title,
        { y: '0%', duration: 0.85, ease: 'power4.out' },
        '-=0.2'
      );
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>

      {/* Header */}
      <header
        ref={headerRef}
        className="landing-header"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 48px', borderBottom: '1px solid var(--border-card)',
          position: 'sticky', top: 0, background: 'rgba(13,11,9,0.96)',
          backdropFilter: 'blur(10px)', zIndex: 100,
        }}
      >
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image.png" alt="el Bodegón" className="landing-logo" style={{ height: 64, width: 'auto', display: 'block', borderRadius: 6 }} />
        </Link>
        <nav className="landing-nav" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cómo funciona</a>
          <a href="#promos" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Promociones</a>
          <Link href="/login"><button className="btn-ghost" style={{ padding: '8px 18px' }}>Ingresar</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ padding: '8px 18px' }}>Unirme al Club</button></Link>
        </nav>
        <div className="landing-nav-mobile" style={{ display: 'none', gap: 8, alignItems: 'center' }}>
          <Link href="/login"><button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>Ingresar</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>Unirme</button></Link>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="hero-slider">
        {heroSlides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
            <img src={slide.image} alt={slide.title} className="hero-slide-img" />
            <div className="hero-slide-overlay">
              <div className="hero-slide-text">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <div className="hero-cta-row" style={{ display: 'flex', gap: 12 }}>
                  <Link href="/register">
                    <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>Registrarme Gratis</button>
                  </Link>
                  <Link href="/login">
                    <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: 15, borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Ya soy miembro</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button className="hero-arrow prev" onClick={prevSlide} aria-label="Anterior">‹</button>
        <button className="hero-arrow next" onClick={nextSlide} aria-label="Siguiente">›</button>
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* 3-Column Image Cards */}
      <section className="image-cards-grid" ref={imageCardsRef}>
        {imageCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="image-card">
              <div className="image-card-bg" style={{ backgroundImage: `url(${card.image})` }} />
              <div className="image-card-overlay" />
              <div className="image-card-label">{card.label}</div>
            </div>
          </Link>
        ))}
      </section>

      {/* Cómo Funciona */}
      <section id="how-it-works" className="landing-section" style={{ padding: '100px 48px', background: 'var(--bg-dark)', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <SectionTitle eyebrow="¿Cómo funciona?" title="Tres Simples Pasos" />

          <div ref={stepsRef} className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { step: '01', title: 'Registrate',  desc: 'Creá tu cuenta gratis en menos de 2 minutos.' },
              { step: '02', title: 'Comé & Ganá', desc: 'Cada consumo suma puntos a tu cuenta automáticamente.' },
              { step: '03', title: 'Canjeá',       desc: 'Usá tus puntos para obtener descuentos y regalos.' },
            ].map((item, i) => (
              <div key={item.step} className="step-item" style={{ padding: '48px 40px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: 'rgba(122,170,138,0.12)', lineHeight: 1, marginBottom: 16 }}>{item.step}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>{item.title}</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 240, margin: '0 auto' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niveles */}
      <section className="landing-section" style={{ padding: '100px 48px', background: 'linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-card) 100%)', borderTop: '1px solid var(--border-card)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          <SectionTitle eyebrow="Niveles" title="Tu Membresía, Tu Nivel" />

          <div ref={levelsRef} className="levels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Bronce', pts: '0 pts',     perks: ['2x puntos en cumpleaños', 'Acceso a promociones básicas'], color: '#b4865a', gradient: 'linear-gradient(135deg, rgba(180,134,90,0.15) 0%, transparent 70%)' },
              { name: 'Plata',  pts: '1,000 pts', perks: ['Todo lo de Bronce', '3x puntos especiales', 'Descuentos exclusivos'], color: '#94a3b8', gradient: 'linear-gradient(135deg, rgba(148,163,184,0.15) 0%, transparent 70%)' },
              { name: 'Oro',    pts: '5,000 pts', perks: ['Todo lo de Plata', '5x puntos', 'Acceso VIP', "Chef's table"], color: '#fbbf24', gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, transparent 70%)' },
            ].map((level) => (
              <div
                key={level.name}
                className="level-card"
                style={{ background: level.gradient, border: `1px solid ${level.color}30`, borderRadius: 8, padding: '40px 32px', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s, border-color 0.3s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = `${level.color}60`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';   (e.currentTarget as HTMLDivElement).style.borderColor = `${level.color}30`; }}
              >
                <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 100, fontWeight: 900, color: `${level.color}08`, textTransform: 'uppercase', lineHeight: 1, pointerEvents: 'none' }}>{level.name}</div>
                <div style={{ width: 4, height: 40, background: level.color, borderRadius: 2, marginBottom: 20 }} />
                <div style={{ fontSize: 26, fontWeight: 900, color: level.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{level.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontWeight: 500 }}>Desde {level.pts}</div>
                {level.perks.map((p) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                    <span style={{ color: level.color, fontSize: 16, fontWeight: 700 }}>→</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promos */}
      {promos.length > 0 && (
        <section id="promos" className="landing-section" style={{ padding: '100px 48px', background: 'var(--bg-dark)', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>

            <SectionTitle eyebrow="Ofertas" title="Promociones de Esta Semana" />

            <div ref={promosRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {promos.slice(0, 3).map((promo) => (
                <div
                  key={promo.id}
                  className="promo-card"
                  style={{ background: 'linear-gradient(135deg, rgba(122,170,138,0.08) 0%, transparent 70%)', border: '1px solid rgba(122,170,138,0.15)', borderRadius: 8, padding: '32px 28px', transition: 'transform 0.3s, border-color 0.3s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(122,170,138,0.35)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';   (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(122,170,138,0.15)'; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 16 }}>🔥</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8, textTransform: 'uppercase' }}>{promo.title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 16, lineHeight: 1.6 }}>{promo.description}</div>
                  <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(122,170,138,0.15)', border: '1px solid rgba(122,170,138,0.28)', borderRadius: 4, color: 'var(--green-primary)', fontWeight: 800, fontSize: 15 }}>
                    {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : promo.discountType === 'FIXED' ? `$${promo.discountValue} OFF` : `${promo.discountValue}x Puntos`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section ref={ctaRef} className="cta-section" style={{ position: 'relative', padding: '120px 48px', textAlign: 'center', overflow: 'hidden' }}>
        <div ref={ctaBgRef} style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/cta_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
        <div className="cta-content" style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: 20 }}>
            ¿Listo para Ganar?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', marginBottom: 40, lineHeight: 1.7 }}>
            Unite al club y empezá a acumular puntos desde tu próxima visita.
          </p>
          <Link href="/register">
            <button className="btn-primary" style={{ padding: '18px 56px', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Registrarme Ahora — Es Gratis
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ padding: '32px 48px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 Club del Bodegón. Todos los derechos reservados.</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacidad', 'Términos', 'Contacto'].map((t) => (
            <a key={t} href="#" style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
