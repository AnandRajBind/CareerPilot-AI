import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { InterviewProvider } from './context/InterviewContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import InterviewMode from './pages/InterviewMode'
import InterviewScreen from './pages/InterviewScreen'
import InterviewResults from './pages/InterviewResults'

function App() {
  return (
    <Router>
      <AuthProvider>
        <InterviewProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/interview-mode" element={<ProtectedRoute><InterviewMode /></ProtectedRoute>} />
              <Route path="/interview-screen" element={<ProtectedRoute><InterviewScreen /></ProtectedRoute>} />
              <Route path="/interview-results" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </InterviewProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
