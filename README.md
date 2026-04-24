# Stellar Survey — Decentralized Future Insights

A premium, blockchain-powered survey application built on the **Stellar Network**.

## 🚀 Project Overview
This project demonstrates a full-stack decentralized application (DApp) that uses Stellar for immutable data storage. It includes both a high-end React frontend and a **Soroban Smart Contract** for on-chain state management.

## 📁 Project Structure
- **/contract**: Contains the **Soroban Smart Contract** written in Rust.
  - `src/lib.rs`: The core contract logic (voting, storage, authorization).
  - `src/test.rs`: Comprehensive test suite for the contract.
  - `Cargo.toml`: Build configuration for WASM deployment.
- **/src**: The React frontend application.
  - `stellar.js`: Integration logic using Stellar SDK and Horizon API.
  - `App.jsx`: Premium UI with glassmorphism and animated components.
  - `index.css`: Modern design system tokens and styles.

## 💎 Key Features
- **On-Chain Voting**: The smart contract ensures each address can only vote once per question and manages result counts on-ledger.
- **Data Anchoring**: Supports Classic Stellar patterns (Memo-based anchoring) and Soroban Smart Contracts.
- **Premium UI**: Ultra-dark mode aesthetic with cinematic animations and a responsive design.
- **Stellar Testnet**: Integrated with the Horizon Testnet and Friendbot for a zero-cost, real-world demonstration.

## 🛠️ How to Build
### Smart Contract
Requires Rust and the `soroban-cli`.
```bash
cd contract
cargo test
cargo build --target wasm32-unknown-unknown --release
```

### Frontend
```bash
npm install
npm run dev
```

## 📜 License
MIT
