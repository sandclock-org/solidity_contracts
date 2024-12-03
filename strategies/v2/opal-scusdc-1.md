---
description: 'Blockchain: Ethereum'
---

# scDAI

## **Overview**

**scDAI** is an ERC4626-compliant wrapper contract for scSDAI, allowing users to interact with scSDAI directly using DAI instead of sDAI.

### **Mechanism**

* **Deposits:** Users deposit DAI into the scDAI contract. The contract converts DAI into sDAI, which is then deposited into the scSDAI vault for yield generation.
* **Yield Generation:** Yield is generated entirely within the scSDAI vault. The scDAI contract itself does not implement any additional yield-generating mechanisms.
* **Withdrawals:** When a user initiates a withdrawal, scDAI redeems the corresponding scSDAI shares, converts them back into sDAI, and finally into DAI, transferring the resulting DAI to the user.

### **Portfolio Rebalancing**

As a utility wrapper, scDAI does not handle portfolio rebalancing or implement specific gas optimization strategies. These functionalities are managed by the [scSDAI](opal-scusdc-2.md) vault.

### **Risk Mitigation**

#### **Smart Contract Risk**

The scDAI contract has not undergone external audits due to its limited functionality, which is restricted to converting DAI to sDAI (and vice versa) and facilitating interactions with scSDAI.

#### **Liquidation Risk**

There is no additional liquidation risk beyond what is inherent in the scSDAI strategy.

### Audits

The scDAI contract code has not been audited by external auditors.

### Conclusion

scDAI is a straightforward utility contract that simplifies user interactions with the scSDAI vault by enabling DAI deposits and withdrawals. It inherits the benefits and risks of the underlying scSDAI strategy while offering a user-friendly interface for DAI-based participation.
