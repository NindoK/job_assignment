// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface ITarget is IERC20 {
    function exampleFunction(address from, address to, uint256 amount) external;
}
