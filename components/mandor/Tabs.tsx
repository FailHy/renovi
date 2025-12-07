interface TabsProps {
  activeTab: 'info' | 'milestone' | 'bahan'
  onTabChange: (tab: 'info' | 'milestone' | 'bahan') => void
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { id: 'info' as const, label: 'Informasi Proyek' },
    { id: 'milestone' as const, label: 'Milestone' },
    { id: 'bahan' as const, label: 'Bahan Harian'}
  ]

  return (
    <div className="flex gap-1 mb-6 p-1 bg-white rounded-lg shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-blue-50 text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}