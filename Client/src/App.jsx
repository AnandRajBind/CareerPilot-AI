import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { InterviewProvider } from './context/InterviewContext'
import { MediaProvider } from './context/MediaContext'
import { StreamProvider } from './context/StreamContext'
import Navbar from './components/Navbar'
import VideoInterviewRoom from './components/VideoInterviewRoom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import InterviewMode from './pages/InterviewMode'
import SystemCheck from './pages/SystemCheck'
import InterviewScreen from './pages/InterviewScreen'
import InterviewResults from './pages/InterviewResults'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import CompanyInterviews from './pages/CompanyInterviews'
import CreateInterviewTemplate from './pages/CreateInterviewTemplate'
import AdminResults from './pages/AdminResults'
import AdminBilling from './pages/AdminBilling'
import InterviewSession from './pages/InterviewSession'
import PublicSystemCheck from './pages/PublicSystemCheck'
import PublicInterviewScreen from './pages/PublicInterviewScreen'
import PublicInterviewResults from './pages/PublicInterviewResults'
import InterviewSuccess from './pages/InterviewSuccess'
import MockInterview from './pages/MockInterview'
import PublicInterview from './pages/PublicInterview'

// Component to conditionally render navbar based on route
const NavbarWrapper = () => {
  const location = useLocation()
  
  // Hide navbar on interview pages (success, video, system-check, session, and public interviews)
  if (location.pathname === '/interview/success' || 
      location.pathname === '/mock-interview' ||
      location.pathname === '/public-interview' ||
      location.pathname.match(/^\/interview\/session\/.*\/video$/) ||
      location.pathname.match(/^\/interview\/session\/.*\/system-check$/) ||
      location.pathname.match(/^\/interview\/session\/[a-f0-9]+$/)) {
    return null
  }
  
  return <Navbar />
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StreamProvider>
          <MediaProvider>
            <InterviewProvider>
            <NavbarWrapper />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Mock Interview for Students (No Auth Required) */}
                <Route path="/mock-interview" element={<MockInterview />} />
                <Route path="/public-interview" element={<PublicInterview />} />
                
                {/* Candidate Features */}
                <Route path="/candidate-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/interview-mode" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
                <Route path="/system-check" element={<ProtectedRoute><SystemCheck /></ProtectedRoute>} />
                <Route path="/interview-screen" element={<ProtectedRoute><InterviewScreen /></ProtectedRoute>} />
                <Route path="/interview-results" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
                
                {/* Public Interview Session (via template token) */}
                <Route path="/interview/session/:token" element={<InterviewSession />} />
                <Route path="/interview/session/:token/system-check" element={<PublicSystemCheck />} />
                <Route path="/interview/session/:token/video" element={<VideoInterviewRoom />} />
                <Route path="/interview/session/:token/screen" element={<PublicInterviewScreen />} />
                <Route path="/interview/session/:token/results" element={<PublicInterviewResults />} />
                <Route path="/interview/success" element={<InterviewSuccess />} />
                
                {/* Company Admin Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/interviews" element={<ProtectedRoute><CompanyInterviews /></ProtectedRoute>} />
                <Route path="/dashboard/create-interview" element={<ProtectedRoute><CreateInterviewTemplate /></ProtectedRoute>} />
                <Route path="/dashboard/results" element={<ProtectedRoute><AdminResults /></ProtectedRoute>} />
                <Route path="/dashboard/billing" element={<ProtectedRoute><AdminBilling /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            </InterviewProvider>
          </MediaProvider>
        </StreamProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
