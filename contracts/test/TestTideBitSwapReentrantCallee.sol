// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import '../libraries/TickMath.sol';

import '../interfaces/callback/ITideBitSwapSwapCallback.sol';

import '../interfaces/ITideBitSwapPool.sol';

contract TestTideBitSwapReentrantCallee is ITideBitSwapSwapCallback {
    string private constant expectedReason = 'LOK';

    function swapToReenter(address pool) external {
        ITideBitSwapPool(pool).swap(address(0), false, 1, TickMath.MAX_SQRT_RATIO - 1, new bytes(0));
    }

    function tideBitSwapSwapCallback(
        int256,
        int256,
        bytes calldata
    ) external override {
        // try to reenter swap
        try ITideBitSwapPool(msg.sender).swap(address(0), false, 1, 0, new bytes(0)) {} catch Error(
            string memory reason
        ) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        // try to reenter mint
        try ITideBitSwapPool(msg.sender).mint(address(0), 0, 0, 0, new bytes(0)) {} catch Error(string memory reason) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        // try to reenter collect
        try ITideBitSwapPool(msg.sender).collect(address(0), 0, 0, 0, 0) {} catch Error(string memory reason) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        // try to reenter burn
        try ITideBitSwapPool(msg.sender).burn(0, 0, 0) {} catch Error(string memory reason) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        // try to reenter flash
        try ITideBitSwapPool(msg.sender).flash(address(0), 0, 0, new bytes(0)) {} catch Error(string memory reason) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        // try to reenter collectProtocol
        try ITideBitSwapPool(msg.sender).collectProtocol(address(0), 0, 0) {} catch Error(string memory reason) {
            require(keccak256(abi.encode(reason)) == keccak256(abi.encode(expectedReason)));
        }

        require(false, 'Unable to reenter');
    }
}
