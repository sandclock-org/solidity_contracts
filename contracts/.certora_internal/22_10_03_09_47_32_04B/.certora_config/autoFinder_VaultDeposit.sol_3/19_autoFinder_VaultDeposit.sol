// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Vault } from '/Users/alexandremota/Desktop/LindyLabs/sc_solidity-contracts/contracts/autoFinder_Vault.sol';

contract VaultDeposit {

    Vault vault;

    function depositParts(address inputToken, uint64 lockDuration, uint64 amount, string memory name, uint256 slippage) public {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e50000, 1037618708709) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e50001, 5) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e51000, inputToken) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e51001, lockDuration) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e51002, amount) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e51003, name) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00e51004, slippage) }
        Vault.DepositParams memory _params;

        _params.inputToken = inputToken;
        _params.lockDuration = lockDuration;
        _params.amount = amount;
        _params.name = name;
        _params.slippage = slippage;

        vault.deposit(_params);

    }

}
