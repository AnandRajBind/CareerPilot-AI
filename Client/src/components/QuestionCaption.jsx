import React, { useState, useEffect } from 'react'

const QuestionCaption = ({ question, isAnimating = true, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!question) {
      setDisplayedText('')
      return
    }

    if (!isAnimating) {
      setDisplayedText(question)
      return
    }

    let currentIndex = 0
    setDisplayedText('')

    const interval = setInterval(() => {
      if (currentIndex < question.length) {
        setDisplayedText(question.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [question, isAnimating, speed])

  return (
    <div className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-white text-lg leading-relaxed min-h-24 flex items-center">
        <span className="text-blue-400 mr-2">Q:</span>
        {displayedText}
        {isAnimating && displayedText.length < (question?.length || 0) && (
          <span className="ml-1 w-2 h-6 bg-blue-400 animate-pulse inline-block"></span>
        )}
      </p>
    </div>
  )
}

export default QuestionCaption
