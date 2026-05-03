# 🖥️ DeFi Portfolio Agent — Frontend

**The interactive frontend for an AI-powered DeFi assistant — featuring natural language chat, wallet connection, and a transaction confirmation layer.**

[![Demo](https://img.shields.io/badge/Live_Demo-Vercel-brightgreen)](https://defi-agent.mxdu.me)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![wagmi](https://img.shields.io/badge/wagmi-3.6-gray)](https://wagmi.sh)

---

🌐 Language: English | [中文](./README.zh.md)

> The frontend application for the DeFi Portfolio Agent — providing a natural language chat interface, MetaMask wallet connection, and a secure transaction confirmation layer with full parameter visibility and on-chain signing.

## 🎬 Live Demo

**Live Demo**: https://defi-agent.mxdu.me

**Video Walkthrough**:

[![Demo Video](https://img.youtube.com/vi/LcS9avCe8Cs/0.jpg)](https://www.youtube.com/watch?v=LcS9avCe8Cs)

The demo covers Aave V3 position queries (collateral, debt, and health factor), risk analysis and repayment recommendations, on-chain repay transaction construction, MetaMask signature confirmation, transaction execution on Base Sepolia, and automatic post-transaction position verification.



## ✨ Core Features

- **Natural Language Chat Interface**: Real-time communication with the backend AI Agent, supporting multi-turn conversations with session persistence.
- **Wallet Connection & Management**: One-click connect/disconnect via wagmi + MetaMask injected connector.
- **Transaction Confirmation Layer**: Automatically parses the transaction plan returned by the backend and presents a structured confirmation modal showing approve/repay parameters.
- **Dual-Step Transaction Execution**: Automatically detects the `need_approve` flag and handles the ERC20 approve step before executing the repay when necessary.
- **Post-Transaction Auto-Verification**: After a transaction is confirmed on-chain, automatically requests a position refresh from the backend, closing the verification loop.

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Web3 Interaction | wagmi 3 + viem 2 |
| Wallet Connection | MetaMask (injected connector) |
| Data Fetching | Fetch API + React state |

---

## 📂 Project Structure

```
app/
├── globals.css               # Global styles (Tailwind)
├── layout.tsx                # Root layout (Provider wrapper)
├── page.tsx                  # Main page (chat interface + confirmation logic)
└── providers.tsx             # wagmi + react-query Provider configuration

components/
├── ConfirmationModal.tsx     # Transaction confirmation modal (parses pending_action, executes approve + repay)
└── WalletButton.tsx          # Wallet connect/disconnect button

lib/
└── api.ts                    # Backend API wrapper (sendMessage / confirmAction)
```

---

## 🔁 Frontend-Backend Interaction Flow

```
User sends a message
  ↓
page.tsx: sendMessage() → POST /chat
  ↓
Parse [ACTION] tag from the response
  ↓
If pending_action exists → show ConfirmationModal
  ↓
User confirms:
  1. Switch to Base Sepolia network
  2. If need_approve = true → execute ERC20 approve tx → wait for on-chain confirmation
  3. Execute Aave repay tx → wait for on-chain confirmation
  4. confirmAction(tx_hash) → POST /confirm
  5. Auto-send "Check my updated Aave position" to verify the result
  ↓
User cancels: close modal, no on-chain operations performed
```

---

## 🛡️ Security Design

- **Full Transaction Parameter Visibility**: The confirmation modal displays action type, amount, network, approve target, and repay target — users sign only what they can fully verify.
- **Dual-Signature Flow**: Approve and repay transactions are signed separately, with each transaction confirmed independently in MetaMask.
- **Network Switching**: Automatically switches to Base Sepolia before executing any transaction, preventing accidental signatures on the wrong network.
- **Transaction Failure Handling**: If any step fails (user rejects signature, on-chain revert), all subsequent operations are cancelled — no orphaned confirm requests are submitted.

---

## 🚀 Local Development

```bash
git clone https://github.com/mxdu-tech/defi-agent-frontend
cd defi-agent-frontend
npm install
npm run dev
```

Environment variables (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🔗 Related Projects

**Backend Repository**: [defi-portfolio-agent](https://github.com/mxdu-tech/defi-portfolio-agent)

**Live Demo**: https://defi-agent.mxdu.me

---

## 📌 License

MIT License