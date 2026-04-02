import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../hooks/useInterview';
import { useNavigate } from 'react-router-dom';
import SpeakButton from '../components/SpeakButton';
import VoiceRecorder from '../components/VoiceRecorder';
import VideoCamera from '../components/VideoCamera';
import VideoRecorder from '../components/VideoRecorder';
import VideoPlayback from '../components/VideoPlayback';
import { speakText } from '../utils/speechUtils';
import { isCameraSupported } from '../utils/videoUtils';
import { Video } from 'lucide-react';

export default function InterviewScreen() {
  const navigate = useNavigate();
  const { currentInterview, currentQuestionIndex, currentAnswer, submitAnswer, loading, error, isLastQuestion, progressPercentage, goToQuestion, completeInterview, answers } = useInterview();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [autoSpeakDone, setAutoSpeakDone] = useState(false);
  const [enableVideo, setEnableVideo] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [showVideoPlayback, setShowVideoPlayback] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Video recording refs
  const videoElementRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Update local answer text when question changes
  useEffect(() => {
    setAnswerText(currentAnswer || '');
    setTimeLeft(300);
    setLocalError('');
    setAutoSpeakDone(false);

    // Auto-speak the question when it loads
    if (currentInterview && currentInterview.questions[currentQuestionIndex]) {
      const question = currentInterview.questions[currentQuestionIndex];
      // Delay auto-speak slightly to avoid audio conflicts
      const timer = setTimeout(() => {
        speakText(question, {
          rate: 0.9,
          pitch: 1,
          lang: 'en-US',
          onEnd: () => setAutoSpeakDone(true),
          onError: (error) => {
            console.warn('Auto-speak failed:', error);
            setAutoSpeakDone(true);
          },
        }).catch(err => {
          console.warn('Could not auto-speak:', err);
          setAutoSpeakDone(true);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentAnswer]);

  // Timer effect - auto move to next question when time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cleanup video only on component unmount (not on question change)
  useEffect(() => {
    return () => {
      // Only stop video when leaving the interview screen completely
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Warn user before leaving page with unsaved progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only warn if interview is in progress (not completed)
      if (currentInterview && !submitting && !interviewCompleted) {
        e.preventDefault();
        e.returnValue = 'Are you sure? Your unsaved answers will be lost.';
        return 'Are you sure? Your unsaved answers will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentInterview, submitting, interviewCompleted]);

  // Attach media stream to video element when it becomes available
  useEffect(() => {
    if (mediaStream && videoElementRef.current) {
      console.log('Attaching stream to video element');
      videoElementRef.current.srcObject = mediaStream;
      // Play the video
      videoElementRef.current.play().catch(err => {
        console.warn('Video play error:', err);
      });
    }
  }, [mediaStream]);

  // Redirect to home if no active interview after loading completes
  useEffect(() => {
    if (!loading && !currentInterview) {
      console.log('No active interview, redirecting to home');
      navigate('/');
    }
  }, [currentInterview, loading, navigate]);

  if (!currentInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  const question = currentInterview.questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save current answer and validate
  const saveCurrentAnswer = async () => {
    if (!answerText.trim()) {
      setLocalError('Please enter an answer before proceeding');
      return false;
    }

    if (answerText.trim().length < 10) {
      setLocalError('Answer must be at least 10 characters');
      return false;
    }

    // Save answer to hook's state (this updates the answers array)
    try {
      await submitAnswer(answerText);
      setLocalError('');
      return true;
    } catch (err) {
      console.error('Failed to save answer:', err);
      setLocalError('Failed to save answer. Please try again.');
      return false;
    }
  };

  // Auto move to next question when time runs out
  const handleAutoNext = async () => {
    if (await saveCurrentAnswer()) {
      handleNext();
    }
  };

  const handleNext = async () => {
    // Save current answer first
    if (!(await saveCurrentAnswer())) {
      return;
    }

    if (isLastQuestion) {
      // Submit all answers
      handleCompleteInterview();
    } else {
      // Move to next question
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    // Go back to previous question without requiring answer validation
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleCompleteInterview = async () => {
    // Validate all questions are answered
    const allAnswered = answers.every(ans => ans && ans.trim().length > 0);
    if (!allAnswered) {
      setLocalError('Please answer all questions before completing the interview');
      return;
    }

    // Stop video recording if active
    if (enableVideo) {
      stopVideoRecording();
    }

    setSubmitting(true);
    try {
      await completeInterview();
      setInterviewCompleted(true);
      navigate('/interview-results');
    } catch (err) {
      setLocalError(err.response?.data?.error?.message || 'Failed to complete interview');
      console.error('Failed to complete interview:', err);
      setSubmitting(false);
    }
  };

  // Video recording handlers
  const getBestMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Using MIME type:', type);
        return type;
      }
    }
    return '';
  };

  const startVideoRecording = async () => {
    try {
      console.log('Starting video recording...');
      const constraints = {
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', stream);
      
      // Set enableVideo to true FIRST so the video element is rendered
      setEnableVideo(true);
      
      // Then set the stream - the useEffect will attach it to the element
      setMediaStream(stream);

      // Get best supported MIME type
      const mimeType = getBestMimeType();
      
      // Create and configure MediaRecorder
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeTypeForBlob = mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeTypeForBlob });
        const videoUrl = URL.createObjectURL(blob);
        console.log('Video blob created, size:', blob.size);
        setRecordedVideo(videoUrl);
        setShowVideoPlayback(true);
      };

      mediaRecorder.onerror = (event) => {
        console.error('Recording error:', event.error);
        setLocalError('Error during video recording: ' + event.error);
      };

      mediaRecorder.start();
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start video recording:', err);
      if (err.name === 'NotAllowedError') {
        setLocalError('Camera/microphone permission denied. Please check your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setLocalError('No camera/microphone found on your device.');
      } else {
        setLocalError('Error accessing camera/microphone: ' + err.message);
      }
      handleVideoError(err);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setEnableVideo(false);
  };

  const toggleVideoMode = async () => {
    if (!isCameraSupported()) {
      setLocalError('Video recording is not supported on your device');
      return;
    }

    if (enableVideo) {
      stopVideoRecording();
    } else {
      await startVideoRecording();
    }
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    if (error.name === 'NotAllowedError') {
      setLocalError('Camera permission denied');
    } else if (error.name === 'NotFoundError') {
      setLocalError('No camera found');
    } else {
      setLocalError('Video error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview in Progress</h1>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentInterview.numberOfQuestions}</p>
              </div>
              <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-indigo-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-32 space-y-6">
          {(error || localError) && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {localError || error}
            </div>
          )}

          {/* Question Display */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-2xl font-bold text-gray-900">Question {currentQuestionIndex + 1}</h2>
                <div className="flex items-center gap-3">
                  <SpeakButton text={question} size="md" />
                  {isCameraSupported() && (
                    <button
                      onClick={toggleVideoMode}
                      className={`p-3 rounded-lg font-bold transition-all ${
                        enableVideo
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      title={enableVideo ? 'Stop Video Recording' : 'Start Video Recording'}
                    >
                      <Video size={20} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">{question}</p>
            </div>

            {/* Answer Textarea */}
            <div className="space-y-4">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here... (minimum 10 characters)"
                className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                disabled={submitting}
              />

              {/* Voice Recorder */}
              <VoiceRecorder
                onTranscript={(transcript) => {
                  setAnswerText((prev) => prev + (prev ? ' ' : '') + transcript);
                }}
                onError={(error) => {
                  setLocalError(error);
                }}
                autoInsert={true}
              />

              {/* Video Recording Section */}
              {enableVideo && (
                <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-400">
                  <video
                    ref={videoElementRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-black object-cover"
                  />
                  <div className="bg-blue-500 text-white p-2 text-center text-sm font-bold">
                    🔴 Recording in progress... Click Video button to stop
                  </div>
                </div>
              )}

              {showVideoPlayback && recordedVideo && (
                <VideoPlayback
                  videoUrl={recordedVideo}
                  onRetake={() => {
                    setRecordedVideo(null);
                    setShowVideoPlayback(false);
                    startVideoRecording();
                  }}
                  onSave={() => {
                    setShowVideoPlayback(false);
                    // Video is saved in state, ready to submit with answer
                  }}
                />
              )}

              <div className="flex justify-between items-center gap-4">
                <span className="text-sm text-gray-600">{answerText.length} characters</span>
                <div className="flex gap-3">
                  {currentQuestionIndex > 0 && (
                    <button
                      onClick={handlePrevious}
                      disabled={submitting}
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        submitting
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-lg'
                      }`}
                    >
                      {submitting ? 'Processing...' : '← Previous'}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={submitting || answerText.trim().length < 10}
                    className={`px-8 py-3 rounded-lg font-bold transition-all ${
                      submitting || answerText.trim().length < 10
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isLastQuestion
                        ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                    }`}
                  >
                    {submitting ? 'Processing...' : isLastQuestion ? 'Complete Interview' : 'Next Question →'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {currentInterview.questions.map((_, idx) => {
                const isAnswered = answers[idx] && answers[idx].trim().length > 0;
                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    disabled={loading}
                    title={isAnswered ? `Question ${idx + 1} - Answered` : `Question ${idx + 1} - Not answered`}
                    className={`aspect-square rounded-lg font-bold transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-indigo-600 text-white shadow-lg scale-110'
                        : isAnswered
                        ? 'bg-green-200 text-green-800 hover:bg-green-300'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              <span className="inline-block w-3 h-3 bg-green-200 rounded mr-2"></span>Answered
              <span className="inline-block w-3 h-3 bg-red-100 rounded mx-2 ml-4"></span>Not Answered
              <span className="inline-block w-3 h-3 bg-indigo-600 rounded mx-2 ml-4"></span>Current
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
