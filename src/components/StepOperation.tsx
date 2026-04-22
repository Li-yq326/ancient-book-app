import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Step, useGame } from '../App'
import './StepOperation.css'

interface StepOperationProps {
  step: Step
  onClose: () => void
}

interface OperationConfig {
  type: string
  instruction: string
  targetProgress: number
  interaction: 'drag' | 'paint' | 'press' | 'swipe'
}

const OPERATION_CONFIGS: Record<string, OperationConfig> = {
  scan: {
    type: 'scan',
    instruction: '将古籍书页完整摄入镜框',
    targetProgress: 100,
    interaction: 'press',
  },
  '拼版': {
    type: '拼版',
    instruction: '将散落的书页碎片拼合完整',
    targetProgress: 100,
    interaction: 'drag',
  },
  '调色': {
    type: '调色',
    instruction: '拖动笔刷为书页调色',
    targetProgress: 100,
    interaction: 'paint',
  },
  '打印': {
    type: '打印',
    instruction: '拖动宣纸放入打印机',
    targetProgress: 100,
    interaction: 'drag',
  },
  '做旧': {
    type: '做旧',
    instruction: '按压喷洒做旧效果',
    targetProgress: 100,
    interaction: 'press',
  },
  '装帧': {
    type: '装帧',
    instruction: '按压完成书页装帧',
    targetProgress: 100,
    interaction: 'press',
  },
}

export default function StepOperation({ step, onClose }: StepOperationProps) {
  const { state, completeStep, markVideoWatched, canProceed } = useGame()
  const [showVideo, setShowVideo] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isOperating, setIsOperating] = useState(false)
  const [operationComplete, setOperationComplete] = useState(false)

  const config = OPERATION_CONFIGS[step.operationType]
  const hasWatchedVideo = state.videosWatched.includes(step.id)

  useEffect(() => {
    setProgress(0)
    setIsOperating(false)
    setOperationComplete(false)
  }, [step.id])

  const handleVideoEnd = () => {
    markVideoWatched(step.id)
    setShowVideo(false)
  }

  const handleStartOperation = () => {
    setShowVideo(false)
    setIsOperating(true)
  }

  const handleProgress = (newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress))
    setProgress(clampedProgress)
    if (clampedProgress >= 100 && !operationComplete) {
      setOperationComplete(true)
      setTimeout(() => {
        completeStep(step.id)
      }, 800)
    }
  }

  const renderOperationArea = () => {
    switch (config.interaction) {
      case 'drag':
        return (
          <DragOperation
            progress={progress}
            onProgress={handleProgress}
            stepType={step.operationType}
          />
        )
      case 'paint':
        return (
          <PaintOperation
            progress={progress}
            onProgress={handleProgress}
          />
        )
      case 'press':
        return (
          <PressOperation
            progress={progress}
            onProgress={handleProgress}
            stepType={step.operationType}
          />
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className="step-operation"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="operation-header">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="step-title">{step.name}</h2>
        <p className="step-instruction">{config.instruction}</p>
      </div>

      <AnimatePresence mode="wait">
        {showVideo ? (
          <motion.div
            key="video"
            className="video-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="video-frame">
              <div className="video-content">
                <div className="video-placeholder">
                  <span className="video-icon">▶</span>
                  <p>{step.videoTitle}</p>
                  <p className="video-hint">（点击播放教学视频）</p>
                </div>
              </div>
              <button className="skip-video-btn" onClick={handleVideoEnd}>
                跳过视频
              </button>
            </div>
          </motion.div>
        ) : isOperating ? (
          <motion.div
            key="operation"
            className="operation-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="progress-ring">
              <svg viewBox="0 0 100 100">
                <circle
                  className="progress-bg"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <circle
                  className="progress-value"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${progress * 2.83} 283`}
                />
              </svg>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>

            {renderOperationArea()}

            {operationComplete && (
              <motion.div
                className="complete-hint"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                步骤完成！
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="intro"
            className="step-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="step-icon-large">{step.id}</div>
            <p className="step-desc-large">{step.description}</p>
            
            <div className="action-buttons">
              <button
                className="btn-ancient"
                onClick={() => setShowVideo(true)}
              >
                {hasWatchedVideo ? '再次观看教学' : '观看教学视频'}
              </button>
              <button
                className="btn-ancient btn-start"
                onClick={handleStartOperation}
              >
                开始操作
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DragOperation({
  progress,
  onProgress,
  stepType,
}: {
  progress: number
  onProgress: (p: number) => void
  stepType: string
}) {
  const [position, setPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getTargetPosition = () => {
    return 80
  }

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const newPosition = Math.min(100, Math.max(0, (x / rect.width) * 100))
    setPosition(newPosition)
    const targetPct = (newPosition / getTargetPosition()) * 100
    onProgress(targetPct)
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    handleMove(clientX)
  }

  const handleMoveEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    handleMove(clientX)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="drag-container"
      onMouseDown={handleStart}
      onMouseMove={handleMoveEvent}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMoveEvent}
      onTouchEnd={handleEnd}
    >
      <div className="drag-track">
        <div className="drag-target" style={{ left: `${getTargetPosition()}%` }}>
          目标位置
        </div>
        <motion.div
          className="drag-object"
          style={{ left: `${position}%` }}
          animate={{ left: `${position}%` }}
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
        >
          📄
        </motion.div>
      </div>
      <p className="operation-hint">拖动文件到目标位置</p>
    </div>
  )
}

function PaintOperation({
  progress,
  onProgress,
}: {
  progress: number
  onProgress: (p: number) => void
}) {
  const [strokes, setStrokes] = useState<{ x: number; y: number }[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPainting, setIsPainting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePaint = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !isPainting) return
    const rect = containerRef.current.getBoundingClientRect()
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    setStrokes(prev => [...prev, { x, y }])
    
    const targetProgress = Math.min(100, strokes.length * 3)
    onProgress(targetProgress)
  }

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPainting(true)
    handlePaint(e)
  }

  const handleEnd = () => {
    setIsPainting(false)
  }

  return (
    <div
      ref={containerRef}
      className="paint-container"
      onMouseDown={handleStart}
      onMouseMove={handlePaint}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handlePaint}
      onTouchEnd={handleEnd}
    >
      <canvas
        ref={canvasRef}
        className="paint-canvas"
        width={300}
        height={200}
      />
      {strokes.map((stroke, i) => (
        <div
          key={i}
          className="paint-stroke"
          style={{
            left: stroke.x,
            top: stroke.y,
          }}
        />
      ))}
      <div className="paint-area">
        <span>拖动涂抹此区域调色</span>
      </div>
      <p className="operation-hint">拖动笔刷为书页均匀上色</p>
    </div>
  )
}

function PressOperation({
  progress,
  onProgress,
  stepType,
}: {
  progress: number
  onProgress: (p: number) => void
  stepType: string
}) {
  const [isPressing, setIsPressing] = useState(false)
  const pressTimerRef = useRef<number | null>(null)

  const getPressFeedback = () => {
    switch (stepType) {
      case 'scan':
        return '📷 拍摄中...'
      case '做旧':
        return '💨 喷洒做旧剂...'
      case '装帧':
        return '🧵 穿线固定中...'
      default:
        return '⏳ 处理中...'
    }
  }

  const handlePressStart = () => {
    setIsPressing(true)
    pressTimerRef.current = window.setInterval(() => {
      onProgress(progress + 2)
    }, 100)
  }

  const handlePressEnd = () => {
    setIsPressing(false)
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  return (
    <div className="press-container">
      <motion.button
        className={`press-button ${isPressing ? 'pressing' : ''}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        whileTap={{ scale: 0.92 }}
        animate={isPressing ? { scale: [1, 0.95, 1] } : {}}
      >
        <span className="press-icon">
          {stepType === 'scan' ? '📷' : stepType === '做旧' ? '💨' : '🧵'}
        </span>
        <span className="press-feedback">
          {isPressing ? getPressFeedback() : '按住触发'}
        </span>
      </motion.button>
      <p className="operation-hint">长按聚焦触发操作</p>
    </div>
  )
}