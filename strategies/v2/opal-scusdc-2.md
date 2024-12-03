---
description: 'Blockchain: Ethereum'
---

# scSDAI

## **Overview**

**scSDAI** is a strategy closely mirroring scUSDC, with the key difference being the use of sDAI as the deposit token.

### **Mechanism**

Here's how the scSDAI strategy operates in a streamlined manner:

1. **Initial Deposit**: Users deposit sDAI into the scSDAI vault and are issued an equivalent amount of scSDAI shares.
2. **Loan Creation**: The strategy engages one or multiple lending markets (currently just [SparkLend](https://docs.spark.fi/defi-infrastructure/sparklend)), utilizing sDAI to secure a loan in ETH.
3. **Yield Generation**: The borrowed ETH is allocated to the scETH strategy, thereby generating yield through leveraged Ethereum staking.
4. **Yield Conversion & Compounding**: The yield generated in ETH is converted back to sDAI. The process is then iteratively repeated, leveraging steps 2 and 3, to compound interest.

### **Portfolio Rebalancing**

To maintain a healthy Loan-to-Value (LTV) ratio, the strategy employs a process known as "rebalancing." This is triggered when:

* The LTV deviates by 5% or more from the target.
* Additional new deposits are made into the strategy.
* The yield crosses a predetermined threshold.

### **Gas Efficiency**

We prioritize gas efficiency at every step:

* **Deposits**: Minimal gas is required as it only involves minting scSDAI shares.
* **Withdrawals**: To minimize withdrawal gas costs, an amount equivalent to 1% of the total assets managed by the strategy is readily available for immediate withdrawals. Exceeding this limit may incur additional gas costs.

### **Risk Mitigation**

#### **Smart Contract Risk**

Despite undergoing rigorous testing and audits by Trail of Bits, it's important to acknowledge the residual risk associated with smart contract vulnerabilities.

#### **Liquidation Risk**

Borrowing ETH against sDAI carries a liquidation risk, especially in volatile market conditions. To mitigate this, our backend system offers 24/7 monitoring that triggers an immediate rebalancing process if the LTV increases by 5%, thereby adjusting the loan amounts to align with target LTV values.

Invest wisely and leverage the power of scSDAI to optimize your yield generation in a secure and efficient manner.

### Audits

scSDAI’s contract code is based on the fully audited scUSDC contract ([Audited by Trail of Bits](https://github.com/trailofbits/publications/blob/master/reviews/2023-07-sandclock-securityreview.pdf)). However, some modifications were not part of the original audit, including:

1. Replacing USDC with sDAI as the underlying token and updating the associated price oracles.
2. Adjusting swap routes to support sDAI-to-ETH and ETH-to-sDAI swaps instead of USDC-to-ETH swaps.
