// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.10;

library ERC165Query {
    bytes4 constant InvalidID = 0xffffffff;
    bytes4 constant ERC165ID = 0x01ffc9a7;

    function doesContractImplementInterface(
        address _contract,
        bytes4 _interfaceId
    ) internal view returns (bool) {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b10000, 1037618708657) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b10001, 2) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b11000, _contract) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b11001, _interfaceId) }
        uint256 success;
        uint256 result;

        (success, result) = noThrowCall(_contract, ERC165ID);
        if ((success == 0) || (result == 0)) {
            return false;
        }

        (success, result) = noThrowCall(_contract, InvalidID);
        if ((success == 0) || (result != 0)) {
            return false;
        }

        (success, result) = noThrowCall(_contract, _interfaceId);
        if ((success == 1) && (result == 1)) {
            return true;
        }
        return false;
    }

    function noThrowCall(address _contract, bytes4 _interfaceId)
        internal
        view
        returns (uint256 success, uint256 result)
    {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b20000, 1037618708658) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b20001, 2) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b21000, _contract) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00b21001, _interfaceId) }
        bytes4 erc165ID = ERC165ID;

        assembly {
            let x := mload(0x40) // Find empty storage location using "free memory pointer"
            mstore(x, erc165ID) // Place signature at beginning of empty storage
            mstore(add(x, 0x04), _interfaceId) // Place first argument directly next to signature

            success := staticcall(
                30000, // 30k gas
                _contract, // To addr
                x, // Inputs are stored at location x
                0x24, // Inputs are 36 bytes long
                x, // Store output over input (saves space)
                0x20
            ) // Outputs are 32 bytes long

            result := mload(x) // Load the result
        }
    }
}
