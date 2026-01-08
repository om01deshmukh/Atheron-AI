import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET /api/sessions/[id]/messages - Get messages for a session
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: sessionId } = await params;

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST /api/sessions/[id]/messages - Save a message
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: sessionId } = await params;
        const { role, content } = await req.json();

        if (!role || !content) {
            return NextResponse.json({ error: 'Role and content required' }, { status: 400 });
        }

        // Save message
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                session_id: sessionId,
                role,
                content,
            })
            .select()
            .single();

        if (error) throw error;

        // Update session's updated_at and title (if first message)
        const titleUpdate = role === 'user' ? {
            updated_at: new Date().toISOString(),
            title: content.slice(0, 50) + (content.length > 50 ? '...' : '')
        } : { updated_at: new Date().toISOString() };

        await supabase
            .from('chat_sessions')
            .update(titleUpdate)
            .eq('id', sessionId);

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error saving message:', error);
        return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }
}
