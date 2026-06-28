import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useLenis } from './useLenis.js'
import { Scene } from './three/Scene.jsx'
import { Reveal, MagneticButton, TiltCard, Marquee, AdReel, CinemaReel } from './components.jsx'

const img = (id, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?q=78&w=${w}&auto=format&fit=crop`

const SHOTS = [
  '1542291026-7eec264c27ff',
  '1606107557195-0e29a4b5b4aa',
  '1595950653106-6c9ebd614d3a',
  '1549298916-b41d501d3772',
  '1556906781-9a412961c28c',
  '1600269452121-4f2416e55c28',
  '1605408499391-6368c628ef42',
  '1608231387042-66d1773070a5',
  '1597045566677-8cf032ed6634',
  '1460353581641-37baddab0fa2',
]

/**
 * Where the shoe sits while each section is on screen. Each lane is the OPEN
 * side, opposite that section's cards, so the shoe never hides behind content.
 * x: -left / +right · y: up/down · z+scale: zoom · rotX: tilt up/down
 */
const LANES = {
  hero: { x: 0, y: 0.45, z: 0.6, scale: 4.4, rotX: 0.15, rotZ: -0.08 },
  specs: { x: -2.3, y: 0.1, z: 0.6, scale: 3.2, rotX: -0.22, rotZ: 0.12 }, // cards right → shoe left
  gallery: { x: 2.3, y: 0.1, z: 0.6, scale: 3.2, rotX: 0.22, rotZ: -0.12 }, // cards left → shoe right
  look: { x: 0, y: 0, z: 1.8, scale: 4.8, rotX: 0, rotZ: 0 }, // full-bleed, centred
  buy: { x: -2.3, y: 0, z: 0.9, scale: 3.4, rotX: -0.15, rotZ: 0.1 }, // card right → shoe left
  footer: { x: 0, y: 0.4, z: 0, scale: 3.6, rotX: 0.05, rotZ: 0 },
}

/* On phones the content stacks full-width, so the shoe stays centred (no side
 * lanes) and smaller, sitting behind the frosted cards as a 3D backdrop. */
const MOBILE_LANES = {
  hero: { x: 0, y: 0.5, z: 0.3, scale: 3.0, rotX: 0.12, rotZ: -0.05 },
  specs: { x: -0.5, y: 0.6, z: 0.3, scale: 2.5, rotX: -0.15, rotZ: 0.08 },
  gallery: { x: 0.5, y: 0.6, z: 0.3, scale: 2.5, rotX: 0.15, rotZ: -0.08 },
  look: { x: 0, y: 0, z: 0.8, scale: 3.2, rotX: 0, rotZ: 0 },
  buy: { x: 0, y: 0.3, z: 0.4, scale: 2.7, rotX: -0.1, rotZ: 0.06 },
  footer: { x: 0, y: 0.4, z: 0, scale: 2.6, rotX: 0.05, rotZ: 0 },
}

const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

/* Hook: when a section crosses the CENTRE of the screen, send the shoe to its
 * lane (picking the mobile or desktop lane set by viewport width). The
 * centre-band trigger works for any section height. */
function useLane(setLane, lane) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) setLane((isMobile() ? MOBILE_LANES : LANES)[lane])
  }, [inView, setLane, lane])
  return ref
}

/* ---------------- NAV ---------------- */
function Nav() {
  return (
    <nav className="nav">
      <div className="nav__brand">VELOCE</div>
      <div className="nav__links">
        <a href="#specs">Tech</a>
        <a href="#gallery">Gallery</a>
        <a href="#buy">Buy</a>
      </div>
      <MagneticButton
        className="btn btn--sm"
        onClick={() => document.getElementById('buy')?.scrollIntoView()}
      >
        Reserve
      </MagneticButton>
    </nav>
  )
}

/* ---------------- HERO ---------------- */
function Hero({ setLane }) {
  const ref = useRef(null)
  const laneRef = useLane(setLane, 'hero')
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, -140])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <header className="hero" ref={ref}>
      <div ref={laneRef} className="lane-probe" />
      <motion.div className="hero__kicker" style={{ opacity: fade }}>
        <span className="eyebrow">Drop 001 — Summer ’26</span>
      </motion.div>

      <motion.h1 className="hero__title display" style={{ y, opacity: fade }}>
        <motion.span
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          AIR—9
        </motion.span>
        <motion.span
          className="outline"
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          VELOCE
        </motion.span>
      </motion.h1>

      <motion.p className="hero__sub" style={{ opacity: fade }}>
        Engineered for motion. Designed for legends.<br />A limited run of 999 pairs.
      </motion.p>

      <motion.div className="hero__scroll" style={{ opacity: fade }}>
        Scroll ↓
      </motion.div>
    </header>
  )
}

/* ---------------- MARQUEE ---------------- */
function Strip() {
  return (
    <Marquee
      items={[
        'LIMITED DROP',
        '999 PAIRS',
        'ZEROGRAVITY™ FOAM',
        '210 GRAMS',
        'FREE WORLDWIDE SHIPPING',
        '87% ENERGY RETURN',
      ]}
    />
  )
}

/* ---------------- AD REEL (square, right-aligned, shoe stays left) ----------------
 * A self-playing sneaker "commercial" built from the real photos with
 * cinematic crossfades, Ken Burns motion and animated taglines. */
const AD_SCENES = [
  { img: img(SHOTS[0], 1200), line: 'ENGINEERED FOR MOTION', pan: '-3%' },
  { img: img(SHOTS[3], 1200), line: '210g OF PURE SPEED', pan: '2%' },
  { img: img(SHOTS[5], 1200), line: 'BORN TO RUN', pan: '-2%' },
  { img: img(SHOTS[1], 1200), line: 'AIR—9 · DROP 001', pan: '3%' },
]

function VideoShowcase({ setLane }) {
  const laneRef = useLane(setLane, 'specs')
  return (
    <section className="section wrap" id="specs" ref={laneRef}>
      <div className="section__head section__head--right">
        <Reveal>
          <h2 className="section__title">See them in motion.</h2>
        </Reveal>
      </div>

      <Reveal className="reel-wrap">
        <AdReel scenes={AD_SCENES} interval={2600} />
      </Reveal>
    </section>
  )
}

/* ---------------- GALLERY (left-aligned) ---------------- */
function Gallery({ setLane }) {
  const laneRef = useLane(setLane, 'gallery')
  const { scrollYProgress } = useScroll({ target: laneRef, offset: ['start end', 'end start'] })
  const yA = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const yB = useTransform(scrollYProgress, [0, 1], ['-6%', '10%'])

  return (
    <section className="section wrap" id="gallery" ref={laneRef}>
      <div className="section__head">
        <Reveal><h2 className="section__title">On feet. In the wild.</h2></Reveal>
      </div>

      <div className="gallery">
        <motion.div className="gallery__col" style={{ y: yA }}>
          {[SHOTS[0], SHOTS[2], SHOTS[4], SHOTS[6]].map((id) => (
            <figure className="shot" key={id}>
              <img src={img(id)} alt="VELOCE AIR-9 sneaker" loading="lazy" />
            </figure>
          ))}
        </motion.div>
        <motion.div className="gallery__col gallery__col--offset" style={{ y: yB }}>
          {[SHOTS[1], SHOTS[3], SHOTS[5], SHOTS[7]].map((id) => (
            <figure className="shot" key={id}>
              <img src={img(id)} alt="VELOCE AIR-9 sneaker" loading="lazy" />
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ---------------- LOOKBOOK (Ken Burns "video feel") ----------------
 * The shoe's journey ends at the gallery, so this section (and those below)
 * no longer move the shoe — it stays parked and the full-bleed art covers it. */
const CINEMA_SCENES = [
  { img: img(SHOTS[6], 1400), line: 'EVERY STEP, A STATEMENT', type: 'zoom' },
  { img: img(SHOTS[7], 1400), line: 'OWN THE STREET', type: 'slide' },
  { img: img(SHOTS[2], 1400), line: 'RELENTLESS', type: 'flash' },
  { img: img(SHOTS[9], 1400), line: 'AIR—9 · VELOCE', type: 'fade' },
  { img: img(SHOTS[4], 1400), line: 'BORN TO RUN', type: 'zoom' },
]

function Lookbook({ innerRef }) {
  return (
    <section className="look" ref={innerRef}>
      <div className="look__media" style={{ backgroundImage: `url(${img(SHOTS[8], 1400)})` }} />
      <div className="look__veil" />
      <Reveal className="look__text">
        <p className="eyebrow">Lookbook</p>
        <h2 className="display">BORN TO RUN</h2>
        <p>The street is the track. Every step, a statement.</p>
      </Reveal>
    </section>
  )
}

/* ---------------- FILM + BUY (video rectangle left, reserve card right) ---------------- */
function Buy() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1])

  return (
    <section className="section wrap buy" id="buy" ref={ref}>
      <div className="buy__grid">
        <div className="buy__media">
          <Reveal><p className="eyebrow">The Film · 03</p></Reveal>
          <Reveal delay={0.08}>
            <h2 className="buy__mediaTitle display">See it move.</h2>
          </Reveal>
          <motion.div className="film__frame" style={{ scale, opacity }}>
            <CinemaReel scenes={CINEMA_SCENES} interval={2000} />
          </motion.div>
        </div>

        <Reveal className="buy__card">
          <TiltCard className="buy__inner">
            <div className="buy__img" style={{ backgroundImage: `url(${img(SHOTS[3], 1000)})` }} />
            <div className="buy__body">
              <p className="eyebrow">The Drop · 26.06</p>
              <h2 className="display">OWN THE AIR—9</h2>
              <p className="buy__desc">
                999 numbered pairs. Each with a certificate of authenticity and
                lifetime sole-care. Free worldwide shipping.
              </p>
              <div className="buy__price">
                <span>From <b>$240</b></span>
                <span className="buy__stock">● 312 left</span>
              </div>
              <div className="buy__actions">
                <MagneticButton className="btn btn--accent">Reserve your pair →</MagneticButton>
                <MagneticButton className="btn btn--ghost">Size guide</MagneticButton>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer wrap">
      <div className="footer__brand display">VELOCE</div>
      <div className="footer__cols">
        <span>© {new Date().getFullYear()} VELOCE</span>
        <span>Instagram · TikTok · X</span>
      </div>
    </footer>
  )
}

export default function App() {
  useLenis()
  const target = useRef({ ...(isMobile() ? MOBILE_LANES : LANES).hero })
  const setLane = useCallback((lane) => {
    target.current = lane
  }, [])

  // Fade the whole 3D layer out once "Born to Run" starts covering the shoe,
  // and fade it back in if the user scrolls up to the gallery again.
  const lookRef = useRef(null)
  const { scrollYProgress: lookProgress } = useScroll({
    target: lookRef,
    offset: ['start end', 'start start'],
  })
  // Hide the shoe once the Lookbook poster is actually covering its centre, and
  // do it as a fast cut (see .stage--hidden) so it never lingers as a
  // translucent ghost in open view. Reappears smoothly on scroll-up.
  const [shoeHidden, setShoeHidden] = useState(false)
  useEffect(
    () => lookProgress.on('change', (v) => setShoeHidden(v > 0.5)),
    [lookProgress]
  )

  // Keep the 3D layer invisible until the model + HDR are fully loaded, then
  // fade it in smoothly — no dark→light flash on first paint.
  const [ready, setReady] = useState(false)
  const handleReady = useCallback(() => setReady(true), [])

  return (
    <>
      <div
        className={`stage${ready ? '' : ' stage--loading'}${
          shoeHidden ? ' stage--hidden' : ''
        }`}
      >
        <Scene target={target} active={!shoeHidden} onReady={handleReady} />
      </div>
      <div className="bg-glow" />

      <main className="content">
        <Nav />
        <Hero setLane={setLane} />
        <Strip />
        <VideoShowcase setLane={setLane} />
        <Gallery setLane={setLane} />
        <Lookbook innerRef={lookRef} />
        <Buy />
        <Footer />
      </main>
    </>
  )
}
