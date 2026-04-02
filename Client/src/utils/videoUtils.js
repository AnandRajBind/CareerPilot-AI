/**
 * Video Utilities for CareerPilot AI
 * Handles camera access, video recording, and playback
 * with graceful fallbacks for unsupported browsers
 */

// ========================
// CAMERA AND VIDEO SETUP
// ========================

class VideoManager {
  constructor() {
    this.stream = null
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.isSupported = !!navigator.mediaDevices?.getUserMedia
    this.videoBlob = null
  }

  /**
   * Request camera and microphone access
   * @param {Object} constraints - getUserMedia constraints
   * @returns {Promise<MediaStream>}
   */
  async getMediaStream(constraints = {}) {
    if (!this.isSupported) {
      return Promise.reject(
        new Error('Camera access is not supported in this browser')
      )
    }

    try {
      const defaultConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        ...constraints,
      }

      this.stream = await navigator.mediaDevices.getUserMedia(
        defaultConstraints
      )
      return this.stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  /**
   * Check if camera is supported
   */
  isCameraSupported() {
    return this.isSupported
  }

  /**
   * Stop current media stream
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
      this.stream = null
    }
  }

  /**
   * Check camera permission status
   */
  async checkCameraPermission() {
    if (!navigator.permissions?.query) {
      return 'unknown'
    }

    try {
      const result = await navigator.permissions.query({
        name: 'camera',
      })
      return result.state // granted, denied, prompt
    } catch (error) {
      console.error('Error checking permission:', error)
      return 'unknown'
    }
  }

  /**
   * Get supported video codecs
   */
  getSupportedMimeTypes() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac',
    ]

    return types.filter((type) => MediaRecorder.isTypeSupported(type))
  }
}

// ========================
// VIDEO RECORDING
// ========================

class RecorderManager {
  constructor() {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.recordingStartTime = null
    this.pauseTime = null
    this.recordedDuration = 0
    this.isSupported = !!window.MediaRecorder
  }

  /**
   * Start recording video and audio
   * @param {MediaStream} stream - Media stream to record
   * @param {Object} options - Recording options
   * @returns {Promise}
   */
  async startRecording(stream, options = {}) {
    if (!this.isSupported) {
      return Promise.reject(new Error('Video recording is not supported in this browser'))
    }

    if (!stream) {
      return Promise.reject(new Error('No media stream provided'))
    }

    return new Promise((resolve, reject) => {
      try {
        this.recordedChunks = []
        this.recordingStartTime = Date.now()
        this.recordedDuration = 0

        const mimeType = options.mimeType || this.getBestMimeType()

        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5 Mbps
          audioBitsPerSecond: options.audioBitsPerSecond || 128000, // 128 kbps
        })

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstart = () => {
          this.isRecording = true
          if (options.onStart) options.onStart()
        }

        this.mediaRecorder.onstop = () => {
          this.isRecording = false
          if (options.onStop) options.onStop()
        }

        this.mediaRecorder.onerror = (event) => {
          console.error('Recording error:', event.error)
          if (options.onError) options.onError(event.error)
          reject(new Error(`Recording error: ${event.error}`))
        }

        this.mediaRecorder.start()
        resolve()
      } catch (error) {
        console.error('Error starting recording:', error)
        reject(error)
      }
    })
  }

  /**
   * Stop recording and return blob
   * @returns {Promise<Blob>}
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false

        // Calculate recording duration
        if (this.recordingStartTime) {
          this.recordedDuration =
            Date.now() - this.recordingStartTime + this.recordedDuration
        }

        // Create blob from recorded chunks
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder.mimeType || 'video/webm',
        })

        resolve(blob)
      }

      try {
        this.mediaRecorder.stop()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Pause recording
   */
  pauseRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.pause()
      this.pauseTime = Date.now()
    }
  }

  /**
   * Resume paused recording
   */
  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      if (this.pauseTime) {
        this.recordedDuration += Date.now() - this.pauseTime
        this.pauseTime = null
      }
    }
  }

  /**
   * Get recording duration
   */
  getRecordingDuration() {
    if (!this.isRecording) return this.recordedDuration

    const elapsed = Date.now() - this.recordingStartTime
    return this.recordedDuration + elapsed
  }

  /**
   * Get best supported MIME type
   */
  getBestMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // Fallback
  }

  /**
   * Check if recording is supported
   */
  isRecordingSupported() {
    return this.isSupported
  }
}

// ========================
// EXPORTS
// ========================

const videoManager = new VideoManager()
const recorderManager = new RecorderManager()

/**
 * Get camera and microphone stream
 */
export const getMediaStream = (constraints) => {
  return videoManager.getMediaStream(constraints)
}

/**
 * Stop media stream
 */
export const stopMediaStream = () => {
  videoManager.stopStream()
}

/**
 * Check if camera is supported
 */
export const isCameraSupported = () => {
  return videoManager.isCameraSupported()
}

/**
 * Check camera permission
 */
export const checkCameraPermission = () => {
  return videoManager.checkCameraPermission()
}

/**
 * Start recording
 */
export const startVideoRecording = (stream, options) => {
  return recorderManager.startRecording(stream, options)
}

/**
 * Stop recording and get blob
 */
export const stopVideoRecording = () => {
  return recorderManager.stopRecording()
}

/**
 * Pause recording
 */
export const pauseVideoRecording = () => {
  recorderManager.pauseRecording()
}

/**
 * Resume recording
 */
export const resumeVideoRecording = () => {
  recorderManager.resumeRecording()
}

/**
 * Get recording duration
 */
export const getRecordingDuration = () => {
  return recorderManager.getRecordingDuration()
}

/**
 * Check if recording is supported
 */
export const isVideoRecordingSupported = () => {
  return recorderManager.isRecordingSupported()
}

/**
 * Create download link for video blob
 */
export const downloadVideo = (blob, filename = 'interview.webm') => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Get managers for advanced usage
 */
export { videoManager, recorderManager }
