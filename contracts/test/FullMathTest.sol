// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import '../libraries/FullMath.sol';

contract FullMathTest {
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 z
    ) external pure returns (uint256) {
        return FullMath.mulDiv(x, y, z);
    }

    function mulDivRoundingUp(
        uint256 x,
        uint256 y,
        uint256 z
    ) external pure returns (uint256) {
        return FullMath.mulDivRoundingUp(x, y, z);
    }
}
