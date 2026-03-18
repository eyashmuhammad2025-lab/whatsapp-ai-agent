interface Conversation {
  id: string
  phone_number: string
  created_at: string
  updated_at: string
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
  loading: boolean
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationSidebarProps) {
const SKELETON_COUNT = 5

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-2 rounded w-3/4" />
                <div className="h-2 bg-surface-2 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 text-sm">
          <p>No conversations yet</p>
          <p className="mt-1 text-xs">Messages will appear here when customers send them</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        Conversations ({conversations.length})
      </div>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left ${
            selectedId === conversation.id ? 'bg-surface-2 border-r-2 border-primary' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
            {conversation.phone_number.slice(-2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground truncate">
                {conversation.phone_number}
              </p>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatRelativeTime(conversation.updated_at)}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">Customer conversation</p>
          </div>
        </button>
      ))}
    </div>
  )
}
