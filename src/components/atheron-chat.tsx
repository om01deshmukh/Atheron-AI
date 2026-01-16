"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    ThreadPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    useThread,
    useThreadRuntime,
    useMessage,
} from "@assistant-ui/react";
import { ArrowRight, Sparkles, RotateCcw, X, ExternalLink, Copy, Share2, Download, RefreshCw, Check, LogOut } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from "@clerk/nextjs";
import { createChatSession, saveMessage, updateChatSessionTitle, generateChatTitle } from "@/lib/db";
import { ChatSession, Message } from "@/lib/supabase";
import TTSControls from "@/components/TTSControls";
import VoiceInput from "@/components/VoiceInput";
import { useTTS } from "@/hooks/useTTS";

// ============ VOICE CONTEXT ============
interface VoiceContextType {
    autoReadResponse: boolean;
    setAutoReadResponse: (value: boolean) => void;
}
const VoiceContext = React.createContext<VoiceContextType>({ autoReadResponse: false, setAutoReadResponse: () => { } });


// ============ TYPES ============
interface Source {
    domain: string;
    title: string;
    url: string;
    description: string;
}

// ============ VIDEO BACKGROUND ============
function VideoBackground() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (video.currentTime >= 7) {
                video.currentTime = 0;
            }
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.play().catch(() => { });

        return () => video.removeEventListener("timeupdate", handleTimeUpdate);
    }, []);

    return (
        <div className="video-bg-container">
            <video ref={videoRef} autoPlay muted loop playsInline className="video-bg">
                <source src="/background.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay" />
        </div>
    );
}

// ============ TYPEWRITER TEXT ============
function TypewriterText({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState("");
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        let index = 0;
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                if (index <= text.length) {
                    setDisplayText(text.slice(0, index));
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 80);
        }, 600);
        return () => clearTimeout(timer);
    }, [text]);

    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <span className="text-[#483AA0]">{displayText}</span>
            <span style={{ opacity: cursorVisible ? 1 : 0, color: '#483AA0' }}>|</span>
        </>
    );
}

// ============ LOADING ANIMATION ============
function LoadingAnimation() {
    const [charIndex, setCharIndex] = useState(0);
    const text = "Hold on, travelling at the speed of light...";

    useEffect(() => {
        const interval = setInterval(() => {
            setCharIndex(prev => {
                if (prev >= text.length) {
                    // Reset after a pause
                    setTimeout(() => setCharIndex(0), 500);
                    return prev;
                }
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-animation">
            <div className="loading-text">
                {text.split('').map((char, i) => (
                    <span
                        key={i}
                        className={i < charIndex ? 'loading-char-visible' : 'loading-char-hidden'}
                    >
                        {char}
                    </span>
                ))}
            </div>
            <div className="loading-dots">
                <span className="loading-dot" style={{ animationDelay: '0ms' }}>.</span>
                <span className="loading-dot" style={{ animationDelay: '200ms' }}>.</span>
                <span className="loading-dot" style={{ animationDelay: '400ms' }}>.</span>
            </div>
        </div>
    );
}

// ============ PARSE SOURCES FROM CONTENT ============
function parseSourcesFromContent(content: string): { cleanContent: string; sources: Source[] } {
    if (!content.includes("<!-- SOURCES_START -->")) {
        // Quick path: just strict replace citation numbers if any, or skip if mostly unlikely?
        // Let's at least do the cheap cleanup or return early if needed.
        // Actually, the regex for sources block is heavy. If not present, skip it.
        // But we still need to clean citation numbers [1].
        let cleanContent = content.replace(/\[\d+\]/g, '').replace(/  +/g, ' ').trim();
        return { cleanContent, sources: [] };
    }
    const sourcesMatch = content.match(/<!-- SOURCES_START -->([\s\S]*?)<!-- SOURCES_END -->/);

    let cleanContent = content;
    let sources: Source[] = [];

    // Remove the sources block (always strip the markers, even if JSON parse fails)
    if (sourcesMatch) {
        const sourcesJson = sourcesMatch[1].trim();
        // Only parse if there's actual content
        if (sourcesJson && sourcesJson.startsWith('[')) {
            try {
                sources = JSON.parse(sourcesJson) as Source[];
            } catch (e) {
                // JSON parse failed, sources remain empty
            }
        }
    }

    // Always strip the source markers from content, regardless of whether parsing succeeded
    cleanContent = cleanContent.replace(/<!-- SOURCES_START -->[\s\S]*?<!-- SOURCES_END -->/g, '').trim();

    // Remove citation numbers like [1], [2], [1][2], etc.
    cleanContent = cleanContent.replace(/\[\d+\]/g, '');
    // Clean up any double spaces left behind
    cleanContent = cleanContent.replace(/  +/g, ' ').trim();

    return { cleanContent, sources };
}

// ============ SOURCES PANEL ============
function SourcesPanel({ sources, onClose }: { sources: Source[]; onClose: () => void }) {
    return (
        <div className="sources-overlay" onClick={onClose}>
            <div className="sources-panel" onClick={e => e.stopPropagation()}>
                <div className="sources-header">
                    <div className="sources-header-title">
                        <Sparkles className="w-4 h-4 text-[#20b8cd]" />
                        <span>{sources.length} sources</span>
                    </div>
                    <button onClick={onClose} className="sources-close-btn">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="sources-list">
                    {sources.map((source, i) => (
                        <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-item"
                        >
                            <div className="source-icon">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                                    alt=""
                                    className="w-4 h-4"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="source-content">
                                <span className="source-domain">{source.domain}</span>
                                <span className="source-title">{source.title}</span>
                                <span className="source-desc">{source.description}</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============ SOURCES BUTTON ============
const SourcesButton = React.memo(function SourcesButton({ sources }: { sources: Source[] }) {
    const [showPanel, setShowPanel] = useState(false);

    if (sources.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setShowPanel(true)}
                className="sources-button"
            >
                <div className="sources-icons">
                    {sources.slice(0, 3).map((source, i) => (
                        <img
                            key={i}
                            src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                            alt=""
                            className="source-favicon"
                            style={{ marginLeft: i > 0 ? '-6px' : '0', zIndex: 3 - i }}
                        />
                    ))}
                </div>
                <span>{sources.length} sources</span>
            </button>
            {showPanel && <SourcesPanel sources={sources} onClose={() => setShowPanel(false)} />}
        </>
    );
});

// ============ MARKDOWN RENDERER ============
const MarkdownContent = React.memo(function MarkdownContent({ content, onSourcesParsed }: { content: string; onSourcesParsed?: (sources: Source[]) => void }) {
    const { cleanContent, sources } = React.useMemo(() => parseSourcesFromContent(content), [content]);
    const hasReportedSources = useRef(false);

    useEffect(() => {
        if (onSourcesParsed && sources.length > 0 && !hasReportedSources.current) {
            hasReportedSources.current = true;
            onSourcesParsed(sources);
        }
    }, [sources.length, onSourcesParsed]);

    if (!cleanContent) {
        return <LoadingAnimation />;
    }

    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
            >
                {cleanContent}
            </ReactMarkdown>
            <TTSControls text={cleanContent} />
        </div>
    );
});

// ============ LOGO HEADER ============
function LogoHeader() {
    return (
        <a
            href="https://atheron.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
            <img
                src="/logo.jpeg"
                alt="Athey"
                className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="font-editorial text-xl font-medium text-white">
                Athey
            </span>
        </a>
    );
}

// ============ NEW CHAT BUTTON ============
function NewChatButton({ onNewChat }: { onNewChat?: () => void }) {
    const handleClick = () => {
        console.log('[NewChatButton] clicked, onNewChat:', !!onNewChat);
        if (onNewChat) {
            onNewChat();
        } else {
            window.location.reload();
        }
    };

    return (
        <button
            onClick={handleClick}
            className="p-2.5 rounded-xl bg-[#202222] border border-[#313333] text-gray-400 hover:text-[#20b8cd] hover:border-[#20b8cd]/50 transition-all"
            title="New Chat"
        >
            <RotateCcw className="w-5 h-5" />
        </button>
    );
}

// ============ USER PROFILE HEADER ============
function UserProfileHeader() {
    const { user } = useUser();

    return (
        <div className="flex items-center gap-3">
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-lg bg-[#202222] border border-[#313333] text-gray-300 hover:text-white hover:border-[#6c47ff]/50 transition-all text-sm font-medium">
                        Sign In
                    </button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <button className="px-4 py-2 rounded-lg bg-[#6c47ff] text-white hover:bg-[#5a3dd6] transition-all text-sm font-medium">
                        Sign Up
                    </button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 hidden sm:block">
                        {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'}
                    </span>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-9 h-9",
                                userButtonPopoverCard: "bg-[#0a0a0a] border border-[#313333]",
                                userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-[#202222]",
                                userButtonPopoverActionButtonText: "text-gray-300",
                                userButtonPopoverActionButtonIcon: "text-gray-400",
                                userButtonPopoverFooter: "hidden",
                            }
                        }}
                    />
                </div>
            </SignedIn>
        </div>
    );
}

// ============ WELCOME SCREEN ============
function WelcomeScreen() {
    return (
        <div className="welcome-screen">
            <div className="welcome-content">
                <div className="mb-6 md:mb-8 text-left">
                    <p className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
                        What do you want to
                    </p>
                    <p className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight whitespace-nowrap">
                        <span className="text-white">know? </span><TypewriterText text="in the cosmos" />
                    </p>
                </div>

                <ComposerPrimitive.Root className="input-container relative">
                    <ComposerPrimitive.Input
                        placeholder="Ask anything about space..."
                        className="input-field pr-24"
                    />
                    <div className="absolute right-14 top-1/2 -translate-y-1/2">
                        <ChatVoiceInputWrapper />
                    </div>
                    <ComposerPrimitive.Send className="send-button">
                        <ArrowRight className="w-5 h-5" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
            </div>
        </div>
    );
}



// ============ ASSISTANT MESSAGE - LEFT ALIGNED ============
function TextPartWithSources({ text, onSourcesParsed }: { text: string; onSourcesParsed: (sources: Source[]) => void }) {
    return <MarkdownContent content={text} onSourcesParsed={onSourcesParsed} />;
}
// ============ ACTION BUTTONS ============
const ActionButtons = React.memo(function ActionButtons({ content, sources }: { content: string; sources: Source[] }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const { cleanContent } = parseSourcesFromContent(content);
        await navigator.clipboard.writeText(cleanContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const { cleanContent } = parseSourcesFromContent(content);
        if (navigator.share) {
            await navigator.share({ text: cleanContent });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="action-bar">
            <div className="action-buttons-left">
                <button onClick={handleCopy} className="action-btn" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleShare} className="action-btn" title="Share">
                    <Share2 className="w-4 h-4" />
                </button>
                <button className="action-btn" title="Download" onClick={() => {
                    const { cleanContent } = parseSourcesFromContent(content);
                    const blob = new Blob([cleanContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'athey-response.txt';
                    a.click();
                }}>
                    <Download className="w-4 h-4" />
                </button>
                <button className="action-btn" title="Regenerate" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            <div className="action-buttons-right">
                {sources.length > 0 && <SourcesButton sources={sources} />}
            </div>
        </div>
    );
});

function AssistantMessage() {
    const [sources, setSources] = useState<Source[]>([]);
    const contentRef = useRef("");
    const sourcesRef = useRef<Source[]>([]);

    // Access message content for stable AutoReadHandler
    const message = useMessage((m: any) => m);
    const textContent = Array.isArray(message.content)
        ? message.content.map((c: any) => c.type === 'text' ? c.text : '').join('')
        : typeof message.content === 'string' ? message.content : '';

    // Memoize callback to prevent infinite loops
    const handleSourcesParsed = (newSources: Source[]) => {
        if (newSources.length > 0 && sourcesRef.current.length === 0) {
            sourcesRef.current = newSources;
            setSources(newSources);
        }
    };

    return (
        <div className="assistant-message-wrapper">
            <div className="message-container">
                <div className="assistant-message-content">
                    <div className="answer-header">
                        <Sparkles className="w-4 h-4" />
                        <span>Answer</span>
                    </div>
                    <MessagePrimitive.Content
                        components={{
                            Text: ({ text }) => {
                                contentRef.current = text;
                                return <TextPartWithSources text={text} onSourcesParsed={handleSourcesParsed} />;
                            }
                        }}
                    />
                    <AutoReadHandler text={textContent} />
                    <ActionButtons content={textContent} sources={sources} />
                </div>
            </div>
        </div>
    );
}

// Special component to handle auto-reading without re-rendering the whole message tree too often
function AutoReadHandler({ text }: { text: string }) {
    const { autoReadResponse, setAutoReadResponse } = React.useContext(VoiceContext);
    const { start } = useTTS(text);
    const hasStartedRef = useRef(false);

    // Check message status to ensuring we only read when done
    const isInProgress = useMessage((m: any) => m.status === "in_progress");

    useEffect(() => {
        // Only auto-read if enabled, text is substantial, we haven't started yet, AND message is complete
        if (autoReadResponse && text.length > 10 && !hasStartedRef.current && !isInProgress) {
            console.log("Auto-reading complete response...");
            start();
            hasStartedRef.current = true;
            // Turn off auto-read so subsequent renders or future messages strictly require a new voice trigger
            setAutoReadResponse(false);
        }
    }, [text, autoReadResponse, setAutoReadResponse, start, isInProgress]);

    return null;
}

// ============ USER MESSAGE ============
function UserMessage() {
    const message = useMessage((m: any) => m);
    const textContent = Array.isArray(message.content)
        ? message.content.map((c: any) => c.type === 'text' ? c.text : '').join('')
        : typeof message.content === 'string' ? message.content : '';

    return (
        <div className="user-message-wrapper">
            <div className="message-container">
                <div className="user-message-row">
                    <div className="user-message-bubble">
                        <MessagePrimitive.Content />
                    </div>
                    <div className="mt-1 mr-1">
                        <TTSControls text={textContent} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ MESSAGES ============
function Messages() {
    return <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />;
}

// ============ FOLLOW-UP COMPOSER ============
function Composer() {
    return (
        <div className="composer-wrapper">
            <div className="composer-inner">
                <ComposerPrimitive.Root className="composer-box relative">
                    <ComposerPrimitive.Input
                        placeholder="Ask a follow-up..."
                        className="composer-input pr-20"
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                        <ChatVoiceInputWrapper />
                    </div>
                    <ComposerPrimitive.Send className="composer-send">
                        <ArrowRight className="w-4 h-4" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
            </div>
        </div>
    );
}

// ============ MAIN COMPONENT ============
interface AtheronChatProps {
    loadedMessages?: Message[];
    currentSessionId: string | null;
    onUserMessage: (content: string) => Promise<string | null>;
    onAssistantMessage: (content: string, sessionId: string | null) => Promise<void>;
    onNewChat?: () => void;
}

export function AtheronChat({
    loadedMessages = [],
    currentSessionId,
    onUserMessage,
    onAssistantMessage,
    onNewChat
}: AtheronChatProps) {
    return (
        <VoiceProviderWrapper>
            <AtheronChatContent
                loadedMessages={loadedMessages}
                currentSessionId={currentSessionId}
                onUserMessage={onUserMessage}
                onAssistantMessage={onAssistantMessage}
                onNewChat={onNewChat}
            />
        </VoiceProviderWrapper>
    );
}

function VoiceProviderWrapper({ children }: { children: React.ReactNode }) {
    const [autoReadResponse, setAutoReadResponse] = useState(false);
    return (
        <VoiceContext.Provider value={{ autoReadResponse, setAutoReadResponse }}>
            {children}
        </VoiceContext.Provider>
    );
}

// Wrapper to access context for the input
function ChatVoiceInputWrapper() {
    const { setAutoReadResponse } = React.useContext(VoiceContext);
    const runtime = useThreadRuntime();

    const handleVoiceSubmit = useCallback((text: string) => {
        setAutoReadResponse(true);
        runtime.append({
            role: "user",
            content: [{ type: "text", text }],
        });
    }, [runtime, setAutoReadResponse]);

    return <VoiceInput onMessageSubmit={handleVoiceSubmit} />;
}


function AtheronChatContent({
    loadedMessages = [],
    currentSessionId,
    onUserMessage,
    onAssistantMessage,
    onNewChat
}: AtheronChatProps) {
    const [sessionId, setSessionId] = useState<string | null>(currentSessionId);
    const lastSavedAssistantRef = useRef<string>("");
    const lastSavedUserRef = useRef<string>("");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const userMessageCountRef = useRef(0);

    // Sync session ID from props
    useEffect(() => {
        setSessionId(currentSessionId);
        // Reset refs when session changes
        lastSavedAssistantRef.current = "";
        lastSavedUserRef.current = "";
        userMessageCountRef.current = loadedMessages.filter(m => m.role === 'user').length;
    }, [currentSessionId, loadedMessages]);

    // Watch for user messages to save them
    useEffect(() => {
        // Initial sync to avoid detecting pre-existing messages (like from reloads) as new
        const initialUserBubbles = document.querySelectorAll('.user-message-bubble');
        const initialLiveBubbles = Array.from(initialUserBubbles).filter(
            el => !el.classList.contains('loaded-user-msg')
        );

        // If we have live bubbles but count is 0 (or less than actual), update count to ignore them
        if (initialLiveBubbles.length > userMessageCountRef.current) {
            userMessageCountRef.current = initialLiveBubbles.length;
            // Also update the last saved ref to the last message content so we don't save it if it triggers
            const lastText = initialLiveBubbles[initialLiveBubbles.length - 1]?.textContent?.trim() || "";
            lastSavedUserRef.current = lastText;
        }

        const checkUserMessage = async () => {
            const userBubbles = document.querySelectorAll('.user-message-bubble');
            const liveUserBubbles = Array.from(userBubbles).filter(
                el => !el.classList.contains('loaded-user-msg')
            );

            if (liveUserBubbles.length > userMessageCountRef.current) {
                const lastUserBubble = liveUserBubbles[liveUserBubbles.length - 1];
                const text = lastUserBubble?.textContent?.trim() || "";

                if (text && text !== lastSavedUserRef.current) {
                    lastSavedUserRef.current = text;
                    userMessageCountRef.current = liveUserBubbles.length;

                    // Call parent to save and potentially create session
                    const newSessionId = await onUserMessage(text);
                    if (newSessionId && !sessionId) {
                        setSessionId(newSessionId);
                    }
                }
            }
        };

        const observer = new MutationObserver(checkUserMessage);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [sessionId, onUserMessage]);

    // Watch for assistant messages to save them (debounced)
    useEffect(() => {
        if (!sessionId) return;
        // Skip observer if viewing loaded history (check current prop value)
        const hasHistory = loadedMessages.length > 0;
        if (hasHistory) return;

        const checkAssistantMessage = () => {
            // Only look at markdown content NOT inside .loaded-history
            const allMarkdown = document.querySelectorAll('.markdown-content');
            const liveMarkdown = Array.from(allMarkdown).filter(
                el => !el.closest('.loaded-history')
            );

            if (liveMarkdown.length > 0) {
                const lastContent = liveMarkdown[liveMarkdown.length - 1];
                const text = lastContent?.textContent?.trim() || "";

                // Debounce save - wait for streaming to complete
                if (text && text.length > 50 && !text.includes("Hold on")) {
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

                    saveTimeoutRef.current = setTimeout(() => {
                        if (text !== lastSavedAssistantRef.current) {
                            lastSavedAssistantRef.current = text;
                            console.log('[Chat] Saving assistant message to session:', sessionId);
                            onAssistantMessage(text, sessionId);
                        }
                    }, 3000); // Wait 3 seconds after last change
                }
            }
        };

        const observer = new MutationObserver(checkAssistantMessage);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [sessionId, onAssistantMessage, loadedMessages.length]);

    const hasLoadedMessages = loadedMessages.length > 0;

    return (
        <>
            <VideoBackground />

            <div className="chat-container">
                <ThreadPrimitive.Root className="h-full flex flex-col">
                    {/* Header - User controls only */}
                    <div className="chat-header">
                        <div /> {/* Empty spacer for flex justify-between */}
                        <div className="flex items-center gap-3">
                            <UserProfileHeader />
                            <NewChatButton onNewChat={onNewChat} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <ThreadPrimitive.Viewport className="messages-viewport">
                        {/* Display loaded historical messages */}
                        {hasLoadedMessages && (
                            <div className="loaded-history">
                                {loadedMessages.map((msg, index) => (
                                    msg.role === 'user' ? (
                                        <div key={msg.id || index} className="user-message-wrapper">
                                            <div className="message-container">
                                                <div className="user-message-row">
                                                    <div className="user-message-bubble loaded-user-msg">
                                                        {msg.content}
                                                    </div>
                                                    <div className="mt-1 mr-1">
                                                        <TTSControls text={msg.content} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={msg.id || index} className="assistant-message-wrapper">
                                            <div className="message-container">
                                                <div className="assistant-message-content">
                                                    <div className="answer-header">
                                                        <Sparkles className="w-4 h-4" />
                                                        <span>Answer</span>
                                                    </div>
                                                    <MarkdownContent content={msg.content} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {/* Welcome screen only when no history */}
                        {!hasLoadedMessages && (
                            <ThreadPrimitive.Empty>
                                <WelcomeScreen />
                            </ThreadPrimitive.Empty>
                        )}

                        {/* Live messages - only when NOT viewing history */}
                        {!hasLoadedMessages && <Messages />}
                    </ThreadPrimitive.Viewport>

                    {/* Composer - always show for loaded chats, conditional for new */}
                    {hasLoadedMessages ? (
                        <Composer />
                    ) : (
                        <ThreadPrimitive.If running={false} empty={false}>
                            <Composer />
                        </ThreadPrimitive.If>
                    )}
                </ThreadPrimitive.Root>
            </div>
        </>
    );
}




