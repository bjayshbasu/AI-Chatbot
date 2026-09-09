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
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "research_report.pdf";
    a.click();

    URL.revokeObjectURL(url);
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");

                  if (!inline && match) {
                    return (
                      <div className="relative">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(code)
                          }
                          className="absolute right-2 top-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Copy
                        </button>

                        <SyntaxHighlighter
                          language={match[1]}
                          style={oneDark}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className="bg-gray-700 px-1 rounded">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {text}
            </ReactMarkdown>

            {agents.length > 0 && (
              <AgentTimeline
                agents={agents}
                finished={!streaming}
              />
            )}

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
                    className="block text-blue-400 hover:underline text-sm"
                  >
                    {src.title}
                  </a>
                ))}
              </div>
            )}

            {text.length > 300 && (
              <button
                onClick={exportPDF}
                className="mt-3 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
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