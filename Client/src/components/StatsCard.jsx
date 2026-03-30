import React from 'react'

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
}

export default function StatsCard({ icon, label, value, color = 'indigo' }) {
  return (
    <div className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}
