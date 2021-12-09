// SPDX-License-Identifier: GPLv3
pragma solidity >=0.7.0 <0.9.0;

/// @title Callback for ITideBitSwapPoolActions#flash
/// @notice Any contract that calls ITideBitSwapPoolActions#flash must implement this interface
interface ITideBitSwapFlashCallback {
    /// @notice Called to `msg.sender` after transferring to the recipient from ITideBitSwapPool#flash.
    /// @dev In the implementation you must repay the pool the tokens sent by flash plus the computed fee amounts.
    /// The caller of this method must be checked to be a TideBitSwapPool deployed by the canonical TideBitSwapFactory.
    /// @param fee0 The fee amount in token0 due to the pool by the end of the flash
    /// @param fee1 The fee amount in token1 due to the pool by the end of the flash
    /// @param data Any data passed through by the caller via the ITideBitSwapPoolActions#flash call
    function tideBitSwapFlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external;
}
