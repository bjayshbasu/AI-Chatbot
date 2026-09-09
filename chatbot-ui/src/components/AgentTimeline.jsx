import { useEffect, useState } from "react";

function AgentTimeline({ agents = [], finished }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (finished) {
      setVisible(agents.length);
      return;
    }

    setVisible(0);

    let index = 0;

    const timer = setInterval(() => {
      index++;
      setVisible(index);

      if (index >= agents.length) {
        clearInterval(timer);
      }
    }, 700);

    return () => clearInterval(timer);
  }, [agents, finished]);

  if (agents.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-600 bg-[#3b3d4a] p-3">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        🧠 Agent Timeline
      </p>

      {!finished && (
        <div className="flex items-center gap-2 text-blue-400 text-sm mb-3">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          Planning...
        </div>
      )}

      {agents.map((agent, i) => {
        const active = i < visible;
        const running = i === visible && !finished;

        return (
          <div
            key={agent}
            className="flex items-center justify-between py-1 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className={
                  active
                    ? "text-green-400"
                    : running
                    ? "text-yellow-400 animate-pulse"
                    : "text-gray-500"
                }
              >
                ●
              </span>

              <span>{agent} Agent</span>
            </div>

            <span
              className={`text-xs ${
                active
                  ? "text-green-400"
                  : running
                  ? "text-yellow-400"
                  : "text-gray-500"
              }`}
            >
              {active
                ? "Completed"
                : running
                ? "Running..."
                : "Waiting"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AgentTimeline;