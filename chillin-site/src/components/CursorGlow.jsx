import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const move = (event) => {
      if (!glowRef.current) {
        return
      }
      glowRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    }

    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
}
