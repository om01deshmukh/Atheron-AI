"use client";

import { useRef, useEffect, useState } from "react";
import {
    ThreadPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
} from "@assistant-ui/react";
import { ArrowRight, Sparkles, RotateCcw, X, ExternalLink, Copy, Share2, Download, RefreshCw, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

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
function SourcesButton({ sources }: { sources: Source[] }) {
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
}

// ============ MARKDOWN RENDERER ============
function MarkdownContent({ content, onSourcesParsed }: { content: string; onSourcesParsed?: (sources: Source[]) => void }) {
    const { cleanContent, sources } = parseSourcesFromContent(content);
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
        </div>
    );
}

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
function NewChatButton() {
    return (
        <button
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl bg-[#202222] border border-[#313333] text-gray-400 hover:text-[#20b8cd] hover:border-[#20b8cd]/50 transition-all"
            title="New Chat"
        >
            <RotateCcw className="w-5 h-5" />
        </button>
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

                <ComposerPrimitive.Root className="input-container">
                    <ComposerPrimitive.Input
                        placeholder="Ask anything about space..."
                        className="input-field"
                    />
                    <ComposerPrimitive.Send className="send-button">
                        <ArrowRight className="w-5 h-5" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
            </div>
        </div>
    );
}

// ============ USER MESSAGE - RIGHT ALIGNED ============
function UserMessage() {
    return (
        <div className="user-message-wrapper">
            <div className="message-container">
                <div className="user-message-row">
                    <div className="user-message-bubble">
                        <MessagePrimitive.Content />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ ASSISTANT MESSAGE - LEFT ALIGNED ============
function TextPartWithSources({ text, onSourcesParsed }: { text: string; onSourcesParsed: (sources: Source[]) => void }) {
    return <MarkdownContent content={text} onSourcesParsed={onSourcesParsed} />;
}
// ============ ACTION BUTTONS ============
function ActionButtons({ content, sources }: { content: string; sources: Source[] }) {
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
}

function AssistantMessage() {
    const [sources, setSources] = useState<Source[]>([]);
    const contentRef = useRef("");
    const sourcesRef = useRef<Source[]>([]);

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
                    <ActionButtons content={contentRef.current} sources={sources} />
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
                <ComposerPrimitive.Root className="composer-box">
                    <ComposerPrimitive.Input
                        placeholder="Ask a follow-up..."
                        className="composer-input"
                    />
                    <ComposerPrimitive.Send className="composer-send">
                        <ArrowRight className="w-4 h-4" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
            </div>
        </div>
    );
}

// ============ MAIN COMPONENT ============
export function AtheronChat() {
    return (
        <>
            <VideoBackground />

            <div className="chat-container">
                <ThreadPrimitive.Root className="h-full flex flex-col">
                    {/* Header */}
                    <div className="chat-header">
                        <LogoHeader />
                        <NewChatButton />
                    </div>

                    {/* Main Content */}
                    <ThreadPrimitive.Viewport className="messages-viewport">
                        <ThreadPrimitive.Empty>
                            <WelcomeScreen />
                        </ThreadPrimitive.Empty>
                        <Messages />
                    </ThreadPrimitive.Viewport>

                    {/* Follow-up Input */}
                    <ThreadPrimitive.If running={false} empty={false}>
                        <Composer />
                    </ThreadPrimitive.If>
                </ThreadPrimitive.Root>
            </div>
        </>
    );
}
