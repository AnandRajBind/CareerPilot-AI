import React from 'react'

const FeatureCard = ({ icon: Icon, title, description, gradient = false }) => {
  return (
    <div className={`p-8 rounded-xl border transition-all duration-300 hover:shadow-lg ${
      gradient 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start space-x-4">
        {Icon && (
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Icon size={24} />
            </div>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard
