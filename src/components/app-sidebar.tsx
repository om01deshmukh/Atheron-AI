"use client"

import * as React from "react"
import {
    MessageSquarePlus,
    Search,
    PanelLeft,
    Trash2,
    MessageSquare,
    Loader2,
    X,
} from "lucide-react"
import Image from "next/image"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { ChatSession } from "@/lib/supabase"
import { deleteChatSession } from "@/lib/db"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    sessions: ChatSession[]
    currentSessionId: string | null
    onSelectSession: (sessionId: string) => void
    onNewChat: () => void
    onSessionDeleted: (sessionId: string) => void
    isLoading?: boolean
}

export function AppSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onSessionDeleted,
    isLoading = false,
    ...props
}: AppSidebarProps) {
    const { state, toggleSidebar, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isSearching, setIsSearching] = React.useState(false)

    const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation()
        setDeletingId(sessionId)
        const success = await deleteChatSession(sessionId)
        if (success) {
            onSessionDeleted(sessionId)
        }
        setDeletingId(null)
    }

    // Filter sessions based on search query
    const filteredSessions = React.useMemo(() => {
        if (!searchQuery.trim()) return sessions
        const query = searchQuery.toLowerCase()
        return sessions.filter(session =>
            session.title.toLowerCase().includes(query)
        )
    }, [sessions, searchQuery])

    return (
        <Sidebar
            collapsible="icon"
            className="group/sidebar"
            {...props}
        >
            {/* Header - Logo and Toggle */}
            <SidebarHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center">
                        <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden">
                            <Image
                                src="/logo.jpeg"
                                alt="Atheron"
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        </div>
                    </a>

                    {/* Toggle Button - Shows on hover when collapsed (desktop only) */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`
                                flex items-center justify-center size-10 rounded-lg 
                                hover:bg-sidebar-accent transition-all duration-200
                                ${isCollapsed
                                    ? 'absolute left-full ml-2 opacity-0 group-hover/sidebar:opacity-100 bg-sidebar border border-sidebar-border shadow-lg z-50'
                                    : ''
                                }
                            `}
                            title={isCollapsed ? "Open Sidebar" : "Close Sidebar"}
                        >
                            <PanelLeft className="size-5" />
                        </button>
                    )}
                </div>
            </SidebarHeader>

            {/* Main Menu */}
            <SidebarContent className="pt-4">
                <SidebarGroup className="px-2">
                    <SidebarMenu className="gap-2">
                        {/* New Chat */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => {
                                    console.log('[Sidebar] New Chat clicked');
                                    onNewChat();
                                }}
                                className="h-11 gap-3 px-3"
                                tooltip="New Chat"
                            >
                                <MessageSquarePlus className="!size-5 shrink-0" />
                                <span className="whitespace-nowrap">New chat</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Search Toggle */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setIsSearching(!isSearching)}
                                className="h-11 gap-3 px-3"
                                tooltip="Search"
                            >
                                <Search className="!size-5 shrink-0" />
                                <span className="whitespace-nowrap">Search chats</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Search Input */}
                {isSearching && (
                    <div className="px-4 py-2 group-data-[collapsible=icon]:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 text-sm bg-sidebar-accent/50 border border-sidebar-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sidebar-accent rounded"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <SidebarGroup className="flex-1 px-2 mt-2 group-data-[collapsible=icon]:hidden overflow-y-auto">
                    <SidebarGroupLabel className="px-3 text-xs font-normal text-sidebar-foreground/60">
                        {searchQuery ? `Results (${filteredSessions.length})` : 'Your chats'}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading ? (
                                <div className="px-3 py-6 flex items-center justify-center">
                                    <Loader2 className="size-5 animate-spin text-sidebar-foreground/40" />
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="px-3 py-6 text-sm text-sidebar-foreground/40 text-center">
                                    {searchQuery ? 'No matching chats' : 'No conversations yet'}
                                </div>
                            ) : (
                                filteredSessions.map((session) => (
                                    <SidebarMenuItem key={session.id} className="group/item relative">
                                        <SidebarMenuButton
                                            onClick={() => onSelectSession(session.id)}
                                            className={`h-10 gap-3 px-3 pr-10 ${currentSessionId === session.id
                                                ? 'bg-sidebar-accent'
                                                : ''
                                                }`}
                                        >
                                            <MessageSquare className="!size-4 shrink-0 text-sidebar-foreground/60" />
                                            <span className="truncate text-sm">
                                                {session.title}
                                            </span>
                                        </SidebarMenuButton>
                                        {/* Delete button positioned absolutely to avoid nesting */}
                                        <button
                                            onClick={(e) => handleDelete(e, session.id)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-destructive/20 rounded transition-all z-10"
                                            title="Delete chat"
                                            disabled={deletingId === session.id}
                                        >
                                            {deletingId === session.id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="size-4 text-destructive" />
                                            )}
                                        </button>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
