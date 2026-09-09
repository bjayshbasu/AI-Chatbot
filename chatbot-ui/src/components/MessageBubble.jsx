import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import AgentTimeline from "./AgentTimeline";

function MessageBubble({
  role,
  text,
  sources = [],
  agents = [],
  streaming = false,
}) {
  const isUser = role === "user";

  const exportPDF = async () => {
    const res = await fetch("http://127.0.0.1:8000/export-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "AI Research Report",
        content: text,
      }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "research_report.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-[#10A37F] text-white"
            : "bg-[#444654] text-gray-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <>
            {/* Markdown Rendering */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");

                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code
                      className="bg-gray-700 px-1 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {text}
            </ReactMarkdown>

            {/* 🧠 Live Agent Timeline */}
            {agents.length > 0 && (
              <AgentTimeline
                agents={agents}
                finished={!streaming}
              />
            )}

            {/* 🌐 Sources */}
            {sources.length > 0 && (
              <div className="mt-4 border-t border-gray-600 pt-3">
                <p className="text-xs text-gray-400 mb-2">
                  🌐 Sources
                </p>

                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-blue-400 hover:underline truncate"
                  >
                    {src.title}
                  </a>
                ))}
              </div>
            )}

            {/* 📄 Export PDF */}
            {text.length > 300 && (
              <button
                onClick={exportPDF}
                className="mt-3 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
              >
                📄 Export PDF
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;