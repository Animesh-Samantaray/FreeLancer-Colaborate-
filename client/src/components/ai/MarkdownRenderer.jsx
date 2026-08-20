import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-white/10 bg-[#0D1117] text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-gray-400">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-gray-200 leading-relaxed font-mono whitespace-pre">
        <code>{code}</code>
      </div>
    </div>
  );
};

const renderFormattedInlineText = (text) => {
  if (!text) return null;


  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono text-[0.85em] border border-indigo-500/20"
        >
          {codeContent}
        </code>
      );
    }


    const boldParts = part.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);

    return boldParts.map((bPart, bIdx) => {
      if (
        (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length > 4) ||
        (bPart.startsWith("__") && bPart.endsWith("__") && bPart.length > 4)
      ) {
        return (
          <strong key={`${index}-${bIdx}`} className="font-semibold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      const italicParts = bPart.split(/(\*[^*]+\*|_[^_]+_)/g);
      return italicParts.map((iPart, iIdx) => {
        if (
          (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) ||
          (iPart.startsWith("_") && iPart.endsWith("_") && iPart.length > 2)
        ) {
          return (
            <em key={`${index}-${bIdx}-${iIdx}`} className="italic text-gray-200">
              {iPart.slice(1, -1)}
            </em>
          );
        }
        return iPart;
      });
    });
  });
};

export default function MarkdownRenderer({ content = "" }) {
  if (!content) return null;


  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-200 break-words">
      {segments.map((segment, idx) => {
        if (segment.startsWith("```") && segment.endsWith("```")) {
          const match = segment.match(/^```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```$/);
          const lang = match ? match[1] : "";
          const code = match ? match[2].trim() : segment.slice(3, -3).trim();
          return <CodeBlock key={idx} language={lang} code={code} />;
        }


        const lines = segment.split("\n");
        const renderedLines = [];
        let currentList = [];
        let listType = null; // 'ul' | 'ol'

        const flushList = (key) => {
          if (currentList.length > 0) {
            if (listType === "ul") {
              renderedLines.push(
                <ul key={`ul-${key}`} className="list-disc list-inside my-2 space-y-1 pl-1 text-gray-300">
                  {currentList.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {renderFormattedInlineText(item)}
                    </li>
                  ))}
                </ul>
              );
            } else if (listType === "ol") {
              renderedLines.push(
                <ol key={`ol-${key}`} className="list-decimal list-inside my-2 space-y-1 pl-1 text-gray-300">
                  {currentList.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {renderFormattedInlineText(item)}
                    </li>
                  ))}
                </ol>
              );
            }
            currentList = [];
            listType = null;
          }
        };

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("# ")) {
            flushList(lineIdx);
            renderedLines.push(
              <h1 key={lineIdx} className="text-lg font-bold text-white mt-3 mb-1 border-b border-white/10 pb-1">
                {renderFormattedInlineText(trimmed.slice(2))}
              </h1>
            );
          } else if (trimmed.startsWith("## ")) {
            flushList(lineIdx);
            renderedLines.push(
              <h2 key={lineIdx} className="text-base font-bold text-indigo-300 mt-2.5 mb-1">
                {renderFormattedInlineText(trimmed.slice(3))}
              </h2>
            );
          } else if (trimmed.startsWith("### ")) {
            flushList(lineIdx);
            renderedLines.push(
              <h3 key={lineIdx} className="text-sm font-semibold text-indigo-200 mt-2 mb-1">
                {renderFormattedInlineText(trimmed.slice(4))}
              </h3>
            );
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            if (listType && listType !== "ul") flushList(lineIdx);
            listType = "ul";
            currentList.push(trimmed.slice(2));
          } else if (/^\d+\.\s/.test(trimmed)) {
            if (listType && listType !== "ol") flushList(lineIdx);
            listType = "ol";
            currentList.push(trimmed.replace(/^\d+\.\s/, ""));
          } else if (trimmed.startsWith("> ")) {
            flushList(lineIdx);
            renderedLines.push(
              <blockquote
                key={lineIdx}
                className="border-l-2 border-indigo-500/60 pl-3 py-1 my-2 bg-indigo-950/20 text-gray-300 rounded-r text-xs italic"
              >
                {renderFormattedInlineText(trimmed.slice(2))}
              </blockquote>
            );
          } else if (trimmed === "") {
            flushList(lineIdx);
            renderedLines.push(<div key={lineIdx} className="h-1.5" />);
          } else {
            flushList(lineIdx);
            renderedLines.push(
              <p key={lineIdx} className="my-0.5 leading-relaxed">
                {renderFormattedInlineText(line)}
              </p>
            );
          }
        });

        flushList("end");
        return <React.Fragment key={idx}>{renderedLines}</React.Fragment>;
      })}
    </div>
  );
}
