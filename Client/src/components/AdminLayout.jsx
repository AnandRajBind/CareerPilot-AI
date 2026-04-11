import React, { useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar for Mobile */}
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center gap-4 h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Content Area */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
