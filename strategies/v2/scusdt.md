# scUSDT

{% hint style="info" %}
For investing in scUSDT, we recommend a minimum investment time of at least a few weeks. Otherwise, the user may realize small losses when redeeming.

This is because of the costs associated with investing and the fact we use an oracle to estimate the current worth of the vault assets.

This is because we want to offer instant withdrawals and be 100% liquid.
{% endhint %}

**scUSDT** is a strategy closely mirroring [scUSDC](opal-scusdc.md), with the key difference being the use of USDT as the deposit token.

## **Overview**

**scUSDT** is a sophisticated yield-generating strategy that is following the ERC4626 standard. Leveraging the power of Ethereum staking, this strategy aims to deliver consistent yield in USDT. To achieve this, scUSDT collaborates with another Sandclock strategy, [scETH](https://docs.sandclock.org/current/strategies/v2/emerald-sceth), while also utilizing a diverse range of lending markets.

### **Mechanism**

Here's how the scUSDT strategy operates in a streamlined manner:

1. **Initial Deposit**: Users deposit USDT into the scUSDT vault and are issued an equivalent amount of scUSDT shares.
2. **Loan Creation**: The strategy engages one or multiple lending markets, utilizing the USDT deposits to secure a loan in ETH.
3. **Yield Generation**: The borrowed ETH is allocated to the scETH strategy, thereby generating yield through leveraged Ethereum staking.
4. **Yield Conversion & Compounding**: The yield generated in ETH is converted back to USDT. The process is then iteratively repeated, leveraging steps 2 and 3, to compound interest.

### **Portfolio Rebalancing**

To maintain a healthy Loan-to-Value (LTV) ratio, the strategy employs a process known as "rebalancing." This is triggered when:

* The LTV deviates by 5% or more from the target.
* Additional new deposits are made into the strategy.
* The yield crosses a predetermined threshold.

### **Asset Allocation**

Our proprietary "allocation algorithm" ensures optimal asset allocation by dynamically interacting with multiple lending markets to secure the most favorable loan rates for USDT/ETH loans. This dynamic approach allows the strategy to take loans from various markets concurrently, not limiting it to a single source. Should the algorithm detect suboptimal rates, it initiates a "reallocation" process. Inefficient loans are swiftly settled using flash loans, and the collateral is moved to a lending market offering superior rates.

### **Gas Efficiency**

We prioritize gas efficiency at every step:

* **Deposits**: Minimal gas is required as it only involves minting scUSDT shares.
* **Withdrawals**: To minimize withdrawal gas costs, an amount equivalent to 1% of the total assets managed by the strategy is readily available for immediate withdrawals. Exceeding this limit may incur additional gas costs.

### **Risk Mitigation**

#### **Smart Contract Risk**

Despite undergoing rigorous testing and audits by Trail of Bits, it's important to acknowledge the residual risk associated with smart contract vulnerabilities.

#### **Liquidation Risk**

Borrowing ETH against USDT carries a liquidation risk, especially in volatile market conditions. To mitigate this, our backend system offers 24/7 monitoring that triggers an immediate rebalancing process if the LTV increases by 5%, thereby adjusting the loan amounts to align with target LTV values.

Invest wisely and leverage the power of scUSDT to optimize your yield generation in a secure and efficient manner.

### Audits

scUSDT’s contract code is based on the fully audited scUSDC contract ([Audited by Trail of Bits](https://github.com/trailofbits/publications/blob/master/reviews/2023-07-sandclock-securityreview.pdf)). However, some modifications were not part of the original audit, including:

1. Replacing USDC with USDT as the underlying token and updating the associated price oracles.
2. Adjusting swap routes to support USDT-to-ETH and ETH-to-USDT swaps instead of USDC-to-ETH swaps.
