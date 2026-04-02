/**
 * Speech Utilities for CareerPilot AI
 * Provides Text-to-Speech and Speech-to-Text functionality
 * with graceful fallbacks for unsupported browsers
 */

// ========================
// TEXT-TO-SPEECH (TTS)
// ========================

class SpeechManager {
  constructor() {
    this.synth = window.speechSynthesis
    this.isSupported = !!this.synth
    this.currentUtterance = null
    this.isSpeaking = false
  }

  /**
   * Speak text aloud using browser SpeechSynthesis
   * @param {string} text - Text to speak
   * @param {Object} options - Configuration options
   * @returns {Promise} - Resolves when speech completes or is stopped
   */
  async speakText(text, options = {}) {
    if (!this.isSupported) {
      console.warn('Speech Synthesis not supported in this browser')
      return Promise.reject(new Error('Speech Synthesis not supported'))
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any existing speech
        this.stopSpeaking()

        const utterance = new SpeechSynthesisUtterance(text)

        // Configure speech options
        utterance.rate = options.rate || 1.0 // Speed (0.1 - 10)
        utterance.pitch = options.pitch || 1.0 // Pitch (0 - 2)
        utterance.volume = options.volume || 1.0 // Volume (0 - 1)
        utterance.lang = options.lang || 'en-US'

        // Event handlers
        utterance.onstart = () => {
          this.isSpeaking = true
          if (options.onStart) options.onStart()
        }

        utterance.onend = () => {
          this.isSpeaking = false
          if (options.onEnd) options.onEnd()
          resolve()
        }

        utterance.onerror = (event) => {
          this.isSpeaking = false
          console.error('Speech synthesis error:', event.error)
          if (options.onError) options.onError(event.error)
          reject(new Error(`Speech error: ${event.error}`))
        }

        utterance.onpause = () => {
          if (options.onPause) options.onPause()
        }

        utterance.onresume = () => {
          if (options.onResume) options.onResume()
        }

        this.currentUtterance = utterance
        this.synth.speak(utterance)
      } catch (error) {
        console.error('Error creating utterance:', error)
        reject(error)
      }
    })
  }

  /**
   * Stop current speech
   */
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel()
      this.isSpeaking = false
    }
  }

  /**
   * Pause current speech
   */
  pauseSpeech() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause()
    }
  }

  /**
   * Resume paused speech
   */
  resumeSpeech() {
    if (this.synth) {
      this.synth.resume()
    }
  }

  /**
   * Check if speech is currently playing
   */
  getSpeakingStatus() {
    return this.isSpeaking
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    if (!this.isSupported) return []
    return this.synth.getVoices()
  }

  /**
   * Check if TTS is supported
   */
  isTextToSpeechSupported() {
    return this.isSupported
  }
}

// ========================
// SPEECH-TO-TEXT (STT)
// ========================

class RecognitionManager {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    this.RecognitionClass = SpeechRecognition
    this.isSupported = !!SpeechRecognition
    this.recognition = null
    this.isListening = false
    this.transcript = ''
    this.isFinal = false
  }

  /**
   * Start listening for voice input
   * @param {Object} options - Configuration options
   * @returns {Promise} - Resolves with transcript
   */
  async startListening(options = {}) {
    if (!this.isSupported) {
      return Promise.reject(
        new Error('Speech Recognition not supported in this browser')
      )
    }

    return new Promise((resolve, reject) => {
      try {
        this.recognition = new this.RecognitionClass()

        // Configure recognition
        this.recognition.continuous = options.continuous || false
        this.recognition.interimResults = options.interimResults !== false
        this.recognition.lang = options.lang || 'en-US'

        this.transcript = ''
        this.isFinal = false
        this.isListening = true

        // Event handlers
        this.recognition.onstart = () => {
          if (options.onStart) options.onStart()
        }

        this.recognition.onresult = (event) => {
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript

            if (event.results[i].isFinal) {
              this.transcript += transcript + ' '
              this.isFinal = true
            } else {
              interimTranscript += transcript
            }
          }

          const finalTranscript = this.transcript
          const current = interimTranscript || finalTranscript

          if (options.onResult) {
            options.onResult({
              transcript: finalTranscript,
              interimTranscript: interimTranscript,
              current: current,
              isFinal: this.isFinal,
            })
          }
        }

        this.recognition.onerror = (event) => {
          this.isListening = false
          console.error('Speech recognition error:', event.error)
          if (options.onError) options.onError(event.error)
          reject(new Error(`Recognition error: ${event.error}`))
        }

        this.recognition.onend = () => {
          this.isListening = false
          if (options.onEnd) options.onEnd()
          resolve(this.transcript.trim())
        }

        this.recognition.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
        this.isListening = false
        reject(error)
      }
    })
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * Abort listening
   */
  abortListening() {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return this.transcript.trim()
  }

  /**
   * Check if currently listening
   */
  getListeningStatus() {
    return this.isListening
  }

  /**
   * Check if Speech Recognition is supported
   */
  isSpeechRecognitionSupported() {
    return this.isSupported
  }
}

// ========================
// EXPORTS
// ========================

// Create singleton instances
const speechManager = new SpeechManager()
const recognitionManager = new RecognitionManager()

/**
 * Speak text aloud
 * @param {string} text - Text to speak
 * @param {Object} options - Configuration options
 */
export const speakText = (text, options = {}) => {
  return speechManager.speakText(text, options)
}

/**
 * Stop current speech
 */
export const stopSpeech = () => {
  speechManager.stopSpeaking()
}

/**
 * Pause speech
 */
export const pauseSpeech = () => {
  speechManager.pauseSpeech()
}

/**
 * Resume speech
 */
export const resumeSpeech = () => {
  speechManager.resumeSpeech()
}

/**
 * Check if text to speech is supported
 */
export const isTextToSpeechSupported = () => {
  return speechManager.isTextToSpeechSupported()
}

/**
 * Start listening for voice input
 * @param {Object} options - Configuration options
 */
export const startListening = (options = {}) => {
  return recognitionManager.startListening(options)
}

/**
 * Stop listening
 */
export const stopListening = () => {
  recognitionManager.stopListening()
}

/**
 * Abort listening
 */
export const abortListening = () => {
  recognitionManager.abortListening()
}

/**
 * Get current transcript
 */
export const getTranscript = () => {
  recognitionManager.getTranscript()
}

/**
 * Check if speech recognition is supported
 */
export const isSpeechRecognitionSupported = () => {
  return recognitionManager.isSpeechRecognitionSupported()
}

/**
 * Get both managers for advanced usage
 */
export { speechManager, recognitionManager }
