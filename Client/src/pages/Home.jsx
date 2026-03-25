import React from 'react'
import { useAuth } from '../hooks/useAuth'

const Home = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                  Master Every Interview
                </h1>
                <p className="text-lg text-gray-600">
                  Get AI-powered interview preparation with personalized feedback, adaptive difficulty levels, and real-world questions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition">
                      Start Interview
                    </button>
                    <button className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                      View History
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/register"
                      className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition text-center"
                    >
                      Get Started Free
                    </a>
                    <a
                      href="/login"
                      className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition text-center"
                    >
                      Sign In
                    </a>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-300">
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <p className="text-gray-600 text-sm">Users</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">500+</div>
                  <p className="text-gray-600 text-sm">Questions</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <p className="text-gray-600 text-sm">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4 mt-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Question 1 of 5</p>
                      <p className="font-semibold text-gray-800 mb-3">
                        How would you optimize database query performance?
                      </p>
                      <textarea
                        readOnly
                        value="I would implement proper indexing strategies, analyze query execution plans, and cache frequently accessed data..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 h-20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        Skip
                      </button>
                      <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primaryDark transition">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark text-center mb-12">
            Why Choose CareerPilot?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced AI generates role-specific questions and provides intelligent feedback on your answers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Adaptive Learning</h3>
              <p className="text-gray-600">
                Difficulty adjusts based on your performance to provide optimal challenge and growth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Instant Feedback</h3>
              <p className="text-gray-600">
                Get immediate, detailed feedback on every answer to improve faster.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Multiple Roles</h3>
              <p className="text-gray-600">
                Prepare for frontend, backend, fullstack, and specialized positions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your improvement over time with detailed performance analytics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-light rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and kept private. No sharing without permission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-12 md:py-24 bg-gradient-to-r from-primary to-secondary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to ace your next interview?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of professionals who have improved their interview skills.
            </p>
            <a
              href="/register"
              className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:shadow-lg transition"
            >
              Start Your Free Trial
            </a>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
