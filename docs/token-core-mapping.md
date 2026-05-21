# Token Core Mapping

This work is a Level 1 Mock Adapter prototype. It does not call Token Core directly yet, but it keeps a clean adapter boundary so a later Level 2 version can replace mock behavior with `tcx-wasm`.

## Relevant Packages

- `tcx-wasm`: browser bridge to Token Core capabilities.
- `tcx-keystore`: local keystore creation/import capability.
- `tcx-eth`: EVM account derivation and transaction/message signing capability.
- `tcx-proto`: data model boundary for chain operations where applicable.

## Capability Mapping

Create demo wallet:

- Token Core package: `tcx-keystore` through `tcx-wasm`
- API mapping: `create_keystore`
- Current implementation: mock session wallet with static demo address

Derive EVM account:

- Token Core package: `tcx-eth` through `tcx-wasm`
- API mapping: `derive_accounts`
- Current implementation: mock Sepolia-like address and derivation path

Review and sign action:

- Token Core package: `tcx-eth` through `tcx-wasm`
- API mapping: `sign_tx`
- Current implementation: mock signature artifact after readable batch review

Batch calls, sponsorship, gas quote, and policy result:

- Token Core package: none
- Current implementation: local fixtures in `src/app.js`
- Boundary: EIP-5792-style batch calls and Paymaster behavior are represented as product-level mock data.

## Safety Boundary

The prototype never asks for a real mnemonic, private key, wallet password, or keystore. It does not connect to a wallet, call RPC, submit user operations, or broadcast transactions. Any future Level 2 integration must use fake or testnet secrets only and must keep signing inside a `TcxWasmAdapter`.
