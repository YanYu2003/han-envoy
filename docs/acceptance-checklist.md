# Phase 0 验收清单

> 逐项检查 Phase 0 完成情况

## 0. 前置条件

- [x] 项目名称《汉使》/ Han Envoy 已定
- [x] 参赛方向：赛题三（叙事类游戏）已确认
- [x] MVP 范围已明确（仅第一章·楼兰）

## 1. 项目可运行性

- [x] `npm install` 可正常安装依赖
- [x] `npm run dev` 可正常启动开发服务器
- [x] `npm run build` 可正常构建生产版本
- [x] `npm run preview` 可正常预览构建结果

## 2. 文档完整性

- [x] `README.md` — 项目介绍、运行方式、安全说明
- [x] `docs/phase-0-plan.md` — 阶段计划、MVP 范围、开发路线
- [x] `docs/game-design.md` — 核心玩法、参数系统、角色、结局
- [x] `docs/ai-agent-design.md` — AI 能力边界、解析结构、fallback
- [x] `docs/historical-notes.md` — 史料灵感笔记
- [x] `docs/codebuddy-prompts.md` — 各阶段 Prompt 记录
- [x] `docs/acceptance-checklist.md` — 本文件

## 3. 代码质量

- [x] 工程目录清晰，src/ 内按功能分离
- [x] 没有实现完整游戏逻辑（Phase 0 只展示骨架）
- [x] 没有接入真实 AI API
- [x] 没有硬编码 API Key
- [x] TypeScript 严格模式已启用

## 4. 配置安全

- [x] `.env.example` 提供了环境变量模板（不含真实值）
- [x] `.env` 已在 `.gitignore` 中
- [x] `.gitignore` 排除了 node_modules/、dist/、.env 等
- [x] API Key 只能通过环境变量传入

## 5. 后续就绪

- [x] `src/ai/` 目录已预留，含抽象接口定义
- [x] `src/game/` 目录已预留，待实现游戏引擎
- [x] `src/store/` 目录已预留，待接入 Zustand
- [x] `src/components/` 目录已预留，待实现 UI 组件
- [x] Tailwind CSS 已配置，含自定义主题色
- [x] Phase 1 可直接开始开发

## 6. 额外检查点

- [x] 无未使用的 `.gitkeep` 文件以外的空文件
- [x] favicon 已创建（汉"节"字 SVG）
- [x] 所有文档中文书写/中英双语
- [x] 项目可在离线状态下运行开发（仅需 node_modules）

---

**验收结论：** ✅ Phase 0 完成

**签名：** _______________

**日期：** _______________
