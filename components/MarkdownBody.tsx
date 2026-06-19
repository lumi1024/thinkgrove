// SPDX-License-Identifier: MIT

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownBodyProps {
  content: string;
  className?: string;
}

export function MarkdownBody({ content, className = '' }: MarkdownBodyProps) {
  if (!content?.trim()) return null;

  return (
    <div className={`prose prose-slate prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-700 font-light leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
          code: ({ children, ...props }) => {
            const isInline = !props.className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[13px] font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-700 my-4">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-slate-300 pl-4 my-4 italic text-slate-600">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 my-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-3 space-y-1">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline underline-offset-2">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
