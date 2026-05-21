# Gasless Action Rehearsal / 免 Gas 行动排练

Gasless Action Rehearsal is an interactive web wallet prototype for the imToken 10th anniversary AI co-creation event. It helps users review a sponsored on-chain action before a mock signature is created.

免 Gas 行动排练是一个网页钱包原型，用来帮助用户在没有 gas token 的情况下，读懂 sponsor 规则、批量调用内容、授权额度和签名前风险。

## Run / 运行

Open `index.html` in a modern browser.

用现代浏览器直接打开 `index.html`。

No dependency install, build step, wallet connection, RPC, Paymaster, or API key is required.

无需安装依赖，无需构建，也不会连接真实钱包、RPC、Paymaster 或 API。

## Project Explanation / 作品说明

Users can choose a mock on-chain task, adjust amount, approval style, and sponsor policy, then inspect a readable batch before creating a mock signature. The prototype highlights exact approval, unlimited approval, sponsor mismatch, and no-approval NFT claim flows.

用户可以选择一个模拟链上任务，调整金额、授权方式和 sponsor 策略，然后在 mock 签名前审阅可读批量调用。原型重点展示精确授权、无限授权、无 sponsor 匹配和 NFT claim 无需授权等状态。

## Completion Status / 作品完成度

可交互原型

## Implementation Level / 实现层级

Level 1: Mock Adapter prototype.

The UI and adapter boundary are designed around Token Core capabilities, but this version does not call Token Core directly.

## Token Core Usage / Token Core 使用说明

引用包

`tcx-wasm`: browser bridge for future Token Core integration.

`tcx-keystore`: maps to local keystore creation through `create_keystore`.

`tcx-eth`: maps to EVM account derivation and transaction signing through `derive_accounts` and `sign_tx`.

能力映射

Create demo wallet: maps to `tcx-keystore` / `create_keystore`; currently implemented as a mock wallet session.

Derive EVM account: maps to `tcx-eth` / `derive_accounts`; currently represented with a static mock Sepolia address.

Review and sign action: maps to `tcx-eth` / `sign_tx`; currently creates a mock signature artifact only after readable intent review.

边界与安全

Paymaster sponsorship, EIP-5792-style batch calls, gas estimates, balances, risk policy, transaction history, and transaction hashes are mock fixtures and are not Token Core capabilities. The prototype does not request real secrets, connect a wallet, call RPC, or broadcast transactions.

## Safety / 安全边界

Do not enter real mnemonics, private keys, wallet passwords, production keystores, or wallets holding real assets.

请勿输入真实助记词、私钥、钱包密码、生产 keystore，或连接任何持有真实资产的钱包。

This demo does not perform real signing or broadcasting.

本 demo 不执行真实签名或广播。

## Files / 文件

- `index.html`: static app shell
- `src/app.js`: mock wallet adapter behavior and interaction state
- `src/styles.css`: responsive wallet UI
- `docs/token-core-mapping.md`: Token Core mapping and non-Core boundary
