import React from 'react'
import { Mic, MicOff, RotateCcw, Square } from 'lucide-react'

const InterviewAnswerControls = ({
  isListening,
  isSpeaking,
  readyForAnswer,
  onPlayAgain,
  onStartAnswer,
  onStopAnswer,
  disabled = false,
  isMicEnabled = true,
  onMicDisabledAttempt,
}) => {
  return (
    <div className="flex gap-3 justify-center mb-4 flex-wrap">
      {/* Listen Again Button */}
      <button
        onClick={onPlayAgain}
        disabled={disabled || isSpeaking}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
        title="Replay the question"
      >
        <RotateCcw size={18} />
        <span>Listen Again</span>
      </button>

      {/* Start Answer Button */}
      {!isListening && (
        <button
          onClick={() => {
            if (!isMicEnabled) {
              if (onMicDisabledAttempt) onMicDisabledAttempt()
              return
            }
            onStartAnswer()
          }}
          disabled={disabled || isSpeaking || isListening || !isMicEnabled}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
          title={!isMicEnabled ? "Enable microphone to start answering" : "Start recording your answer"}
        >
          {!isMicEnabled && <MicOff size={18} />}
          {isMicEnabled && <Mic size={18} />}
          <span>Start Answer</span>
        </button>
      )}

      {/* Stop Answer Button */}
      {isListening && (
        <button
          onClick={onStopAnswer}
          disabled={disabled || !isListening}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition font-medium animate-pulse"
          title="Stop recording and save answer"
        >
          <Square size={18} />
          <span>Stop Answer</span>
        </button>
      )}
    </div>
  )
}

export default InterviewAnswerControls
