import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, Feather, Sparkles, Star } from 'lucide-react';
import { ELAINA_ASSETS } from './data/elainaAssets';

// Shared editorial easing inspired by the reference project's slower entrances.
const ease = [0.22, 1, 0.36, 1] as const;
const imageEase = [0.4, 0, 0.2, 1] as const;
const sections = [
  { id: 'home', label: 'Home' },
  { id: 'elaina', label: 'Elaina' },
  { id: 'journey', label: 'Journey' },
  { id: 'letter', label: 'Letter' },
  { id: 'finale', label: 'Finale' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
}

function Reveal({ children, className = '', delay = 0, from = 'up', kind = 'text' }: { children: ReactNode; className?: string; delay?: number; from?: 'left' | 'right' | 'up' | 'down' | 'right-down'; kind?: 'text' | 'image' | 'bubble' | 'ornament' }) {
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const distance = compact ? 24 : Math.min(52, Math.max(40, window.innerWidth * 0.035));
  const offset = from === 'left' ? { x: -distance } : from === 'right' ? { x: distance } : from === 'right-down' ? { x: distance * 0.55, y: distance * 0.28 } : from === 'down' ? { y: -16 } : { y: kind === 'image' ? 16 : 12 };
  const initial = kind === 'image' ? { opacity: 0, ...offset, scale: 0.97 } : kind === 'bubble' ? { opacity: 0, ...offset, scale: 0.95 } : kind === 'ornament' ? { opacity: 0, ...offset, scale: 0.82, rotate: -8 } : { opacity: 0, ...offset };
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: kind === 'image' ? 1.0586325 : kind === 'bubble' ? 0.7099065 : kind === 'ornament' ? 0.57913425 : 0.74727, delay, ease: kind === 'image' ? imageEase : ease }}
    >
      {children}
    </motion.div>
  );
}

function Artwork({ name, alt, className = '' }: { name: keyof typeof ELAINA_ASSETS; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = ELAINA_ASSETS[name];
  return (
    <div className={`artwork ${className}`}>
      {!failed && src ? (
        <img src={src} alt={alt} loading={name === 'hero' ? 'eager' : 'lazy'} fetchPriority={name === 'hero' ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />
      ) : (
        <div className="artwork-placeholder" role="img" aria-label={`${name} illustration placeholder; Elaina PNG not supplied`}>
          <div className="placeholder-sky"><span /><span /><span /></div>
          <div className="placeholder-sun" />
          <div className="placeholder-hill placeholder-hill-back" />
          <div className="placeholder-hill placeholder-hill-front" />
          <div className="placeholder-caption"><Sparkles size={14} /> Illustration slot · PNG needed</div>
        </div>
      )}
    </div>
  );
}

function SpeechBubble({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`speech-bubble ${className}`}><span className="fan-made">Fan-made message</span>{children}</div>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label"><span />{children}</p>;
}

function Navbar() {
  const [active, setActive] = useState('home');
  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const marker = window.innerHeight * 0.4;
      const current = sections
        .map(({ id }) => document.getElementById(id))
        .find((section) => {
          if (!section) return false;
          const bounds = section.getBoundingClientRect();
          return bounds.top <= marker && bounds.bottom > marker;
        });
      if (current) setActive((previous) => previous === current.id ? previous : current.id);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  const onNavigate = (id: string) => setActive(id);
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <button className="nav-mark" type="button" onClick={() => { onNavigate('home'); scrollToSection('home'); }} aria-label="Elaina birthday home"><Sparkles size={16} /><span>MAJO NO TABITABI</span></button>
      <div className="nav-links">
        {sections.map((section) => <button key={section.id} type="button" className={active === section.id ? 'active' : ''} aria-controls={section.id} onClick={() => { onNavigate(section.id); scrollToSection(section.id); }}>{section.label}</button>)}
      </div>
    </nav>
  );
}

// A tiny velocity parallax on marked sections, without changing native scrolling.
function useVelocityParallax(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-layer]'));
    const depths = layers.map((layer) => Number(layer.dataset.scrollLayer) || 1);
    const original = layers.map((layer) => layer.style.transform);
    let previousY = window.scrollY;
    let previousTime = performance.now();
    let velocity = 0;
    let frame = 0;
    const update = (time: number) => {
      frame = 0;
      const elapsed = Math.max(time - previousTime, 1);
      previousTime = time;
      velocity *= Math.exp(-elapsed / 115);
      const offset = Math.max(-8, Math.min(8, -velocity * 1.25));
      layers.forEach((layer, index) => {
        layer.style.transform = `translate3d(0, ${offset * depths[index]}px, 0)`;
      });
      if (Math.abs(velocity) > 0.015) frame = requestAnimationFrame(update);
    };
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      velocity = (y - previousY) / Math.max(now - previousTime, 1);
      previousY = y;
      if (!frame) frame = requestAnimationFrame(update);
    };
    layers.forEach((layer) => { layer.style.willChange = 'transform'; });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      layers.forEach((layer, index) => {
        layer.style.transform = original[index];
        layer.style.willChange = '';
      });
    };
  }, [enabled]);
}

function Hero({ entered }: { entered: boolean }) {
  return (
      <section id="home" data-scroll-layer="0.25" className={`hero-section story-section ${entered ? 'is-entered' : ''}`}>
      <motion.div className="hero-glow" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: entered ? 1 : 0 }} transition={{ duration: 1.40113125 }} />
      <div className="hero-copy">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 1.120905, delay: 0.25, ease }}>
          <SectionLabel>A little birthday story</SectionLabel>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 50, scale: 0.88 }} animate={entered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.88 }} transition={{ duration: 1.261018125, delay: 0.55, ease }}>
          Happy Birthday,<br /><em>Elaina.</em>
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ opacity: 0, x: 40 }} animate={entered ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }} transition={{ duration: 1.1799, delay: 0.9, ease }}>
          For the witch who once dreamed of distant lands<br className="desktop-break" /> and turned the pages of a book into a life of her own.
        </motion.p>
        <motion.button type="button" className="text-link" onClick={() => scrollToSection('elaina')} initial={{ opacity: 0, y: 25 }} animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }} transition={{ duration: 1.02749625, delay: 1.2, ease }}>
          Step into her story <ArrowRight size={16} />
        </motion.button>
      </div>
      <motion.div className="hero-art-wrap" initial={{ opacity: 0, x: window.matchMedia('(max-width: 760px)').matches ? 24 : 50, scale: 0.97 }} animate={entered ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: window.matchMedia('(max-width: 760px)').matches ? 24 : 50, scale: 0.97 }} transition={{ duration: 1.146851875, delay: 0.95, ease: imageEase }}>
        <Artwork name="hero" alt="Elaina birthday hero illustration" className="hero-art" />
        <motion.div className="hero-bubble" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={entered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.96 }} transition={{ duration: 0.7099065, delay: 1.45, ease }}>
          <SpeechBubble>“Today, even the wind feels a little kinder.”</SpeechBubble>
        </motion.div>
        <motion.span className="hero-sparkle sparkle-one" initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={entered ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }} transition={{ duration: 0.57913425, delay: 1.12 }}><Star size={17} /></motion.span>
        <motion.span className="hero-sparkle sparkle-two" initial={{ opacity: 0, scale: 0.8, rotate: 8 }} animate={entered ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }} transition={{ duration: 0.609615, delay: 1.28 }}><Sparkles size={20} /></motion.span>
      </motion.div>
      <button className="scroll-cue" type="button" onClick={() => scrollToSection('elaina')}><span>Scroll to wander</span><ArrowDown size={15} /></button>
      <span className="hero-index" aria-hidden="true">01 / 05</span>
    </section>
  );
}

function MeetElaina() {
  return (
    <section id="elaina" data-scroll-layer="0.5" className="profile-section story-section">
      <Reveal className="profile-art-column" from="left" kind="image" delay={0.5}><Artwork name="profile" alt="Elaina profile illustration" className="profile-art" /><span className="art-note">A portrait for the story</span></Reveal>
      <div className="profile-copy">
        <Reveal delay={0}><SectionLabel>The traveler</SectionLabel></Reveal>
        <Reveal delay={0.06}><h2>Meet <em>Elaina</em></h2><p className="eyebrow">The Ashen Witch</p></Reveal>
        <Reveal delay={0.13}><p className="body-copy">Once inspired by the adventures she read as a child, Elaina set out to see the world for herself.</p></Reveal>
        <Reveal delay={0.2}><p className="body-copy">Curious, clever, and never short of an opinion, she travels from one country to the next, finding unexpected encounters and little moments worth remembering.</p></Reveal>
        <Reveal className="profile-footnote" delay={0.28} kind="ornament"><span>✳</span><span>A life written one destination at a time.</span></Reveal>
      </div>
      <span className="section-number">02 / 05</span>
    </section>
  );
}

const chapters = [
  { number: 'I', title: 'The open road', text: 'Every adventure begins with a little curiosity.', art: 'journeyOne' as const, alt: 'Elaina on the open road' },
  { number: 'II', title: 'Somewhere new', text: 'A different place, a different perspective, and another tale to take home.', art: 'journeyTwo' as const, alt: 'Elaina discovering a new place' },
];

function Journey() {
  return (
    <section id="journey" data-scroll-layer="0.75" className="journey-section story-section">
      <Reveal className="section-heading"><SectionLabel>Postcards from afar</SectionLabel><h2>A witch's <em>journey</em></h2><p>Two little glimpses of a world beyond the horizon.</p></Reveal>
      <div className="journey-route" aria-hidden="true"><span /><i /><span /></div>
      <div className="chapter-grid">
        {chapters.map((chapter, index) => <div key={chapter.number} className={`chapter chapter-${index + 1}`}>
          <Reveal className="chapter-art-reveal" delay={0.5 + index * 0.18} from={index === 0 ? 'right' : 'right-down'} kind="image"><Artwork name={chapter.art} alt={chapter.alt} className="chapter-art" /></Reveal>
          <Reveal className="chapter-caption" delay={0.88 + index * 0.18}><span className="chapter-number">{chapter.number}</span><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div><Reveal className="chapter-star" delay={0.32 + index * 0.16} kind="ornament"><span>✳</span></Reveal></Reveal>
        </div>)}
      </div>
      <span className="section-number">03 / 05</span>
    </section>
  );
}

function Letter() {
  return (
    <section id="letter" data-scroll-layer="0.5" className="letter-section story-section">
      <div className="letter-copy"><Reveal><SectionLabel>A note, just for you</SectionLabel></Reveal><Reveal delay={0.06}><h2>A letter for <em>Elaina</em></h2></Reveal>
        <Reveal className="letter-content-reveal" delay={0.12} from="right">
        <div className="letter-text">
          <p>Dear Elaina,</p>
          <p>On your birthday, I hope the world gives you a little of the wonder you've spent your life searching for.</p>
          <p>May the roads ahead bring beautiful skies, kind strangers, unexpected magic, and plenty of little moments that make you glad you kept wandering.</p>
          <p>And on a day like this, even a traveler who is always in a hurry deserves a moment to stop, smile, and celebrate.</p>
          <p>Happy birthday, Elaina. May there always be another wonderful page waiting for you.</p>
          <p className="letter-signoff">With affection,<br /><span>Kagenou</span></p>
        </div>
        </Reveal>
        <Reveal className="edit-hint" delay={0.28} kind="ornament"><Feather size={13} /> A little birthday wish, sent from afar.</Reveal>
      </div>
      <div className="letter-art-column"><Reveal className="letter-art-reveal" delay={0.5} from="left" kind="image"><Artwork name="letter" alt="Elaina letter section illustration" className="letter-art" /></Reveal><Reveal className="letter-bubble" delay={1.02} kind="bubble"><SpeechBubble>“I'll carry your kind words with me.”</SpeechBubble></Reveal></div>
      <span className="section-number">04 / 05</span>
    </section>
  );
}

function Finale() {
  return (
    <section id="finale" data-scroll-layer="0.25" className="finale-section story-section">
      <div className="finale-wash" aria-hidden="true" />
      <div className="finale-copy">
        <Reveal><SectionLabel>Until the next story</SectionLabel></Reveal>
        <Reveal delay={0.06}><h2>May your next year<br />be <em>full of wonder.</em></h2></Reveal>
        <Reveal className="finale-message" delay={0.14}><p>Happy birthday, Elaina.</p><p>May the next chapter bring you new places to discover, stories worth keeping, and a little magic in the ordinary moments along the way.</p></Reveal>
      </div>
      <Reveal className="finale-art-wrap" from="right" kind="image" delay={0.5}>
        <Artwork name="finale" alt="Elaina birthday finale illustration" className="finale-art" />
        <Reveal className="finale-star finale-star-a" delay={0.85} kind="ornament"><span>✧</span></Reveal><Reveal className="finale-star finale-star-b" delay={1} kind="ornament"><span>✳</span></Reveal><Reveal className="finale-star finale-star-c" delay={1.15} kind="ornament"><span>✧</span></Reveal>
      </Reveal>
      <footer className="site-footer"><span>A birthday gift made with affection by Kagenou · October 17</span><button type="button" onClick={() => scrollToSection('home')}>Back to the beginning ↑</button></footer>
      <span className="section-number">05 / 05</span>
    </section>
  );
}

function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const reducedMotion = useReducedMotion();
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowPowerDevice = navigator.hardwareConcurrency <= 4 || (deviceMemory !== undefined && deviceMemory <= 4);
  const pointerStartY = useRef<number | null>(null);
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStartY.current;
    pointerStartY.current = null;
    if (start !== null && start - event.clientY > 72) onEnter();
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartY.current = event.clientY;
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowUp') {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <div
      className={`splash-screen${lowPowerDevice ? ' splash-lite' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Swipe up to enter Elaina's birthday story"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStartY.current = null; }}
      onKeyDown={handleKeyDown}
    >
      <div className="splash-orbit splash-orbit-one" aria-hidden="true" />
      <div className="splash-orbit splash-orbit-two" aria-hidden="true" />
      <motion.div className="splash-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease }}>
        <motion.div className="splash-icon-row" aria-hidden="true" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: .25 } } }}>
          {[Sparkles, Feather, Star].map((Icon, index) => <motion.div key={index} className="splash-icon" variants={{ hidden: { opacity: 0, scale: .5, y: 40 }, visible: { opacity: 1, scale: 1, y: 0 } }} transition={{ duration: 1.2, ease }} animate={reducedMotion || lowPowerDevice ? undefined : { y: [0, -6, 0] }}><Icon size={20} strokeWidth={1.35} /></motion.div>)}
        </motion.div>
        <div className="splash-heading">
          <motion.span className="splash-kicker" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .9, duration: 1.2, ease }}>A little birthday story</motion.span>
          <motion.h1 id="splash-title" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1.2, ease }}>Elaina</motion.h1>
        </div>
        <motion.div className="splash-title-card" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 1.2, ease }}>The Ashen Witch</motion.div>
        <span className="splash-rule" aria-hidden="true"><i /><i /><i /></span>
        <p className="splash-invitation">A little world, made for the witch who never stopped chasing the horizon.</p>
      </motion.div>
      <span className="splash-swipe-hint" aria-hidden="true"><ArrowUp size={16} /> SWIPE UP TO BEGIN</span>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [heroEntered, setHeroEntered] = useState(false);
  useVelocityParallax(!showSplash);
  const enterStory = () => {
    setShowSplash(false);
  };
  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    if (showSplash) body.style.overflow = 'hidden';
    return () => { body.style.overflow = previousOverflow; };
  }, [showSplash]);
  useEffect(() => {
    const preventPageSelectAll = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'a') return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select'))) return;
      event.preventDefault();
    };
    document.addEventListener('keydown', preventPageSelectAll, true);
    return () => document.removeEventListener('keydown', preventPageSelectAll, true);
  }, []);

  return (
    <main className="birthday-page">
      <Navbar />
      <Hero entered={heroEntered} />
      <MeetElaina />
      <Journey />
      <Letter />
      <Finale />
      <AnimatePresence onExitComplete={() => setHeroEntered(true)}>
        {showSplash && (
          <motion.div
            className="splash-transition"
            initial={{ y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          >
            <SplashScreen onEnter={enterStory} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
