import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUp, Feather, Sparkles, Star } from 'lucide-react';
import { ELAINA_ASSETS } from './data/elainaAssets';

// Shared editorial easing inspired by the reference project's slower entrances.
const ease = [0.22, 1, 0.36, 1] as const;
const imageEase = [0.4, 0, 0.2, 1] as const;
const animationDuration = (seconds: number) => seconds * 0.9;
const revealDurations = {
  text: animationDuration(0.74727),
  image: animationDuration(1.0586325),
  bubble: animationDuration(0.7099065),
  ornament: animationDuration(0.57913425),
} as const;
const entrance = { eyebrow: 0.25, heading: 0.55, supporting: 0.9, image: 0.95, link: 1.2, ornament: 1.45 } as const;
const StoryStartedContext = createContext(false);
const sections = [
  { id: 'home', label: 'Home' },
  { id: 'elaina', label: 'Elaina' },
  { id: 'journey', label: 'Journey' },
  { id: 'letter', label: 'Letter' },
  { id: 'finale', label: 'Finale' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

type RevealTechnique = 'default' | 'mask' | 'eyebrow';

function Reveal({ children, className = '', delay = 0, from = 'up', kind = 'text', technique = 'default' }: { children: ReactNode; className?: string; delay?: number; from?: 'left' | 'right' | 'up' | 'down' | 'right-down'; kind?: 'text' | 'image' | 'bubble' | 'ornament'; technique?: RevealTechnique }) {
  const storyStarted = useContext(StoryStartedContext);
  const revealRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = revealRef.current;
    if (!storyStarted || isInView || !element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [storyStarted, isInView]);
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const distance = compact ? 24 : Math.min(52, Math.max(40, window.innerWidth * 0.035));
  const offset = from === 'left' ? { x: -distance } : from === 'right' ? { x: distance } : from === 'right-down' ? { x: distance * 0.55, y: distance * 0.28 } : from === 'down' ? { y: -16 } : { y: kind === 'image' ? 16 : 12 };
  const initial = technique === 'mask'
    ? { opacity: 0, y: 12 }
    : technique === 'eyebrow'
      ? { opacity: 0, x: -16, letterSpacing: '.24em' }
      : kind === 'image' ? { opacity: 0, ...offset, scale: 0.97 } : kind === 'bubble' ? { opacity: 0, ...offset, scale: 0.95 } : kind === 'ornament' ? { opacity: 0, ...offset, scale: 0.82, rotate: -8 } : { opacity: 0, ...offset };
  const visible = technique === 'mask'
    ? { opacity: 1, x: 0, y: 0 }
    : technique === 'eyebrow'
      ? { opacity: 1, x: 0, letterSpacing: '.19em' }
      : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };
  return (
    <motion.div
      className={`${className} motion-${technique}`.trim()}
      data-reveal=""
      ref={revealRef}
      initial={initial}
      animate={isInView ? visible : initial}
      transition={{ duration: revealDurations[kind], delay, ease: kind === 'image' ? imageEase : ease }}
    >
      {technique === 'mask' ? (
        <motion.div
          className="motion-mask-window"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={isInView ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: revealDurations[kind], delay, ease }}
        >
          {children}
        </motion.div>
      ) : children}
    </motion.div>
  );
}

function SectionAtmosphere({ variant }: { variant: 'hero' | 'profile' | 'journey' | 'letter' | 'finale' }) {
  const storyStarted = useContext(StoryStartedContext);
  const atmosphereRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = atmosphereRef.current;
    if (!storyStarted || isInView || !element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [storyStarted, isInView]);
  return (
    <motion.div
      className={`section-atmosphere section-atmosphere-${variant}`}
      data-section-atmosphere=""
      aria-hidden="true"
      ref={atmosphereRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: revealDurations.ornament, delay: 0.85, ease: imageEase }}
    />
  );
}

function SectionDoodles({ variant }: { variant: 'hero' | 'profile' | 'journey' | 'letter' | 'finale' }) {
  const storyStarted = useContext(StoryStartedContext);
  const doodlesRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const element = doodlesRef.current;
    if (!storyStarted || isInView || !element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [storyStarted, isInView]);

  return (
    <motion.div
      ref={doodlesRef}
      className={`section-doodles section-doodles-${variant}`}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: revealDurations.ornament, delay: 0.85, ease: imageEase }}
    >
      <span className="doodle-slashes doodle-slashes-a" />
      <span className="doodle-slashes doodle-slashes-b" />
      <span className="doodle-star doodle-star-a">✣</span>
      <span className="doodle-star doodle-star-b">✦</span>
      <span className="doodle-cross" />
      <span className="doodle-dots" />
      <svg className="doodle-hexes" viewBox="0 0 100 100">
        <polygon points="28,5 48,16 48,39 28,50 8,39 8,16" />
        <polygon points="68,35 88,46 88,69 68,80 48,69 48,46" />
        <polygon points="28,61 42,69 42,85 28,93 14,85 14,69" />
      </svg>
      <svg className="doodle-orbit" viewBox="0 0 140 100">
        <path d="M8 60C24 17 91 8 127 34c24 18 5 48-28 51C58 89 28 74 35 50c5-17 32-24 54-18" />
        <circle cx="9" cy="60" r="2" /><circle cx="127" cy="34" r="2" />
      </svg>
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

function ProfileGfxArtwork() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start end', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const characterY = useTransform(scrollYProgress, [0, 1], [7, -7]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  return (
    <div ref={sceneRef} className="profile-gfx-scene">
      <motion.div className="profile-gfx-depth" style={{ y: backgroundY }} aria-hidden="true">
        <span className="profile-gfx-halo" />
        <span className="profile-gfx-slab profile-gfx-slab-a" />
        <span className="profile-gfx-slab profile-gfx-slab-b" />
        <span className="profile-gfx-slab profile-gfx-slab-c" />
        <span className="profile-gfx-slab profile-gfx-slab-d" />
        <span className="profile-gfx-facet profile-gfx-facet-a" />
        <span className="profile-gfx-facet profile-gfx-facet-b" />
        <span className="profile-gfx-orbit" />
      </motion.div>
      <motion.div className="profile-gfx-character" style={{ y: characterY }}>
        <Artwork name="profile" alt="Elaina profile illustration" className="profile-art" />
      </motion.div>
      <motion.div className="profile-gfx-foreground" style={{ y: foregroundY }} aria-hidden="true">
        <span className="profile-gfx-light-point profile-gfx-light-point-a" />
        <span className="profile-gfx-light-point profile-gfx-light-point-b" />
        <span className="profile-gfx-index"><b>02</b><span>TRAVELER<br />PROFILE</span></span>
        <span className="profile-gfx-callout"><i /><span>ELAINA · THE ASHEN WITCH</span></span>
      </motion.div>
      <span className="art-note">A portrait for the story</span>
    </div>
  );
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
      <button className="nav-mark" type="button" onClick={() => { onNavigate('home'); scrollToSection('home'); }} aria-label="Elaina birthday home"><Sparkles size={16} /><span>BACK TO TRAVELER</span></button>
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
      <SectionAtmosphere variant="hero" />
      <SectionDoodles variant="hero" />
      <motion.div className="hero-glow" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: entered ? 1 : 0 }} transition={{ duration: revealDurations.ornament, delay: 0.85, ease: imageEase }} />
      <div className="hero-copy">
        <motion.div className="motion-eyebrow" data-reveal="" initial={{ opacity: 0, x: -16, letterSpacing: '.24em' }} animate={entered ? { opacity: 1, x: 0, letterSpacing: '.19em' } : { opacity: 0, x: -16, letterSpacing: '.24em' }} transition={{ duration: revealDurations.text, delay: entrance.eyebrow, ease }}>
          <SectionLabel>A little birthday story</SectionLabel>
        </motion.div>
        <motion.h1 data-reveal="" initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={entered ? { opacity: 1, clipPath: 'inset(0 0 0% 0)' } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: revealDurations.text, delay: entrance.heading, ease }}>
          Happy Birthday,<br /><em>Elaina.</em>
        </motion.h1>
        <motion.p className="hero-subtitle" data-reveal="" initial={{ opacity: 0, x: 40 }} animate={entered ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }} transition={{ duration: revealDurations.text, delay: entrance.supporting, ease }}>
          For the witch who once dreamed of distant lands<br className="desktop-break" /> and turned the pages of a book into a life of her own.
        </motion.p>
        <motion.button type="button" className="text-link" data-reveal="" onClick={() => scrollToSection('elaina')} initial={{ opacity: 0, y: 25 }} animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }} transition={{ duration: revealDurations.text, delay: entrance.link, ease }}>
          Step into her story <ArrowRight size={16} />
        </motion.button>
      </div>
      <motion.div className="hero-art-wrap" data-reveal="" initial={{ opacity: 0, x: window.matchMedia('(max-width: 760px)').matches ? 24 : 50, scale: 0.97 }} animate={entered ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: window.matchMedia('(max-width: 760px)').matches ? 24 : 50, scale: 0.97 }} transition={{ duration: revealDurations.image, delay: entrance.image, ease: imageEase }}>
        <Artwork name="hero" alt="Elaina birthday hero illustration" className="hero-art" />
      <motion.div className="hero-bubble" data-reveal="" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={entered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.96 }} transition={{ duration: revealDurations.bubble, delay: entrance.ornament, ease }}>
          <SpeechBubble>“Today, even the wind feels a little kinder.”</SpeechBubble>
        </motion.div>
        <motion.span className="hero-sparkle sparkle-one" initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={entered ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }} transition={{ duration: revealDurations.ornament, delay: 1.12 }}><Star size={17} /></motion.span>
        <motion.span className="hero-sparkle sparkle-two" initial={{ opacity: 0, scale: 0.8, rotate: 8 }} animate={entered ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }} transition={{ duration: revealDurations.ornament, delay: 1.28 }}><Sparkles size={20} /></motion.span>
      </motion.div>
      <motion.button
        className="scroll-cue"
        data-reveal=""
        type="button"
        onClick={() => scrollToSection('elaina')}
        initial={{ opacity: 0, y: 12 }}
        animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: revealDurations.ornament, delay: entrance.ornament, ease }}
      ><span>Scroll to wander</span><ArrowDown size={15} /></motion.button>
      <span className="hero-index" aria-hidden="true">01 / 05</span>
    </section>
  );
}

function MeetElaina() {
  return (
    <section id="elaina" data-scroll-layer="0.5" className="profile-section story-section">
      <SectionAtmosphere variant="profile" />
      <SectionDoodles variant="profile" />
      <Reveal className="profile-art-column profile-art-column-gfx" from="left" kind="image" delay={entrance.image}><ProfileGfxArtwork /></Reveal>
      <div className="profile-copy">
        <Reveal technique="eyebrow" delay={entrance.eyebrow}><SectionLabel>The traveler</SectionLabel></Reveal>
        <Reveal technique="mask" delay={entrance.heading}><h2>Meet <em>Elaina</em></h2><p className="eyebrow">The Ashen Witch</p></Reveal>
        <Reveal delay={entrance.supporting} from="right"><p className="body-copy">Once inspired by the adventures she read as a child, Elaina set out to see the world for herself.</p></Reveal>
        <Reveal delay={entrance.link} from="right"><p className="body-copy">Curious, clever, and never short of an opinion, she travels from one country to the next, finding unexpected encounters and little moments worth remembering.</p></Reveal>
        <Reveal className="profile-footnote" delay={entrance.ornament} kind="ornament"><span>✳</span><span>A life written one destination at a time.</span></Reveal>
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
      <SectionAtmosphere variant="journey" />
      <SectionDoodles variant="journey" />
      <div className="section-heading">
        <Reveal technique="eyebrow" delay={entrance.eyebrow}><SectionLabel>Postcards from afar</SectionLabel></Reveal>
        <Reveal technique="mask" delay={entrance.heading}><h2>A witch's <em>journey</em></h2></Reveal>
        <Reveal delay={entrance.supporting}><p>Two little glimpses of a world beyond the horizon.</p></Reveal>
      </div>
      <div className="journey-route" aria-hidden="true"><span /><i /><span /></div>
      <div className="chapter-grid">
        {chapters.map((chapter, index) => <div key={chapter.number} className={`chapter chapter-${index + 1}`}>
          <Reveal className="chapter-art-reveal" delay={0.5 + index * 0.18} from={index === 0 ? 'right' : 'right-down'} kind="image">
            <div className="chapter-photo-canvas">
              <Artwork name={chapter.art} alt={chapter.alt} className="chapter-art" />
              <div className="chapter-photo-mark" aria-hidden="true">
                <span>TRAVEL MEMORY</span>
                <i>{String(index + 1).padStart(2, '0')} / 02</i>
              </div>
            </div>
          </Reveal>
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
      <SectionAtmosphere variant="letter" />
      <SectionDoodles variant="letter" />
      <div className="letter-copy"><Reveal technique="eyebrow" delay={entrance.eyebrow}><SectionLabel>A note, just for you</SectionLabel></Reveal><Reveal technique="mask" delay={entrance.heading}><h2>A letter for <em>Elaina</em></h2></Reveal>
        <div className="letter-text">
          <Reveal delay={0.82} from="right"><p>Dear Elaina,</p></Reveal>
          <Reveal delay={0.94} from="right"><p>On your birthday, I hope the world gives you a little of the wonder you've spent your life searching for.</p></Reveal>
          <Reveal delay={1.06} from="right"><p>May the roads ahead bring beautiful skies, kind strangers, unexpected magic, and plenty of little moments that make you glad you kept wandering.</p></Reveal>
          <Reveal delay={1.18} from="right"><p>And on a day like this, even a traveler who is always in a hurry deserves a moment to stop, smile, and celebrate.</p></Reveal>
          <Reveal delay={1.3} from="right"><p>Happy birthday, Elaina. May there always be another wonderful page waiting for you.</p></Reveal>
          <Reveal delay={1.42} from="right"><p className="letter-signoff">With affection,<br /><span>Kagenou</span></p></Reveal>
        </div>
        <Reveal className="edit-hint" delay={0.28} kind="ornament"><Feather size={13} /> A little birthday wish, sent from afar.</Reveal>
      </div>
      <div className="letter-art-column"><Reveal className="letter-art-reveal" delay={entrance.image} from="left" kind="image"><Artwork name="letter" alt="Elaina letter section illustration" className="letter-art" /></Reveal><Reveal className="letter-bubble" delay={1.45} kind="bubble"><SpeechBubble>“I'll carry your kind words with me.”</SpeechBubble></Reveal></div>
      <span className="section-number">04 / 05</span>
    </section>
  );
}

function Finale() {
  return (
    <section id="finale" data-scroll-layer="0.25" className="finale-section story-section">
      <SectionAtmosphere variant="finale" />
      <SectionDoodles variant="finale" />
      <div className="finale-copy">
        <Reveal technique="eyebrow" delay={entrance.eyebrow}><SectionLabel>Until the next story</SectionLabel></Reveal>
        <Reveal technique="mask" delay={entrance.heading}><h2>May your next year<br />be <em>full of wonder.</em></h2></Reveal>
        <Reveal className="finale-message" delay={entrance.supporting}><p>Happy birthday, Elaina.</p><p>May the next chapter bring you new places to discover, stories worth keeping, and a little magic in the ordinary moments along the way.</p></Reveal>
      </div>
      <Reveal className="finale-art-wrap" from="right" kind="image" delay={0.5}>
        <div className="finale-gfx-slashes" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <Artwork name="finale" alt="Elaina birthday finale illustration" className="finale-art" />
        <Reveal className="finale-star finale-star-a" delay={0.85} kind="ornament"><span>✧</span></Reveal><Reveal className="finale-star finale-star-b" delay={1} kind="ornament"><span>✳</span></Reveal><Reveal className="finale-star finale-star-c" delay={1.15} kind="ornament"><span>✧</span></Reveal>
      </Reveal>
      <footer className="site-footer"><span>A birthday gift made with affection by Kagenou · October 17</span><button type="button" onClick={() => scrollToSection('home')}>Back to the beginning ↑</button></footer>
      <span className="section-number">05 / 05</span>
    </section>
  );
}

function SplashScreen({ onEnter }: { onEnter: () => void }) {
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
      <motion.div className="splash-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: animationDuration(1), ease }}>
        <motion.h1 id="splash-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: animationDuration(.9), ease }}>Elaina</motion.h1>
      </motion.div>
      <span className="splash-swipe-hint" aria-hidden="true"><ArrowUp size={23} /></span>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [heroEntered, setHeroEntered] = useState(false);
  const birthdaySongRef = useRef<HTMLAudioElement>(null);
  useVelocityParallax(!showSplash);
  const enterStory = () => {
    void birthdaySongRef.current?.play().catch((error: unknown) => {
      console.warn('Birthday song could not start:', error);
    });
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
    <StoryStartedContext.Provider value={heroEntered}>
    <main className="birthday-page">
      <audio ref={birthdaySongRef} src="/assets/somebody.mp3" loop preload="none" />
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
            transition={{ duration: animationDuration(1), ease: [0.76, 0, 0.24, 1] }}
          >
            <SplashScreen onEnter={enterStory} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </StoryStartedContext.Provider>
  );
}
