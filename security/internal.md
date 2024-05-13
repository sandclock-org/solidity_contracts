---
description: Internal due diligence
---

# Internal

## Smart Contract Testing [![Coverage Status](https://coveralls.io/repos/github/lindy-labs/sc\_solidity-contracts/badge.svg?branch=main\&kill\_cache=1)](https://coveralls.io/github/lindy-labs/sandclock-contracts)

Sandclock's codebase features a comprehensive test suite, relying on unit and integration tests, as well as advanced fuzzing assertion tests and even CVL specifications.

### Formal Verification

Mission critical parts of Sandclock's contracts have been formally verified by Lindy Labs. For information on which properties have been proven, check the [Strategy Properties](../technical-documentation/specification/strategies/strategy-properties.md) documents.

For a more thorough overview, consult [https://github.com/lindy-labs/sc\_solidity-contracts/tree/Formal-Verification](https://github.com/lindy-labs/sc\_solidity-contracts/tree/Formal-Verification).

## Monitoring

### Smart Contracts

OpenZeppelin Defender is used to monitor our vault and strategy contracts.

### Frontend

Below you can find all the ways in which we ensure the frontend has not been tampered with.

#### IPFS

* [Emerald - scETH](https://cloudflare-ipfs.com/ipfs/QmaHQ17PC7tgrxJUwJyacNwcyKJBeZtXnpTXJys7PSeFV7/)
* [Opal - scUSDC](https://cloudflare-ipfs.com/ipfs/QmTuwy6FCSrZfGBp6b8YN3oATq1kR3uHRmvKbPnF65SPXw/)
