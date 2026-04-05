import React, { createContext, useContext, useMemo, useState } from 'react'

const MediaContext = createContext(null)

export const MediaProvider = ({ children }) => {
  const [cameraStream, setCameraStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)
  const [microphoneTrack, setMicrophoneTrack] = useState(null)

  const clearMedia = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }
    setCameraStream(null)
    setScreenStream(null)
    setMicrophoneTrack(null)
  }

  const value = useMemo(
    () => ({
      cameraStream,
      setCameraStream,
      screenStream,
      setScreenStream,
      microphoneTrack,
      setMicrophoneTrack,
      clearMedia,
    }),
    [cameraStream, screenStream, microphoneTrack]
  )

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}

export const useMedia = () => {
  const context = useContext(MediaContext)
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider')
  }
  return context
}
