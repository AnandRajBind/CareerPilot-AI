import React, { useEffect, useRef, useState } from 'react'

const CandidateVideo = ({ stream, isRecording = false }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  return (
    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-black border-2 border-gray-600 shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-white text-xs font-semibold">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          REC
        </div>
      )}

      {/* Fallback message */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-white text-xs text-center px-2">Camera not available</p>
        </div>
      )}
    </div>
  )
}

export default CandidateVideo
