import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Ensure user exists in Supabase, synced with Clerk
async function ensureUser(clerkId: string) {
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

    if (existingUser) return existingUser.id;

    const user = await currentUser();
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            clerk_id: clerkId,
            email: user?.emailAddresses?.[0]?.emailAddress || null,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
            avatar_url: user?.imageUrl || null,
        })
        .select('id')
        .single();

    if (error) throw error;
    return newUser.id;
}

// GET /api/sessions - List all sessions for current user
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUserId = await ensureUser(userId);

        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', dbUserId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

// POST /api/sessions - Create a new session
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await req.json().catch(() => ({ title: 'New Chat' }));
        const dbUserId = await ensureUser(userId);

        const { data: session, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: dbUserId,
                title: title || 'New Chat',
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

// DELETE /api/sessions - Delete a session
export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}
