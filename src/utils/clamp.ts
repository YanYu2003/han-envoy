/** 将数值限制在 0–100 范围内 */
export function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
