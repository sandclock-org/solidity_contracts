---
description: 'Blockchain: Ethereum'
---

# scDAI

## **Overview**

_scDAI is a strategy almost completely similar to scUSDC but with DAI & sDAI as the deposit tokens._&#x20;

### **Mechanism**

Here's how the scDAI strategy operates in a streamlined manner:

1. **Initial Deposit**: Users deposit DAI or sDAI into the scDAI vault and are issued an equivalent amount of scDAI shares.
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

* **Deposits**: Minimal gas is required as it only involves minting scDAI shares.
* **Withdrawals**: To minimize withdrawal gas costs, an amount equivalent to 1% of the total assets managed by the strategy is readily available for immediate withdrawals. Exceeding this limit may incur additional gas costs.

### **Risk Mitigation**

#### **Smart Contract Risk**

Despite undergoing rigorous testing and audits by Trail of Bits, it's important to acknowledge the residual risk associated with smart contract vulnerabilities.

#### **Liquidation Risk**

Borrowing ETH against sDAI carries a liquidation risk, especially in volatile market conditions. To mitigate this, our backend system offers 24/7 monitoring that triggers an immediate rebalancing process if the LTV increases by 5%, thereby adjusting the loan amounts to align with target LTV values.

Invest wisely and leverage the power of scDAI to optimize your yield generation in a secure and efficient manner.

### Audits

[Audited by Trail of Bits.](https://github.com/trailofbits/publications/blob/master/reviews/2023-07-sandclock-securityreview.pdf) \
\
The only changes made in the scUSDC contracts to have it ready to support DAI for scDAI was&#x20;

* Address changes of the deposit tokens & oracles
* Change of the swap routes to support sDai to eth swaps and vice versa instead of usdc to eth swaps.
* Addition of a new `depositDai()` method to support DAI deposits.
