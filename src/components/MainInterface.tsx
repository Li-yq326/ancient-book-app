import { motion } from 'framer-motion'
import { Step, useGame } from '../App'
import './MainInterface.css'

interface MainInterfaceProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: Step) => void
}

export default function MainInterface({ steps, currentStep, completedSteps, onStepClick }: MainInterfaceProps) {
  const { state } = useGame()

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentStep) return 'current'
    if (stepId < currentStep) return 'locked'
    return 'locked'
  }

  return (
    <motion.div
      className="main-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="scroll-header">
        <div className="scroll-title">古籍复制六步法</div>
        <div className="progress-indicator">
          <span className="progress-text">已完成 {completedSteps.length}/6</span>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.length / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="scroll-body">
        <div className="scroll-edge left" />
        
        <div className="steps-container">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            return (
              <motion.div
                key={step.id}
                className={`step-card ${status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className="step-button"
                  onClick={() => onStepClick(step)}
                  disabled={status === 'locked'}
                >
                  <div className="step-number">{step.id}</div>
                  <div className="step-name">{step.name}</div>
                  <div className="step-desc">{step.description}</div>
                  {status === 'completed' && (
                    <div className="step-check">✓</div>
                  )}
                  {status === 'current' && (
                    <div className="step-arrow">→</div>
                  )}
                </button>
              </motion.div>
            )
          })}
        </div>

        <div className="scroll-edge right" />
      </div>

      <div className="scroll-footer">
        <div className="scroll-decor">
          <span className="seal">再造善本</span>
        </div>
      </div>
    </motion.div>
  )
}