import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, User, FileText, TrendingUp, DollarSign, Menu, X } from 'lucide-react'

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Overview',
      icon: BarChart3,
      exact: true,
    },
    {
      path: '/dashboard/interviews',
      label: 'Interviews',
      icon: FileText,
    },
    {
      path: '/dashboard/create-interview',
      label: 'Create Template',
      icon: User,
    },
    {
      path: '/dashboard/results',
      label: 'Results',
      icon: TrendingUp,
    },
    {
      path: '/dashboard/billing',
      label: 'Billing',
      icon: DollarSign,
    },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-white border-r border-gray-200 z-40 transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">Admin</h2>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default AdminSidebar
