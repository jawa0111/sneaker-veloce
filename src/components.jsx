import { useRef, useState, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/* Fade / slide in when scrolled into view */
export function Reveal({ children, delay = 0, y = 40, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* Button that's magnetically pulled toward the cursor (Framer Motion springs) */
export function MagneticButton({ children, className = 'btn', ...props }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18 })
  const y = useSpring(my, { stiffness: 220, damping: 18 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.35)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.96 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/* Card that tilts in 3D toward the cursor */
export function TiltCard({ children, className, style }) {
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

/* Square auto-playing "ad reel": crossfades between scenes with a Ken Burns
 * zoom, animated taglines and a progress bar — looks like a sneaker commercial,
 * built entirely in-app (no video file needed). */
export function AdReel({ scenes, interval = 2600 }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % scenes.length), interval)
    return () => clearInterval(t)
  }, [scenes.length, interval])

  const scene = scenes[i]
  const secs = interval / 1000

  return (
    <div className="reel">
      <AnimatePresence>
        <motion.div
          key={i}
          className="reel__scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="reel__img"
            style={{ backgroundImage: `url(${scene.img})` }}
            initial={{ scale: 1.0, x: '0%' }}
            animate={{ scale: 1.16, x: scene.pan ?? '-2%' }}
            transition={{ duration: secs + 1, ease: 'linear' }}
          />
          <div className="reel__veil" />
        </motion.div>
      </AnimatePresence>

      <div className="reel__bar">
        {scenes.map((_, n) => (
          <span key={n} className={n === i ? 'on' : ''} />
        ))}
      </div>
      <div className="reel__tag">VELOCE ✦ AIR—9</div>

      <div className="reel__caption">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -28, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {scene.line}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Cinematic ~10s sneaker "video": 5 scenes with VARIED transitions (zoom punch,
 * whip slide, flash cut, fade), Ken Burns motion, letterbox, film grain, a
 * moving light sweep and a REC/HUD overlay. Premium, all in-app. */
const TRANSITIONS = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  zoom: {
    initial: { opacity: 0, scale: 1.35 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85 },
  },
  slide: {
    initial: { x: '102%' },
    animate: { x: '0%' },
    exit: { x: '-102%' },
  },
  flash: {
    initial: { opacity: 0, filter: 'brightness(4)' },
    animate: { opacity: 1, filter: 'brightness(1)' },
    exit: { opacity: 0, filter: 'brightness(2)' },
  },
}

export function CinemaReel({ scenes, interval = 2000 }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % scenes.length), interval)
    return () => clearInterval(t)
  }, [scenes.length, interval])

  const scene = scenes[i]
  const variant = TRANSITIONS[scene.type] || TRANSITIONS.fade
  const secs = interval / 1000

  return (
    <div className="cinema">
      <AnimatePresence>
        <motion.div
          key={i}
          className="cinema__scene"
          variants={variant}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="cinema__img"
            style={{ backgroundImage: `url(${scene.img})` }}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.22 }}
            transition={{ duration: secs + 0.7, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="cinema__grain" />
      <div className="cinema__sweep" />

      <div className="cinema__hud">
        <span className="cinema__rec">● REC</span>
        <span>
          {String(i + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
        </span>
      </div>

      <div className="cinema__caption">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {scene.line}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* Infinite marquee strip */
export function Marquee({ items, separator = '✦' }) {
  const row = [...items, ...items]
  return (
    <div className="marquee">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span className="marquee__item" key={i}>
            {t}
            <i className="marquee__sep">{separator}</i>
          </span>
        ))}
      </div>
    </div>
  )
}
