import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './CloudCelebration.css'

interface CloudCelebrationProps {
  onRestart: () => void
}

export default function CloudCelebration({ onRestart }: CloudCelebrationProps) {
  const [showText, setShowText] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (e) {
        console.log('Audio not supported')
      }
    }
    initAudio()

    const timer1 = setTimeout(() => setShowText(true), 1500)
    const timer2 = setTimeout(() => setShowButton(true), 3000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      audioContextRef.current?.close()
    }
  }, [])

  const playGuqinSound = () => {
    if (!audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const now = ctx.currentTime
    
    const frequencies = [220, 277.18, 329.63, 392, 440, 523.25]
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      
      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 1.5)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 1.5)
    })
  }

  const handleEnter = () => {
    playGuqinSound()
  }

  return (
    <motion.div
      className="celebration-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={handleEnter}
    >
      <div className="clouds-container">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className={`cloud-ring cloud-${i}`}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1.5, 1.8],
              opacity: [0, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {showText && (
        <motion.div
          className="celebration-text"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="text-main">再造善本</div>
          <div className="text-sub">古籍复制已完成</div>
        </motion.div>
      )}

      {showButton && (
        <motion.div
          className="celebration-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="btn-ancient" onClick={onRestart}>
            再次体验
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}