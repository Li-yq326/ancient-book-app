import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Main界面 from './components/MainInterface'
import StepOperation from './components/StepOperation'
import CloudCelebration from './components/CloudCelebration'
import './App.css'

export interface Step {
  id: number
  name: string
  description: string
  videoTitle: string
  operationType: 'scan' | '拼版' | '调色' | '打印' | '做旧' | '装帧'
}

export const STEPS: Step[] = [
  { id: 1, name: '扫描摄书', description: '拍摄古籍书页影像', videoTitle: '古籍扫描示范', operationType: 'scan' },
  { id: 2, name: 'PS拼版', description: '将散页拼合排版', videoTitle: '拼版教学示范', operationType: '拼版' },
  { id: 3, name: 'PS调色', description: '调整色彩与明暗', videoTitle: '调色技巧示范', operationType: '调色' },
  { id: 4, name: '宣纸打印', description: '将影像输出到宣纸', videoTitle: '宣纸打印示范', operationType: '打印' },
  { id: 5, name: '做旧处理', description: '仿古做旧效果', videoTitle: '做旧工艺示范', operationType: '做旧' },
  { id: 6, name: '装帧成书', description: '线装书装帧', videoTitle: '装帧教学示范', operationType: '装帧' },
]

interface GameState {
  currentStep: number
  completedSteps: number[]
  videosWatched: number[]
}

interface GameContextType {
  state: GameState
  completeStep: (stepId: number) => void
  markVideoWatched: (stepId: number) => void
  canProceed: (stepId: number) => boolean
  resetProgress: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}

const STORAGE_KEY = 'ancient-book-progress'

const loadProgress = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        currentStep: parsed.currentStep || 1,
        completedSteps: parsed.completedSteps || [],
        videosWatched: parsed.videosWatched || [],
      }
    }
  } catch (e) {
    console.error('Failed to load progress:', e)
  }
  return { currentStep: 1, completedSteps: [], videosWatched: [] }
}

const saveProgress = (state: GameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

function App() {
  const [state, setState] = useState<GameState>(loadProgress)
  const [showIntro, setShowIntro] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [activeStep, setActiveStep] = useState<Step | null>(null)

  useEffect(() => {
    saveProgress(state)
  }, [state])

  const completeStep = useCallback((stepId: number) => {
    setState(prev => {
      const newCompleted = prev.completedSteps.includes(stepId)
        ? prev.completedSteps
        : [...prev.completedSteps, stepId]
      const nextStep = stepId >= 6 ? 6 : stepId + 1
      return {
        ...prev,
        completedSteps: newCompleted,
        currentStep: nextStep,
      }
    })
    if (stepId === 6) {
      setIsComplete(true)
    }
  }, [])

  const markVideoWatched = useCallback((stepId: number) => {
    setState(prev => ({
      ...prev,
      videosWatched: prev.videosWatched.includes(stepId)
        ? prev.videosWatched
        : [...prev.videosWatched, stepId],
    }))
  }, [])

  const canProceed = useCallback((stepId: number) => {
    return state.completedSteps.includes(stepId) || stepId === state.currentStep
  }, [state])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ currentStep: 1, completedSteps: [], videosWatched: [] })
    setIsComplete(false)
    setActiveStep(null)
  }, [])

  const handleStart = () => {
    setShowIntro(false)
  }

  const handleContinue = () => {
    if (state.completedSteps.length >= 6) {
      setIsComplete(true)
    } else {
      setActiveStep(STEPS[state.currentStep - 1])
    }
    setShowIntro(false)
  }

  const handleStepClick = (step: Step) => {
    if (step.id <= state.currentStep || state.completedSteps.includes(step.id)) {
      setActiveStep(step)
    }
  }

  const handleCloseStep = () => {
    setActiveStep(null)
  }

  return (
    <GameContext.Provider value={{ state, completeStep, markVideoWatched, canProceed, resetProgress }}>
      <div className="app-container">
        <div className="paper-texture" />
        <div className="cloud-pattern" />
        
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              className="intro-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="intro-content">
                <motion.h1
                  className="intro-title"
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  再造善本
                </motion.h1>
                <motion.p
                  className="intro-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  古籍复制体验之旅
                </motion.p>
                <motion.div
                  className="intro-buttons"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  {state.currentStep > 1 && state.completedSteps.length < 6 && (
                    <button className="btn-ancient" onClick={handleContinue}>
                      继续进度 ({state.completedSteps.length}/6)
                    </button>
                  )}
                  <button className="btn-ancient" onClick={handleStart}>
                    {state.currentStep > 1 ? '重新开始' : '开始体验'}
                  </button>
                </motion.div>
                {state.currentStep > 1 && state.completedSteps.length < 6 && (
                  <motion.button
                    className="reset-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    onClick={resetProgress}
                  >
                    清除进度
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : isComplete ? (
            <CloudCelebration key="celebration" onRestart={resetProgress} />
          ) : activeStep ? (
            <StepOperation
              key={`step-${activeStep.id}`}
              step={activeStep}
              onClose={handleCloseStep}
            />
          ) : (
            <MainInterface
              key="main"
              steps={STEPS}
              currentStep={state.currentStep}
              completedSteps={state.completedSteps}
              onStepClick={handleStepClick}
            />
          )}
        </AnimatePresence>
      </div>
    </GameContext.Provider>
  )
}

export default App