import { useState, useEffect, useRef } from "react";
import type { AIPlayMode } from "../ai/aiMode";

interface Props {
  loading: boolean;
  aiMode: AIPlayMode;
  onSubmit: (input: string) => void;
  /** 外部传入的加载错误信息（如有） */
  errorMessage?: string;
  /** 清除错误 */
  onClearError?: () => void;
}

/** loading 期间轮换的等待提示文案 */
const WAITING_MESSAGES_MOCK = [
  "通译正在转述你的言辞……",
  "楼兰王庭正在权衡你的话……",
  "左右大臣低声议论……",
];

const WAITING_MESSAGES_REAL = [
  "正在请求真实 AI 模型……",
  "通译正在转述你的言辞……",
  "楼兰王庭正在权衡你的话……",
  "AI 正在生成角色反应，请稍候……",
];

const LONG_WAIT_MESSAGE = "真实 AI 响应可能需要数秒，请不要重复提交。";
const LONG_WAIT_THRESHOLD = 8000;

export function FreeInputBox({ loading, aiMode, onSubmit, errorMessage, onClearError }: Props) {
  const [value, setValue] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [longWait, setLongWait] = useState(false);
  const loadingStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理定时器
  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (longWaitTimerRef.current) clearTimeout(longWaitTimerRef.current);
    timerRef.current = null;
    longWaitTimerRef.current = null;
  };

  // loading 状态管理
  useEffect(() => {
    if (loading) {
      loadingStartRef.current = Date.now();
      setMsgIndex(0);
      setLongWait(false);

      const messages = aiMode === "realAI" ? WAITING_MESSAGES_REAL : WAITING_MESSAGES_MOCK;

      // 每 2 秒轮换文案
      timerRef.current = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 2000);

      // 8 秒后显示长时间等待提示
      longWaitTimerRef.current = setTimeout(() => {
        setLongWait(true);
      }, LONG_WAIT_THRESHOLD);
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [loading, aiMode]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onClearError?.();
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // presetOnly 模式
  if (aiMode === "presetOnly") {
    return (
      <div className="mt-4 p-3 rounded border border-han-gold/10 bg-black/10">
        <div className="text-han-gold/30 text-xs text-center">
          自由输入需要启用 AI 模型。当前为预设选项模式。
        </div>
      </div>
    );
  }

  const messages = aiMode === "realAI" ? WAITING_MESSAGES_REAL : WAITING_MESSAGES_MOCK;
  const currentMessage = messages[msgIndex % messages.length] ?? messages[0];

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
                   transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={loading}
      />

      {/* Loading 状态提示 */}
      {loading && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-han-gold/60 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-han-gold/60 animate-pulse" />
            <span key={msgIndex} className="transition-opacity duration-300">
              {currentMessage}
            </span>
          </div>
          {longWait && (
            <div className="text-[10px] text-yellow-500/60">{LONG_WAIT_MESSAGE}</div>
          )}
        </div>
      )}

      {/* Mock 模式提示 */}
      {aiMode === "mock" && !loading && (
        <div className="mt-1 text-[10px] text-yellow-500/50 leading-relaxed">
          当前为 Mock AI 实验解析，仅用于验证流程。
          复杂表达可能误判；正式版本将使用真实 AI 模型。
        </div>
      )}

      {/* 错误提示 */}
      {errorMessage && !loading && (
        <div className="mt-2 text-[10px] text-red-400/70 leading-relaxed">
          {errorMessage}
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
            px-4 py-1 text-xs tracking-wider border transition-all duration-200 min-w-[80px]
            ${
              !value.trim() || loading
                ? "border-gray-700/30 text-gray-600 cursor-not-allowed"
                : "border-han-gold/50 text-han-gold hover:bg-han-gold/10"
            }
          `}
        >
          {loading
            ? aiMode === "realAI"
              ? "AI 解析中…"
              : "解析中…"
            : "亲自陈词"}
        </button>
      </div>
    </div>
  );
}
