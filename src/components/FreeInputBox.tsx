import { useState } from "react";
import type { AIPlayMode } from "../ai/aiMode";

interface Props {
  loading: boolean;
  aiMode: AIPlayMode;
  onSubmit: (input: string) => void;
}

export function FreeInputBox({ loading, aiMode, onSubmit }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // presetOnly 模式：隐藏自由输入
  if (aiMode === "presetOnly") {
    return (
      <div className="mt-4 p-3 rounded border border-han-gold/10 bg-black/10">
        <div className="text-han-gold/30 text-xs text-center">
          自由输入需要启用 AI 模型。当前为预设选项模式。
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 rounded border border-han-gold/20 bg-black/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-han-gold/50 text-[10px] tracking-widest uppercase">
          亲自陈词（自由输入）
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-han-gold/20 to-transparent" />
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="你可以亲自开口：例如「大汉不愿多杀一人，但楼兰若仍附匈奴，王庭之火恐非今日可免。」"
        rows={2}
        className="w-full bg-black/30 border border-han-gold/10 rounded p-2
                   text-han-gold/80 text-xs leading-relaxed resize-none
                   placeholder:text-han-gold/20 focus:outline-none focus:border-han-gold/40
                   transition-colors"
        disabled={loading}
      />

      {aiMode === "mock" && (
        <div className="mt-1 text-[10px] text-yellow-500/50 leading-relaxed">
          当前为 Mock AI 实验解析，仅用于验证流程。
          复杂表达可能误判；正式版本将使用真实 AI 模型。
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-han-gold/30">
          Enter 发送 · Shift+Enter 换行
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className={`
            px-4 py-1 text-xs tracking-wider border transition-all duration-200
            ${
              !value.trim() || loading
                ? "border-gray-700/30 text-gray-600 cursor-not-allowed"
                : "border-han-gold/50 text-han-gold hover:bg-han-gold/10"
            }
          `}
        >
          {loading ? "解析中…" : "亲自陈词"}
        </button>
      </div>
    </div>
  );
}
