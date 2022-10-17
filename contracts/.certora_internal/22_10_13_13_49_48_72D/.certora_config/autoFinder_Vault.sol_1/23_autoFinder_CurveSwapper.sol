// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ICurve} from "../interfaces/curve/ICurve.sol";

/// Helper abstract contract to manage curve swaps
abstract contract CurveSwapper {
    using SafeERC20 for IERC20;

    //
    // Structs
    //

    struct Swapper {
        /// Curve pool instance
        ICurve pool;
        /// decimals in token
        uint8 tokenDecimals;
        /// decimals in underlying
        uint8 underlyingDecimals;
        /// index of the deposit token we want to exchange to/from underlying
        int128 tokenI;
        /// index of underlying used by the vault (presumably always UST)
        int128 underlyingI;
    }

    struct SwapPoolParam {
        address token;
        address pool;
        int128 tokenI;
        int128 underlyingI;
    }

    //
    // Events
    //

    /// Emitted when a new swap pool is added
    event CurveSwapPoolAdded(
        address indexed token,
        address indexed pool,
        int128 tokenI,
        int128 underlyingI
    );

    /// Emitted when a swap pool is removed
    event CurveSwapPoolRemoved(address indexed token);

    /// Emitted after every swap
    event Swap(
        address indexed fromToken,
        address indexed toToken,
        uint256 fromAmount,
        uint256 toAmount
    );

    //
    // State
    //

    /// token => curve pool (for trading token/underlying)
    mapping(address => Swapper) public swappers;

    /// @return The address of the vault's main underlying token
    function getUnderlying() public view virtual returns (address);

    /// Swaps a given amount of
    /// Only works if the pool has previously been inserted into the contract
    ///
    /// @param _token The token we want to swap into
    /// @param _amount The amount of underlying we want to swap
    function _swapIntoUnderlying(
        address _token,
        uint256 _amount,
        uint256 _slippage
    ) internal returns (uint256 amount) {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00580000, 1037618708568) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00580001, 3) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00581000, _token) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00581001, _amount) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00581002, _slippage) }
        address underlyingToken = getUnderlying();
        if (_token == underlyingToken) {
            // same token, nothing to do
            return _amount;
        }

        Swapper storage swapper = swappers[_token];
        require(
            address(swapper.pool) != address(0x0),
            "non-existing swap pool"
        );

        uint256 minAmount = _calcMinDy(
            _amount,
            swapper.tokenDecimals,
            swapper.underlyingDecimals,
            _slippage
        );

        amount = swapper.pool.exchange_underlying(
            swapper.tokenI,
            swapper.underlyingI,
            _amount,
            minAmount
        );

        emit Swap(_token, underlyingToken, _amount, amount);
    }

    /// Swaps a given amount of Underlying into a given token
    /// Only works if the pool has previously been inserted into the contract
    ///
    /// @param _token The token we want to swap into
    /// @param _amount The amount of underlying we want to swap
    function _swapFromUnderlying(
        address _token,
        uint256 _amount,
        uint256 _slippage
    ) internal returns (uint256 amount) {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00570000, 1037618708567) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00570001, 3) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00571000, _token) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00571001, _amount) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00571002, _slippage) }
        if (_token == getUnderlying()) {
            // same token, nothing to do
            return _amount;
        }

        Swapper storage swapper = swappers[_token];

        uint256 minAmount = _calcMinDy(
            _amount,
            swapper.underlyingDecimals,
            swapper.tokenDecimals,
            _slippage
        );

        amount = swapper.pool.exchange_underlying(
            swapper.underlyingI,
            swapper.tokenI,
            _amount,
            minAmount
        );

        emit Swap(getUnderlying(), _token, _amount, amount);
    }

    function _calcMinDy(
        uint256 _amount,
        uint8 _fromDecimals,
        uint8 _toDecimals,
        uint256 _slippage
    ) internal pure returns (uint256) {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00560000, 1037618708566) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00560001, 4) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00561000, _amount) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00561001, _fromDecimals) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00561002, _toDecimals) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00561003, _slippage) }
        return
            (_amount * _slippage * 10**_toDecimals) / (10**_fromDecimals * 10000);
    }

    /// This is necessary because some tokens (USDT) force you to approve(0)
    /// before approving a new amount meaning if we always approved blindly,
    /// then we could get random failures on the second attempt
    function _approveIfNecessary(address _token, address _pool) internal {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00590000, 1037618708569) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00590001, 2) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00591000, _token) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff00591001, _pool) }
        uint256 allowance = IERC20(_token).allowance(address(this), _pool);

        if (allowance == 0) {
            IERC20(_token).safeApprove(_pool, type(uint256).max);
        }
    }

    /// @param _swapPools configs for each swap pool
    function _addPools(SwapPoolParam[] memory _swapPools) internal {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005a0000, 1037618708570) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005a0001, 1) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005a1000, _swapPools) }
        uint256 length = _swapPools.length;
        for (uint256 i = 0; i < length; ++i) {
            _addPool(_swapPools[i]);
        }
    }

    function _addPool(SwapPoolParam memory _param) internal {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005b0000, 1037618708571) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005b0001, 1) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005b1000, _param) }
        require(
            address(swappers[_param.token].pool) == address(0),
            "token already has a swap pool"
        );
        require(
            ICurve(_param.pool).coins(uint256(uint128(_param.underlyingI))) ==
                getUnderlying(),
            "_underlyingI does not match underlying token"
        );

        uint256 tokenDecimals = IERC20Metadata(_param.token).decimals();
        uint256 underlyingDecimals = IERC20Metadata(getUnderlying()).decimals();

        // TODO check if _token and _underlyingIndex match the pool settings
        swappers[_param.token] = Swapper(
            ICurve(_param.pool),
            uint8(tokenDecimals),
            uint8(underlyingDecimals),
            _param.tokenI,
            _param.underlyingI
        );

        _approveIfNecessary(getUnderlying(), address(_param.pool));
        _approveIfNecessary(_param.token, address(_param.pool));

        emit CurveSwapPoolAdded(
            _param.token,
            _param.pool,
            _param.tokenI,
            _param.underlyingI
        );
    }

    function _removePool(address _inputToken) internal {assembly { mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005c0000, 1037618708572) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005c0001, 1) mstore(0xffffff6e4604afefe123321beef1b01fffffffffffffffffffffffff005c1000, _inputToken) }
        require(
            address(swappers[_inputToken].pool) != address(0),
            "pool does not exist"
        );
        delete swappers[_inputToken];

        emit CurveSwapPoolRemoved(_inputToken);
    }
}
