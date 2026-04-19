import { lazy, Suspense, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import CursorGlow from './components/CursorGlow'
import { brandPillars, flavors } from './data/flavors'
import { useAmbientBeat } from './hooks/useAmbientBeat'
import './App.css'

const HeroScene = lazy(() => import('./components/HeroScene'))
const ShowcaseScene = lazy(() => import('./components/ShowcaseScene'))
const MotionArticle = motion.article
const MotionAside = motion.aside
const MotionDiv = motion.div

function SoundToggle() {
  const { enabled, toggle } = useAmbientBeat()

  return (
    <button type="button" className="sound-toggle" onClick={toggle}>
      {enabled ? 'Sound: On' : 'Sound: Off'}
    </button>
  )
}

function FlavorCards({ onSelect }) {
  return (
    <div className="flavor-grid">
      {flavors.map((flavor) => (
        <MotionArticle
          key={flavor.id}
          className="flavor-card"
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          style={{ '--flavor-glow': flavor.glow, '--c1': flavor.colors[0], '--c2': flavor.colors[1] }}
          onMouseEnter={() => onSelect(flavor)}
        >
          <h3>{flavor.name}</h3>
          <p>{flavor.description}</p>
          <strong>{flavor.boost}</strong>
        </MotionArticle>
      ))}
    </div>
  )
}

export default function App() {
  const [activeFlavor, setActiveFlavor] = useState(flavors[0])

  const neonGradient = useMemo(
    () => `linear-gradient(120deg, ${activeFlavor.colors[0]}, ${activeFlavor.colors[1]})`,
    [activeFlavor.colors],
  )

  return (
    <>
      <CursorGlow />
      <div className="bg-orb orb-a" aria-hidden="true" />
      <div className="bg-orb orb-b" aria-hidden="true" />

      <header className="hero" id="top">
        <nav className="top-nav">
          <a href="#top" className="brand">Chillin</a>
          <div className="nav-actions">
            <a href="#showcase">Flavors</a>
            <a href="#cta">Launch</a>
            <SoundToggle />
          </div>
        </nav>

        <div className="hero-content">
          <MotionDiv
            className="hero-copy"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="kicker">Premium energy for bold movers</p>
            <h1>Chillin</h1>
            <h2>Stay Cool. Move Fast.</h2>
            <p>
              A youth-driven drink with chill aesthetics and high-voltage energy. Built for long sessions,
              sharp focus, and smooth confidence.
            </p>
            <a href="#showcase" className="cta-button" style={{ backgroundImage: neonGradient }}>Explore Flavors</a>
          </MotionDiv>

          <div className="hero-canvas">
            <Suspense fallback={<div className="canvas-loading">Loading 3D...</div>}>
              <HeroScene flavor={activeFlavor} />
            </Suspense>
          </div>
        </div>
      </header>

      <main>
        <section id="showcase" className="showcase section-card">
          <div className="section-heading">
            <p>3D Product Showcase</p>
            <h2>Rotate, zoom, click — pick your pulse.</h2>
          </div>

          <div className="showcase-grid">
            <div className="showcase-canvas">
              <Suspense fallback={<div className="canvas-loading">Loading 3D...</div>}>
                <ShowcaseScene
                  flavors={flavors}
                  activeFlavor={activeFlavor}
                  onSelect={setActiveFlavor}
                />
              </Suspense>
            </div>

            <MotionAside
              className="flavor-details"
              key={activeFlavor.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              style={{ '--c1': activeFlavor.colors[0], '--c2': activeFlavor.colors[1] }}
            >
              <h3>{activeFlavor.name}</h3>
              <p>{activeFlavor.description}</p>
              <strong>{activeFlavor.boost}</strong>
              <span className="pill">{activeFlavor.short}</span>
            </MotionAside>
          </div>
        </section>

        <section className="section-card" id="flavors">
          <div className="section-heading">
            <p>Flavor Collection</p>
            <h2>Five crafted moods. One clean energy identity.</h2>
          </div>
          <FlavorCards onSelect={setActiveFlavor} />
        </section>

        <section className="section-card about">
          <div className="section-heading">
            <p>About</p>
            <h2>Calm mindset. Hustle output.</h2>
          </div>
          <p>
            Chillin was imagined for a generation that wants both peace and performance. We believe power
            should feel smooth, not aggressive — a modern ritual for late edits, sunrise workouts, and every
            bold move between.
          </p>
        </section>

        <section className="section-card why">
          <div className="section-heading">
            <p>Why Chillin</p>
            <h2>Designed for modern motion.</h2>
          </div>
          <div className="pillars">
            {brandPillars.map((pillar) => (
              <MotionArticle key={pillar.title} whileHover={{ scale: 1.02 }}>
                <h3>{pillar.title}</h3>
                <p>{pillar.detail}</p>
              </MotionArticle>
            ))}
          </div>
        </section>

        <section className="section-card cta" id="cta">
          <h2>Ready to Grab Your Chill?</h2>
          <p>Drop incoming. First batch is almost here.</p>
          <button type="button" className="cta-button">Coming Soon</button>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Chillin Energy</p>
        <div>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </footer>
    </>
  )
}
