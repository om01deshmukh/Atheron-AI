"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { AtheronChat } from "@/components/atheron-chat";

export default function Home() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="relative z-10 min-h-screen flex flex-col">
        <AtheronChat />
      </main>
    </AssistantRuntimeProvider>
  );
}
