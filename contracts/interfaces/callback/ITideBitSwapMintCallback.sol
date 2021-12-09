// SPDX-License-Identifier: GPLv3
pragma solidity >=0.7.0 <0.9.0;

/// @title Callback for ITideBitSwapPoolActions#mint
/// @notice Any contract that calls ITideBitSwapPoolActions#mint must implement this interface
interface ITideBitSwapMintCallback {
    /// @notice Called to `msg.sender` after minting liquidity to a position from ITideBitSwapPool#mint.
    /// @dev In the implementation you must pay the pool tokens owed for the minted liquidity.
    /// The caller of this method must be checked to be a TideBitSwapPool deployed by the canonical TideBitSwapFactory.
    /// @param amount0Owed The amount of token0 due to the pool for the minted liquidity
    /// @param amount1Owed The amount of token1 due to the pool for the minted liquidity
    /// @param data Any data passed through by the caller via the ITideBitSwapPoolActions#mint call
    function tideBitSwapMintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external;
}
