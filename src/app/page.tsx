"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useUser, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import { AtheronChat } from "@/components/atheron-chat";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getOrCreateUser, getChatSessions, getMessages, createChatSession, saveMessage, generateChatTitle, ChatSession } from "@/lib/db";
import { User, Message } from "@/lib/supabase";

const ChatApp = dynamic(() => Promise.resolve(ChatAppComponent), {
  ssr: false,
});

function ChatAppComponent() {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [chatKey, setChatKey] = useState(0);
  const [shouldLoadMessages, setShouldLoadMessages] = useState(false);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  // Sync Clerk user to Supabase
  useEffect(() => {
    async function syncUser() {
      if (isLoaded && clerkUser) {
        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const name = clerkUser.fullName || clerkUser.firstName || "";
        const avatar = clerkUser.imageUrl || "";
        const user = await getOrCreateUser(clerkUser.id, email, name, avatar);
        setDbUser(user);
      }
    }
    syncUser();
  }, [clerkUser, isLoaded]);

  // Load chat sessions when user is available
  const loadSessions = useCallback(async () => {
    if (dbUser) {
      setIsLoadingSessions(true);
      const userSessions = await getChatSessions(dbUser.id);
      setSessions(userSessions);
      setIsLoadingSessions(false);
    }
  }, [dbUser]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load messages when explicitly triggered
  useEffect(() => {
    async function loadSessionMessages() {
      if (shouldLoadMessages && currentSessionId) {
        const messages = await getMessages(currentSessionId);
        setLoadedMessages(messages);
        setChatKey(prev => prev + 1);
        setShouldLoadMessages(false);
      }
    }
    loadSessionMessages();
  }, [shouldLoadMessages, currentSessionId]);

  // Start new chat
  const handleNewChat = () => {
    console.log('[page] handleNewChat called');
    setCurrentSessionId(null);
    setLoadedMessages([]);
    setShouldLoadMessages(false);
    setChatKey(prev => prev + 1);
    // Force page reload to fully reset assistant-ui thread
    window.location.href = window.location.pathname;
  };

  // Select existing session - triggers message loading
  const handleSelectSession = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
      setLoadedMessages([]); // Clear while loading
      setShouldLoadMessages(true); // Trigger load
    }
  };

  const handleSessionDeleted = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Called when user sends a message (new chat only)
  const handleUserMessage = async (content: string) => {
    if (!dbUser) return null;

    let sessionId = currentSessionId;

    // Create new session if needed
    if (!sessionId) {
      const title = generateChatTitle(content);
      const newSession = await createChatSession(dbUser.id, title);
      if (newSession) {
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        setSessions(prev => [newSession, ...prev]);
        // DON'T trigger message loading - this is a new session
      }
    }

    if (sessionId) {
      await saveMessage(sessionId, 'user', content);
    }

    return sessionId;
  };

  // Called when assistant responds
  const handleAssistantMessage = async (content: string, sessionId: string | null) => {
    if (sessionId) {
      await saveMessage(sessionId, 'assistant', content);
    }
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <AppSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onSessionDeleted={handleSessionDeleted}
          isLoading={isLoadingSessions}
        />
        <SidebarInset>
          <div className="fixed top-4 left-4 z-50 lg:hidden">
            <SidebarTrigger className="size-10 bg-sidebar/80 backdrop-blur-sm rounded-lg border border-sidebar-border [&_svg]:size-6" />
          </div>
          <main className="flex-1 flex flex-col overflow-hidden">
            <AtheronChat
              key={chatKey}
              loadedMessages={loadedMessages}
              currentSessionId={currentSessionId}
              onUserMessage={handleUserMessage}
              onAssistantMessage={handleAssistantMessage}
              onNewChat={handleNewChat}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
}

export default function Home() {
  return (
    <>
      <SignedIn>
        <ChatApp />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-sidebar border border-sidebar-border shadow-2xl",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton:
                  "bg-sidebar-accent border-sidebar-border text-foreground hover:bg-sidebar-accent/80",
                formFieldLabel: "text-foreground",
                formFieldInput:
                  "bg-background border-sidebar-border text-foreground",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        </div>
      </SignedOut>
    </>
  );
}
