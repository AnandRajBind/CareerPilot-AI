import React, { useState, useRef, useEffect } from 'react'

const DraggableVideo = ({ stream, isRecording = false }) => {
  const initialSize = { width: 220, height: 220 }
  const [size, setSize] = useState(initialSize)
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - initialSize.width - 10 : 0,
    y: 80, // Below header area
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, direction: '' })
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  // Set up video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((error) => {
        console.log('Video play error:', error)
      })
    }
  }, [stream])

  // Constrain position to be within viewport
  const constrainPosition = (x, y, width, height) => {
    const maxX = window.innerWidth - width - 10
    const maxY = window.innerHeight - height - 10
    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(60, Math.min(y, maxY)), // Min Y of 60 to stay below header
    }
  }

  // Constrain size to be within reasonable limits
  const constrainSize = (width, height) => {
    const minSize = 200
    const maxSize = Math.min(window.innerWidth * 0.5, window.innerHeight * 0.5)
    return {
      width: Math.max(minSize, Math.min(width, maxSize)),
      height: Math.max(minSize, Math.min(height, maxSize)),
    }
  }

  // Handle drag start
  const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  // Handle drag
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const newPos = constrainPosition(
        e.clientX - dragStart.x,
        e.clientY - dragStart.y,
        size.width,
        size.height
      )
      setPosition(newPos)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, size.width, size.height])

  // Handle resize start
  const handleResizeStart = (e, direction) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      direction,
    })
  }

  // Handle resize
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      const direction = resizeStart.direction

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = position.x
      let newY = position.y

      // Handle horizontal resizing
      if (['e', 'se', 'ne'].includes(direction)) {
        newWidth = resizeStart.width + deltaX
      } else if (['w', 'sw', 'nw'].includes(direction)) {
        newWidth = resizeStart.width - deltaX
        newX = position.x + deltaX
      }

      // Handle vertical resizing
      if (['s', 'se', 'sw'].includes(direction)) {
        newHeight = resizeStart.height + deltaY
      } else if (['n', 'ne', 'nw'].includes(direction)) {
        newHeight = resizeStart.height - deltaY
        newY = position.y + deltaY
      }

      const newSize = constrainSize(newWidth, newHeight)
      const newPos = constrainPosition(newX, newY, newSize.width, newSize.height)
      
      setSize(newSize)
      setPosition(newPos)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStart, position])

  return (
    <div
      ref={containerRef}
      className="fixed z-20 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Video Container */}
      <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 border-gray-500 bg-black">
        <div className="w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-white text-xs font-semibold z-30">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            REC
          </div>
        )}

        {/* Resize Handles - Top Side */}
        <div
          className="resize-handle absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-n-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
          title="Drag to resize"
        />

        {/* Resize Handles - Bottom Side */}
        <div
          className="resize-handle absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-s-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 's')}
          title="Drag to resize"
        />

        {/* Resize Handles - Left Side */}
        <div
          className="resize-handle absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-8 cursor-w-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
          title="Drag to resize"
        />

        {/* Resize Handles - Right Side */}
        <div
          className="resize-handle absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-8 cursor-e-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
          title="Drag to resize"
        />

        {/* Resize Handles - Top Left Corner */}
        <div
          className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
          title="Drag to resize"
        />

        {/* Resize Handles - Top Right Corner */}
        <div
          className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
          title="Drag to resize"
        />

        {/* Resize Handles - Bottom Left Corner */}
        <div
          className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
          title="Drag to resize"
        />

        {/* Resize Handles - Bottom Right Corner */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30 hover:bg-gray-400 hover:opacity-50 transition"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
          title="Drag to resize"
        />
      </div>
    </div>
  )
}

export default DraggableVideo
