// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ITarget.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Target is ITarget, ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }

    function exampleFunction(address from, address to, uint256 amount) external override {
        _transfer(from, to, amount);
    }
}
