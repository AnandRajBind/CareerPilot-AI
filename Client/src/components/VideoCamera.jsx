import React, { useEffect, useRef, useState } from 'react'
import { AlertCircle, Camera, Loader } from 'lucide-react'
import { getMediaStream, stopMediaStream, isCameraSupported, checkCameraPermission } from '../utils/videoUtils'

export default function VideoCamera({ onStreamReady, onError }) {
  const videoRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState(null)
  const currentStream = useRef(null)

  // Check support and request permissions on mount
  useEffect(() => {
    const initCamera = async () => {
      const supported = isCameraSupported()
      setIsSupported(supported)

      if (!supported) {
        setError('Camera is not supported in your browser')
        if (onError) onError('Camera not supported')
        return
      }

      // Check permission status
      const permissionStatus = await checkCameraPermission()
      setPermission(permissionStatus)

      // Auto-start if granted
      if (permissionStatus === 'granted') {
        await startCamera()
      }
    }

    initCamera()

    // Cleanup on unmount
    return () => {
      if (currentStream.current) {
        stopMediaStream()
      }
    }
  }, [])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const stream = await getMediaStream({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false, // Audio will be captured separately during recording
      })

      currentStream.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setPermission('granted')
      if (onStreamReady) onStreamReady(stream)
    } catch (err) {
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please enable camera access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera found on your device.'
        : `Error accessing camera: ${err.message}`

      setError(errorMsg)
      setPermission('denied')
      if (onError) onError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if not supported
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-800 font-semibold text-sm">Video Not Supported</p>
          <p className="text-yellow-700 text-sm">Your browser doesn't support video recording. You can continue with text/voice answers.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Video Preview */}
      <div className="bg-black rounded-lg overflow-hidden aspect-video border-2 border-gray-300">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
              <p className="text-white text-sm">Initializing camera...</p>
            </div>
          </div>
        )}
        {!isLoading && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef.current?.readyState === 4) {
                // Video is ready
                setIsLoading(false)
              }
            }}
          />
        )}
      </div>

      {/* Start Camera Button */}
      {permission === 'denied' && !isLoading && (
        <button
          onClick={startCamera}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Enable Camera
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold text-sm">Camera Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Permission Warning */}
      {permission === 'denied' && (
        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-semibold text-sm">Camera Access Required</p>
            <p className="text-yellow-700 text-sm">
              Please enable camera access in your browser settings to use video interviews.
            </p>
          </div>
        </div>
      )}

      {/* Info Message */}
      <p className="text-xs text-gray-500 text-center">
        💡 Your camera will be visible only to you during the interview. This helps with practice and self-evaluation.
      </p>
    </div>
  )
}
