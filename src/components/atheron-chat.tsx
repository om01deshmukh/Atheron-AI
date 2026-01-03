"use client";

import { ReactNode } from "react";
import {
    ThreadPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    useComposerRuntime,
} from "@assistant-ui/react";
import { ArrowRight, Sparkles, Atom, Dna, Calculator, FlaskConical, Cpu, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

const SAMPLE_QUESTIONS = [
    {
        icon: Atom,
        text: "Explain quantum entanglement and its implications",
        category: "Physics",
    },
    {
        icon: Dna,
        text: "How does CRISPR gene editing work?",
        category: "Biology",
    },
    {
        icon: Calculator,
        text: "What is the Riemann Hypothesis?",
        category: "Mathematics",
    },
    {
        icon: FlaskConical,
        text: "Explain the structure of carbon nanotubes",
        category: "Chemistry",
    },
    {
        icon: Cpu,
        text: "How do neural networks learn?",
        category: "Computer Science",
    },
];

// Custom Markdown renderer with LaTeX support
function MarkdownRenderer({ content }: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
                h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-[#f5f5f5] mt-6 mb-3 first:mt-0">
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-[#f5f5f5] mt-5 mb-2">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mt-4 mb-2">
                        {children}
                    </h3>
                ),
                p: ({ children }) => (
                    <p className="text-[#e0e0e0] leading-relaxed mb-4 last:mb-0">
                        {children}
                    </p>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc space-y-1 mb-4 text-[#e0e0e0] pl-6">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal space-y-1 mb-4 text-[#e0e0e0] pl-6">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="text-[#e0e0e0]">{children}</li>
                ),
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#20b8cd] hover:underline"
                    >
                        {children}
                    </a>
                ),
                code: ({ className, children }) => {
                    const isInline = !className;
                    if (isInline) {
                        return (
                            <code className="bg-[#2a2a2a] text-[#20b8cd] px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className="text-[#f5f5f5] text-sm font-mono">{children}</code>
                    );
                },
                pre: ({ children }) => (
                    <pre className="bg-[#242424] border border-[#3a3a3a] rounded-lg p-4 overflow-x-auto mb-4 text-sm">
                        {children}
                    </pre>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#20b8cd] pl-4 italic text-[#a0a0a0] mb-4">
                        {children}
                    </blockquote>
                ),
                table: ({ children }) => (
                    <div className="overflow-x-auto mb-4 rounded-lg border border-[#3a3a3a]">
                        <table className="min-w-full">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-[#242424]">{children}</thead>
                ),
                tbody: ({ children }) => <tbody className="bg-[#1e1e1e]">{children}</tbody>,
                tr: ({ children }) => (
                    <tr className="border-b border-[#3a3a3a] last:border-b-0">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-[#f5f5f5] font-semibold text-sm">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-4 py-3 text-[#e0e0e0] text-sm">{children}</td>
                ),
                hr: () => <hr className="border-[#3a3a3a] my-6" />,
                strong: ({ children }) => (
                    <strong className="font-semibold text-[#f5f5f5]">{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic text-[#e0e0e0]">{children}</em>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}

function WelcomeScreen() {
    const composer = useComposerRuntime();

    const handleQuestionClick = (question: string) => {
        composer.setText(question);
        setTimeout(() => {
            composer.send();
        }, 50);
    };

    return (
        <div className="flex h-full w-full items-center justify-center px-4">
            <div className="flex w-full max-w-[42rem] flex-col gap-8">
                {/* Logo and Branding */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#20b8cd] to-[#1aa3b5] flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#1a1a1a]" />
                        </div>
                        <div>
                            <span className="text-2xl font-semibold text-[#20b8cd]">Atheron</span>
                            <p className="text-xs text-[#808080]">STEM Research Assistant • Powered by Groq</p>
                        </div>
                    </div>
                    <p className="text-4xl md:text-5xl font-light text-[#f5f5f5] leading-tight">
                        What do you want to know?
                    </p>
                    <p className="text-lg text-[#808080]">
                        Ask any STEM question. Get answers with research paper references.
                    </p>
                </div>

                {/* Input */}
                <ComposerPrimitive.Root className="flex items-center gap-2 p-2 rounded-2xl border border-[#3a3a3a] bg-[#242424] transition-all shadow-lg">
                    <ComposerPrimitive.Input
                        placeholder="Ask anything about science, technology, engineering, or mathematics..."
                        className="flex-1 min-h-[48px] px-4 py-3 bg-transparent text-[#f5f5f5] text-lg placeholder:text-[#808080] focus:outline-none resize-none"
                    />
                    <ComposerPrimitive.Send className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#20b8cd] text-[#1a1a1a] hover:bg-[#1aa3b5] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowRight className="w-5 h-5" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>

                {/* Sample Questions */}
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-[#808080]">Try asking about:</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUESTIONS.map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuestionClick(question.text)}
                                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-[#3a3a3a] bg-[#242424] hover:border-[#20b8cd]/50 hover:bg-[#2a2a2a] transition-all"
                            >
                                <question.icon className="w-4 h-4 text-[#20b8cd]" />
                                <span className="text-sm text-[#a0a0a0] group-hover:text-[#f5f5f5] transition-colors">
                                    {question.category}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-[#606060] text-center">
                    ⚠️ AI-generated content. Please verify research paper links before citing.
                </p>
            </div>
        </div>
    );
}

function UserMessage() {
    return (
        <div className="max-w-[42rem] mx-auto py-4">
            <div className="flex justify-end">
                <div className="max-w-[70%] px-5 py-3 rounded-2xl bg-[#3a3a3a] text-[#f5f5f5]">
                    <MessagePrimitive.Content />
                </div>
            </div>
        </div>
    );
}

// Custom Text component that renders markdown
function TextPart({ text }: { text: string }) {
    return <MarkdownRenderer content={text || ""} />;
}

function AssistantMessage() {
    return (
        <div className="py-6 border-b border-[#2a2a2a]">
            <div className="max-w-[42rem] mx-auto">
                {/* Answer Header */}
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#20b8cd]">
                    <Sparkles className="w-5 h-5" />
                    Answer
                </h2>
                {/* Content with custom markdown rendering */}
                <MessagePrimitive.Content components={{ Text: TextPart }} />
            </div>
        </div>
    );
}

function Messages() {
    return (
        <ThreadPrimitive.Messages
            components={{
                UserMessage,
                AssistantMessage,
            }}
        />
    );
}

function Composer() {
    return (
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-transparent pt-8">
            <div className="max-w-[42rem] mx-auto">
                <ComposerPrimitive.Root className="flex items-center gap-2 p-2 rounded-full border border-[#3a3a3a] bg-[#242424] focus-within:border-[#20b8cd]/50 transition-all">
                    <ComposerPrimitive.Input
                        placeholder="Ask a follow-up..."
                        className="flex-1 min-h-[44px] px-4 py-2 bg-transparent text-[#f5f5f5] placeholder:text-[#808080] focus:outline-none resize-none"
                    />
                    <ComposerPrimitive.Send className="flex-shrink-0 w-10 h-10 rounded-full bg-[#20b8cd] text-[#1a1a1a] hover:bg-[#1aa3b5] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <ArrowRight className="w-5 h-5" />
                    </ComposerPrimitive.Send>
                </ComposerPrimitive.Root>
            </div>
        </div>
    );
}

export function AtheronChat() {
    const handleNewChat = () => {
        window.location.reload();
    };

    return (
        <ThreadPrimitive.Root
            className="dark h-screen bg-[#1a1a1a] text-[#f5f5f5] flex flex-col relative"
            style={{ ["--thread-max-width" as string]: "42rem" }}
        >
            {/* New Chat Button */}
            <button
                onClick={handleNewChat}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-[#242424] border border-[#3a3a3a] text-[#808080] hover:text-[#20b8cd] hover:border-[#20b8cd]/50 transition-all"
                title="New Chat"
            >
                <RotateCcw className="w-5 h-5" />
            </button>

            {/* Thread Content */}
            <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
                <ThreadPrimitive.Empty>
                    <WelcomeScreen />
                </ThreadPrimitive.Empty>
                <div className="px-4">
                    <Messages />
                </div>
            </ThreadPrimitive.Viewport>

            {/* Follow-up Composer */}
            <ThreadPrimitive.If running={false} empty={false}>
                <Composer />
            </ThreadPrimitive.If>
        </ThreadPrimitive.Root>
    );
}
