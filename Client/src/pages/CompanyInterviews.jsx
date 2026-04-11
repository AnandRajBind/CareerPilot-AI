import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'

const CompanyInterviews = () => {
  const [interviews, setInterviews] = useState([])
  const [filteredInterviews, setFilteredInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [interviews, searchTerm, statusFilter, roleFilter])

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/interviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInterviews(data.interviews || [])
      }
    } catch (error) {
      toast.error('Failed to load interviews', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.interviewType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter)
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((i) => i.jobRole === roleFilter)
    }

    setFilteredInterviews(filtered)
  }

  const deleteInterview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview?')) {
      return
    }

    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/interviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setInterviews((prev) => prev.filter((i) => i._id !== id))
        toast.success('Interview deleted successfully', {
          position: 'top-right',
          autoClose: 3000,
        })
      } else {
        toast.error('Failed to delete interview', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error('Error deleting interview', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setDeleting(null)
    }
  }

  const uniqueRoles = [...new Set(interviews.map((i) => i.jobRole).filter(Boolean))]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
            <p className="text-gray-600 mt-1">Manage all interview templates and instances</p>
          </div>
          <Link
            to="/dashboard/create-interview"
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition font-medium"
          >
            + New Interview
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by role or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex-1">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Interviews Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading interviews...</div>
          ) : filteredInterviews.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                {interviews.length === 0 ? 'No interviews yet.' : 'No interviews match your filters.'}
              </p>
              {interviews.length === 0 && (
                <Link
                  to="/dashboard/create-interview"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Create your first interview template
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Level
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Score
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((interview) => (
                    <tr
                      key={interview._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                        {interview.jobRole || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {interview.interviewType || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {interview.experienceLevel || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            interview.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : interview.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {interview.status?.charAt(0).toUpperCase() + interview.status?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                        {interview.evaluation?.score ? `${interview.evaluation.score}%` : '—'}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        <button
                          onClick={() => deleteInterview(interview._id)}
                          disabled={deleting === interview._id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                          title="Delete interview"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {interviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Total Interviews</p>
              <p className="text-2xl font-bold text-blue-900">{interviews.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {interviews.filter((i) => i.status === 'completed').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">
                {interviews.filter((i) => i.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Unique Roles</p>
              <p className="text-2xl font-bold text-purple-900">{uniqueRoles.length}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default CompanyInterviews
