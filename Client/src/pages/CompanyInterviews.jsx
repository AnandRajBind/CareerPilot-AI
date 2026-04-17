import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Copy, Share2 } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../components/AdminLayout'

const CompanyInterviews = () => {
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)
  const [shareModal, setShareModal] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, roleFilter])

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/interviews/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data.templates || [])
      }
    } catch (error) {
      toast.error('Failed to load templates', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((t) => t.jobRole === roleFilter)
    }

    setFilteredTemplates(filtered)
  }

  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return
    }

    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/company/interviews/template/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t._id !== id))
        toast.success('Template deleted successfully', {
          position: 'top-right',
          autoClose: 3000,
        })
      } else {
        toast.error('Failed to delete template', {
          position: 'top-right',
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.error('Error deleting template', {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setDeleting(null)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!', {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const uniqueRoles = [...new Set(templates.map((t) => t.jobRole).filter(Boolean))]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Templates</h1>
            <p className="text-gray-600 mt-1">Create and manage interview templates for candidates</p>
          </div>
          <Link
            to="/dashboard/create-interview"
            className="inline-flex items-center justify-center bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition font-medium"
          >
            + New Template
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by template name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
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

        {/* Templates Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">
                {templates.length === 0 ? 'No templates yet.' : 'No templates match your filters.'}
              </p>
              {templates.length === 0 && (
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
                      Template Name
                    </th>
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
                      Used
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template) => (
                    <tr
                      key={template._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                        {template.templateName}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {template.jobRole}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {template.interviewType}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {template.experienceLevel}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-900">
                        {template.usageCount || 0}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShareModal(template)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Share template"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template._id)}
                            disabled={deleting === template._id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                            title="Delete template"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Total Templates</p>
              <p className="text-2xl font-bold text-blue-900">{templates.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Total Uses</p>
              <p className="text-2xl font-bold text-purple-900">
                {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Unique Roles</p>
              <p className="text-2xl font-bold text-green-900">{uniqueRoles.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Share Interview Template</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Interview Link</p>
                <p className="text-xs text-gray-500 mb-2">
                  Candidates can open this link without logging in
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/interview/session/${shareModal.uniqueToken}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(`${window.location.origin}/interview/session/${shareModal.uniqueToken}`)
                    }
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ✓ This link is active and ready to share with candidates
                </p>
              </div>

              <button
                onClick={() => setShareModal(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default CompanyInterviews
