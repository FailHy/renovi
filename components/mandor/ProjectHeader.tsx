import { Project, Mandor } from './type'

interface ProjectHeaderProps {
  project: Project
  mandor: Mandor
}

export function ProjectHeader({ project, mandor }: ProjectHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {project.nama}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {project.tipeLayanan}
            </span>
            <span className="text-gray-600 text-sm">
              📍 {project.alamat}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg px-4 py-3">
          <div className="text-right">
            <p className="font-medium text-gray-900 text-sm">
              {mandor.nama}
            </p>
            <p className="text-xs text-gray-500">
              Mandor Bertanggung Jawab
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {getInitials(mandor.nama)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}