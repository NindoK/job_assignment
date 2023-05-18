import { ethers } from 'ethers'

function isValidEthereumAddress(address: string): boolean {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch (error) {
    return false
  }
}

module.exports = isValidEthereumAddress
