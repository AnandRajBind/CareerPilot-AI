import React from 'react'

const TranscriptPanel = ({ transcript = [] }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <h3 className="text-white font-semibold text-sm">Interview Transcript</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Questions and answers will appear here...
          </p>
        ) : (
          transcript.map((item, index) => (
            <div key={index} className="space-y-2">
              {/* AI Question */}
              <div className="flex gap-2">
                <span className="text-blue-400 font-semibold flex-shrink-0">AI:</span>
                <p className="text-gray-300 text-sm">{item.question}</p>
              </div>

              {/* Candidate Answer */}
              {item.answer && (
                <div className="flex gap-2 ml-4">
                  <span className="text-green-400 font-semibold flex-shrink-0">You:</span>
                  <p className="text-gray-400 text-sm italic">{item.answer}</p>
                </div>
              )}

              <div className="border-b border-gray-700 mt-2"></div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TranscriptPanel
