# 🖥️ DeFi Portfolio Agent — Frontend

**AI DeFi 助手的前端交互界面 — 自然语言对话、钱包连接、交易确认。**

[![Demo](https://img.shields.io/badge/Live_Demo-Vercel-brightgreen)](https://defi-agent.mxdu.me)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![wagmi](https://img.shields.io/badge/wagmi-3.6-gray)](https://wagmi.sh)

---

🌐 语言: [English](./README.md) | 中文

> DeFi Portfolio Agent 的前端应用，提供自然语言对话界面、MetaMask 钱包连接，以及带参数展示和链上签名确认的交易安全层。

## 🎬 在线演示

**Live Demo**: https://defi-agent.mxdu.me

**演示视频**：

https://www.youtube.com/watch?v=LcS9avCe8Cs

演示功能包括：Aave V3 仓位查询（抵押/借贷/健康因子）、风险分析与还款建议、链上 repay 交易构造、用户 MetaMask 签名确认、交易上链（Base Sepolia）、交易后仓位自动验证。

---

## ✨ 核心功能

- **自然语言对话界面**：与后端 AI Agent 实时通信，支持多轮对话和会话保持
- **钱包连接与管理**：基于 wagmi + MetaMask injected connector，一键连接/断开
- **交易安全确认层**：自动解析后端返回的交易计划，弹出结构化确认弹窗，展示 approve/repay 参数
- **双步骤交易执行**：根据 `need_approve` 标记自动判断是否需要先执行 ERC20 approve，再执行 repay
- **交易后自动验证**：交易上链后自动请求后端重新查询仓位，形成验证闭环

---

## 🏗 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| Web3 交互 | wagmi 3 + viem 2 |
| 钱包连接 | MetaMask (injected connector) |
| 数据请求 | Fetch API + React state |

---

## 📂 项目结构

```
app/
├── globals.css               # 全局样式 (Tailwind)
├── layout.tsx                # 根布局 (Provider 注入)
├── page.tsx                  # 主页面 (聊天界面 + 确认逻辑)
└── providers.tsx             # wagmi + react-query Provider 配置

components/
├── ConfirmationModal.tsx     # 交易确认弹窗 (解析 pending_action、执行 approve + repay)
└── WalletButton.tsx          # 钱包连接/断开按钮

lib/
└── api.ts                    # 后端 API 封装 (sendMessage / confirmAction)
```

---

## 🔁 前后端交互流程

```
用户输入消息
  ↓
page.tsx: sendMessage() → POST /chat
  ↓
解析返回体中的 [ACTION] 标签
  ↓
如果有 pending_action → 弹出 ConfirmationModal
  ↓
用户点击确认:
  1. 切换至 Base Sepolia 网络
  2. 如果 need_approve = true → 执行 ERC20 approve 交易 → 等待链上确认
  3. 执行 Aave repay 交易 → 等待链上确认
  4. confirmAction(tx_hash) → POST /confirm
  5. 自动发送 "Check my updated Aave position" 验证结果
  ↓
交易取消: 关闭弹窗，不做任何链上操作
```

---

## 🛡️ 安全设计

- **交易参数完全可视化**：确认弹窗展示 action 类型、金额、网络、approve 目标、repay 目标，用户所见即所签
- **双层签名确认**：approve 和 repay 分开签名，每笔交易在 MetaMask 中独立确认
- **网络切换**：执行交易前自动切换至 Base Sepolia，避免用户误操作在其他网络签名
- **交易失败处理**：任一步骤失败（用户拒绝签名、链上 revert）均终止后续操作，不提交孤立的 confirm 请求

---

## 🚀 本地运行

```bash
git clone https://github.com/mxdu-tech/defi-agent-frontend
cd defi-agent-frontend
npm install
npm run dev
```

环境变量 (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔗 关联项目

**后端仓库**: [defi-portfolio-agent](https://github.com/mxdu-tech/defi-portfolio-agent)

## 🌐 在线演示

- 稳定演示入口（推荐）  

  👉 https://defi-agent.mxdu.me

- 架构版本入口  

  👉 https://portfolio-agent.defi.mxdu.me

---

## 📌 协议与许可

MIT License