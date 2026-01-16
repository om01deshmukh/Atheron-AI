"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

import TTSControls from "@/components/TTSControls";

interface MarkdownTextProps {
  content: string;
}

export function MarkdownText({ content }: MarkdownTextProps) {
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-[#f5f5f5] mt-6 mb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-[#f5f5f5] mt-5 mb-2">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="text-[#e0e0e0] leading-relaxed mb-4">
              {children}
            </p>
          ),
          code: ({ children }) => (
            <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-[#20b8cd]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-[#242424] p-4 rounded mb-4 overflow-x-auto">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* 🔊 Text to Speech Controls */}
      <TTSControls text={content} />
    </>
  );
}
