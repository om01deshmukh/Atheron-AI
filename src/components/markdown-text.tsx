"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

interface MarkdownTextProps {
    content: string;
}

export function MarkdownText({ content }: MarkdownTextProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
                // Headings
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
                h4: ({ children }) => (
                    <h4 className="text-base font-semibold text-[#f5f5f5] mt-3 mb-1">
                        {children}
                    </h4>
                ),
                // Paragraphs
                p: ({ children }) => (
                    <p className="text-[#e0e0e0] leading-relaxed mb-4 last:mb-0">
                        {children}
                    </p>
                ),
                // Lists
                ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 mb-4 text-[#e0e0e0] pl-2">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-[#e0e0e0] pl-2">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="text-[#e0e0e0]">{children}</li>
                ),
                // Links
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
                // Code
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
                // Blockquotes
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#20b8cd] pl-4 italic text-[#a0a0a0] mb-4">
                        {children}
                    </blockquote>
                ),
                // Tables
                table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border-collapse">
                            {children}
                        </table>
                    </div>
                ),
                thead: ({ children }) => (
                    <thead className="bg-[#242424]">{children}</thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                    <tr className="border-b border-[#3a3a3a]">{children}</tr>
                ),
                th: ({ children }) => (
                    <th className="px-4 py-2 text-left text-[#f5f5f5] font-semibold text-sm">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="px-4 py-2 text-[#e0e0e0] text-sm">{children}</td>
                ),
                // Horizontal rule
                hr: () => <hr className="border-[#3a3a3a] my-6" />,
                // Strong/Bold
                strong: ({ children }) => (
                    <strong className="font-semibold text-[#f5f5f5]">{children}</strong>
                ),
                // Emphasis/Italic
                em: ({ children }) => (
                    <em className="italic text-[#e0e0e0]">{children}</em>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
