interface SidebarItem {
  id: string
  label: string
  color: string
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

const sections: SidebarSection[] = [
  {
    title: 'Content Codes',
    items: [
      { id: 'meta', label: 'Meta-Code', color: 'var(--color-meta)' },
      { id: 'text', label: 'Text-Code', color: 'var(--color-content)' },
      { id: 'image', label: 'Image-Code', color: 'var(--color-content)' },
      { id: 'audio', label: 'Audio-Code', color: 'var(--color-content)' },
      { id: 'video', label: 'Video-Code', color: 'var(--color-content)' },
      { id: 'mixed', label: 'Mixed-Code', color: 'var(--color-content)' },
    ],
  },
  {
    title: 'Data & Instance',
    items: [
      { id: 'data', label: 'Data-Code', color: 'var(--color-data)' },
      { id: 'instance', label: 'Instance-Code', color: 'var(--color-instance)' },
    ],
  },
  {
    title: 'Composite',
    items: [
      { id: 'iscc-code', label: 'ISCC-CODE', color: 'var(--color-iscc-code)' },
      { id: 'flake', label: 'Flake-Code', color: 'var(--color-flake)' },
      { id: 'iscc-id', label: 'ISCC-ID', color: 'var(--color-iscc-id)' },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { id: 'codec', label: 'Codec Utils', color: 'var(--medium-gray)' },
      { id: 'inspector', label: 'Code Inspector', color: 'var(--deep-navy)' },
    ],
  },
]

interface Props {
  activeSection: string
  onNavigate: (id: string) => void
}

export default function Sidebar({ activeSection, onNavigate }: Props) {
  return (
    <nav className="sidebar">
      {sections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-label">{section.title}</div>
          {section.items.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-dot" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}
