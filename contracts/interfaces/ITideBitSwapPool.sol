// SPDX-License-Identifier: GPLv3
pragma solidity >=0.7.0 <0.9.0;

import './pool/ITideBitSwapPoolImmutables.sol';
import './pool/ITideBitSwapPoolState.sol';
import './pool/ITideBitSwapPoolDerivedState.sol';
import './pool/ITideBitSwapPoolActions.sol';
import './pool/ITideBitSwapPoolOwnerActions.sol';
import './pool/ITideBitSwapPoolEvents.sol';

/// @title The interface for a TideBitSwap Pool
/// @notice A TideBitSwap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface ITideBitSwapPool is
    ITideBitSwapPoolImmutables,
    ITideBitSwapPoolState,
    ITideBitSwapPoolDerivedState,
    ITideBitSwapPoolActions,
    ITideBitSwapPoolOwnerActions,
    ITideBitSwapPoolEvents
{

}
