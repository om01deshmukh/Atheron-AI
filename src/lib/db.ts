import { supabase, User, ChatSession, Message } from './supabase'
export type { ChatSession } from './supabase'

// =============================================
// USER FUNCTIONS
// =============================================

export async function getOrCreateUser(clerkId: string, email: string, name?: string, avatarUrl?: string): Promise<User | null> {
    // First, try to find existing user
    const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single()

    if (existingUser) {
        return existingUser as User
    }

    // Create new user if not found
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            clerk_id: clerkId,
            email,
            name: name || null,
            avatar_url: avatarUrl || null,
        })
        .select()
        .single()

    if (createError) {
        console.error('Error creating user:', JSON.stringify(createError, null, 2))
        return null
    }

    return newUser as User
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single()

    if (error) {
        console.error('Error fetching user:', error)
        return null
    }

    return data as User
}

// =============================================
// CHAT SESSION FUNCTIONS
// =============================================

export async function createChatSession(userId: string, title: string = 'New Chat'): Promise<ChatSession | null> {
    const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
            user_id: userId,
            title,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating chat session:', error)
        return null
    }

    return data as ChatSession
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching chat sessions:', error)
        return []
    }

    return data as ChatSession[]
}

export async function updateChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
    const { error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId)

    if (error) {
        console.error('Error updating chat session title:', error)
        return false
    }

    return true
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

    if (error) {
        console.error('Error deleting chat session:', error)
        return false
    }

    return true
}

// =============================================
// MESSAGE FUNCTIONS
// =============================================

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<Message | null> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            session_id: sessionId,
            role,
            content,
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving message:', error)
        return null
    }

    // Update session's updated_at timestamp
    await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)

    return data as Message
}

export async function getMessages(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return data as Message[]
}

// =============================================
// HELPER FUNCTIONS
// =============================================

export function generateChatTitle(firstMessage: string): string {
    // Take first 50 characters of the message as the title
    const title = firstMessage.trim().slice(0, 50)
    return title.length < firstMessage.length ? `${title}...` : title
}
