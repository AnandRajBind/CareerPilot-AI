import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowRight, Zap, Users, BarChart3, Brain, Lock, MessageSquare, Sparkles } from 'lucide-react'
import FeatureCard from '../components/FeatureCard'

const Home = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* SECTION 1: HERO SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 py-16 md:py-28 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
                  <span className="text-sm font-semibold text-blue-200">🚀 AI-Powered Interview Platform</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Perekrut AI
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    AI Interviews for Everyone
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg">
                  Conduct real-world AI interviews for recruitment or practice mock interviews as a student. Powered by advanced AI technology.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/interview-session')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Mock Interview <ArrowRight size={20} />
                </button>
                
                {!isAuthenticated ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Recruiter Login
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-blue-400">10K+</div>
                  <p className="text-gray-400 text-sm mt-1">Students Trained</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">500+</div>
                  <p className="text-gray-400 text-sm mt-1">AI Questions</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">98%</div>
                  <p className="text-gray-400 text-sm mt-1">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Card */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-2xl blur-2xl"></div>
                <div className="relative bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={18} className="text-yellow-400" />
                    <p className="text-sm font-semibold text-white">AI Interview Session</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Question 4 of 5</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-3">
                        Design a scalable system architecture
                      </p>
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                          <p className="text-sm text-gray-300">I would use microservices architecture with load balancing...</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <div className="h-2 bg-green-500/30 rounded flex-1"></div>
                          <div className="h-2 bg-green-500/30 rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PLATFORM MODULES */}
      <section className="py-16 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Two Powerful Platforms</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're hiring or interviewing, Perekrut AI has the right solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: For Recruiters */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Interviews for Recruiters</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create AI-powered interviews, automatically evaluate candidates' responses, and get detailed performance analytics. Save time while improving hiring quality.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">Create custom AI interviews in minutes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">Auto-evaluation with instant results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">Advanced analytics & insights</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Card 2: For Students */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <Brain size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Mock Interviews for Students</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice real interview questions for free. Receive instant AI feedback, track your progress, and build confidence before your actual interview.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">100% free, no registration needed</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">Real-time AI feedback</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                    <span className="text-gray-700">Track improvement over time</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/interview-session')}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start Free Practice Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-16 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recruiter Flow */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">For Recruiters</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">1</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Interview Template</h4>
                    <p className="text-gray-600">Define job role, difficulty level, and number of questions. AI generates relevant interview questions automatically.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Invite & Share</h4>
                    <p className="text-gray-600">Send interview link to candidates. They don't need to register—just start the interview immediately.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">3</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Evaluates Instantly</h4>
                    <p className="text-gray-600">Our AI analyzes answers for technical accuracy, communication skills, and problem-solving approach.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">4</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h4>
                    <p className="text-gray-600">Get detailed performance reports, compare candidates, and make data-driven hiring decisions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Flow */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">For Students</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white font-bold text-lg">1</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Details</h4>
                    <p className="text-gray-600">Just fill in your name, roll number, and college. No registration or payment required.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white font-bold text-lg">2</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Mock Interview</h4>
                    <p className="text-gray-600">Answer AI-generated interview questions based on your role and experience level.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white font-bold text-lg">3</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Instant Feedback</h4>
                    <p className="text-gray-600">Receive detailed AI-powered feedback on your answers, highlighting strengths and improvement areas.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white font-bold text-lg">4</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Practice & Improve</h4>
                    <p className="text-gray-600">Take unlimited interviews and track your progress to build confidence before real interviews.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY PEREKRUT AI */}
      <section className="py-16 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Perekrut AI</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge technology to deliver the best interview experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="AI-Powered Interviews"
              description="Advanced AI generates real-world questions and evaluates answers instantly with accuracy."
              gradient={true}
            />
            <FeatureCard
              icon={Brain}
              title="Adaptive Difficulty"
              description="Questions adjust in real-time based on your performance for optimal learning experience."
            />
            <FeatureCard
              icon={BarChart3}
              title="Performance Analytics"
              description="Get detailed insights on your strengths, weaknesses, and areas for improvement."
              gradient={true}
            />
            <FeatureCard
              icon={Users}
              title="Multi-Role Interviews"
              description="Practice interviews for various job roles including tech, non-tech, and specialized positions."
            />
            <FeatureCard
              icon={Lock}
              title="Secure & Private"
              description="All data is encrypted and stored securely. Your privacy is our top priority."
              gradient={true}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Instant AI Feedback"
              description="Get actionable feedback immediately after each interview to accelerate your growth."
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 py-16 md:py-28 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Your AI Interview Journey Today
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Whether you're a recruiter looking to hire better or a student wanting to practice, Perekrut AI is here to help you succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/interview-session')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Mock Interview <ArrowRight size={20} />
            </button>
            
            {!isAuthenticated ? (
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Recruiter Sign Up
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
