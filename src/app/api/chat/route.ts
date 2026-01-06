import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

// Create Perplexity client using OpenAI-compatible provider
const perplexity = createOpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: "https://api.perplexity.ai",
});

// Optimized prompt (~180 tokens vs ~400 before)
const ATHEY_SYSTEM_PROMPT = `You are Athey, Atheron's STEM AI assistant focused on space/cosmos.

SCOPE: Space (NASA/ISRO/SpaceX/ESA), Science, Technology, Engineering, Mathematics.

RULES:
- Use web search for current data
- NO inline citations like [1][2] in text
- LaTeX math: $inline$ $$block$$

END every response with sources (2-4 real URLs):
<!-- SOURCES_START -->
[{"domain":"nasa.gov","title":"Page Title","url":"https://real-url.com","description":"Brief desc"}]
<!-- SOURCES_END -->`;

// Extract text from assistant-ui message format
function extractText(msg: Record<string, unknown>): string {
    if (typeof msg.content === "string") return msg.content;

    if (Array.isArray(msg.parts)) {
        return msg.parts
            .filter((p: unknown) => p && typeof p === "object" && (p as Record<string, unknown>).type === "text")
            .map((p: unknown) => ((p as Record<string, unknown>).text as string) || "")
            .join("");
    }

    if (Array.isArray(msg.content)) {
        return msg.content
            .filter((p: unknown) => p && typeof p === "object" && (p as Record<string, unknown>).type === "text")
            .map((p: unknown) => ((p as Record<string, unknown>).text as string) || "")
            .join("");
    }

    return "";
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Convert to standard format
    const formattedMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const msg of messages) {
        const text = extractText(msg as Record<string, unknown>);
        if (text && (msg.role === "user" || msg.role === "assistant")) {
            formattedMessages.push({ role: msg.role, content: text });
        }
    }

    if (formattedMessages.length === 0) {
        return new Response(JSON.stringify({ error: "No messages" }), { status: 400 });
    }

    // Use Vercel AI SDK's streamText with proper model config
    const result = streamText({
        model: perplexity.chat("sonar"),
        system: ATHEY_SYSTEM_PROMPT,
        messages: formattedMessages,
    });

    // Return in format compatible with assistant-ui
    return result.toUIMessageStreamResponse();
}
