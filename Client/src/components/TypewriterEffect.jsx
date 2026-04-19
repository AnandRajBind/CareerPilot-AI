import React, { useState, useEffect } from 'react'

const TypewriterEffect = ({ text, className = '', delay = 0, speed = 50, loop = true, deleteSpeed = 30, secondLineClass = '' }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  const fullText = text.replace(/&#10;/g, '\n')

  useEffect(() => {
    let timeout

    if (!isDeleting) {
      // Typing phase
      if (charIndex < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        }, delay + speed)
      } else if (loop && charIndex === fullText.length) {
        // Start deleting after a pause
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 1000)
      }
    } else {
      // Deleting phase
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        }, deleteSpeed)
      } else {
        // Start typing again
        timeout = setTimeout(() => {
          setIsDeleting(false)
          setCharIndex(0)
        }, 500)
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [charIndex, isDeleting, fullText, delay, speed, deleteSpeed, loop])

  // Split text by newline and apply gradient to second line
  const lines = displayedText.split('\n')
  const fullLines = fullText.split('\n')

  // Check if we're still typing the first line or the second line
  const firstLineComplete = displayedText.includes('\n') || (lines.length > 0 && displayedText.length >= fullLines[0].length)

  return (
    <>
      <span className={className}>
        {lines[0]}
        {!firstLineComplete && <span className="animate-pulse">|</span>}
      </span>
      {lines.length > 1 && (
        <span className={`block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 ${secondLineClass}`}>
          {lines[1]}
          {firstLineComplete && <span className="animate-pulse">|</span>}
        </span>
      )}
    </>
  )
}

export default TypewriterEffect
