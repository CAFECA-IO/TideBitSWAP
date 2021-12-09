// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import '../interfaces/IERC20Minimal.sol';

import '../interfaces/callback/ITideBitSwapSwapCallback.sol';
import '../interfaces/ITideBitSwapPool.sol';

contract TideBitSwapPoolSwapTest is ITideBitSwapSwapCallback {
    int256 private _amount0Delta;
    int256 private _amount1Delta;

    function getSwapResult(
        address pool,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96
    )
        external
        returns (
            int256 amount0Delta,
            int256 amount1Delta,
            uint160 nextSqrtRatio
        )
    {
        (amount0Delta, amount1Delta) = ITideBitSwapPool(pool).swap(
            address(0),
            zeroForOne,
            amountSpecified,
            sqrtPriceLimitX96,
            abi.encode(msg.sender)
        );

        (nextSqrtRatio, , , , , , ) = ITideBitSwapPool(pool).slot0();
    }

    function tideBitSwapSwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        address sender = abi.decode(data, (address));

        if (amount0Delta > 0) {
            IERC20Minimal(ITideBitSwapPool(msg.sender).token0()).transferFrom(sender, msg.sender, uint256(amount0Delta));
        } else if (amount1Delta > 0) {
            IERC20Minimal(ITideBitSwapPool(msg.sender).token1()).transferFrom(sender, msg.sender, uint256(amount1Delta));
        }
    }
}
