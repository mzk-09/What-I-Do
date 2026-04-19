import { useEffect, useRef, useState } from 'react'

export function useAmbientBeat() {
  const contextRef = useRef(null)
  const timerRef = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (contextRef.current) {
        contextRef.current.close()
      }
    }
  }, [])

  const stop = () => {
    setEnabled(false)
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (contextRef.current?.state === 'running') {
      contextRef.current.suspend()
    }
  }

  const pulse = () => {
    if (!contextRef.current) {
      return
    }

    const ctx = contextRef.current
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)

    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(90, now)
    osc.type = 'sine'

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.45)
  }

  const start = async () => {
    if (!contextRef.current) {
      contextRef.current = new window.AudioContext()
    }

    await contextRef.current.resume()
    setEnabled(true)
    pulse()

    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        pulse()
      }, 1100)
    }
  }

  const toggle = () => {
    if (enabled) {
      stop()
    } else {
      start()
    }
  }

  return { enabled, toggle }
}
