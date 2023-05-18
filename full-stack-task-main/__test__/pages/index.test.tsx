import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/pages/index'
import { getTokenBalances } from '@/lib/eth'

import axios from 'axios'
import { getMainnetSdk } from '@dethcrypto/eth-sdk-client'
import { ethers } from 'ethers'
import { act } from 'react-dom/test-utils'

jest.mock('@/lib/eth')
jest.mock('axios')
jest.mock('@dethcrypto/eth-sdk-client')

describe('Home component', () => {
  it('renders the component without errors', () => {
    render(<Home />)
    expect(screen.getByText('Beniamino Daniele')).toBeInTheDocument()
    expect(screen.getByText('Full-stack candidate')).toBeInTheDocument()
    expect(screen.getByText('@NindoK')).toBeInTheDocument()
    expect(screen.getByTestId('dai-value')).toBeInTheDocument()
    expect(screen.getByTestId('usdc-value')).toBeInTheDocument()
    expect(screen.getByTestId('mkr-value')).toBeInTheDocument()
    expect(screen.getByTestId(`dai-value`)).toHaveTextContent('---')
    expect(screen.getByTestId(`usdc-value`)).toHaveTextContent('---')
    expect(screen.getByTestId(`mkr-value`)).toHaveTextContent('---')
  })

  it('button should be present and disabled', () => {
    render(<Home />)
    const buttonElement = screen.getByRole('button')
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toBeDisabled()
  })

  it('renders an error message when the address has zero balance', async () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    const testBalances = [
      { name: 'Dai', symbol: 'DAI', balance: '0' },
      { name: 'USD Coin', symbol: 'USDC', balance: '0' },
      { name: 'Maker', symbol: 'MKR', balance: '0' },
    ]

    ;(getTokenBalances as jest.Mock).mockResolvedValueOnce(testBalances)
    ;(axios.post as jest.Mock).mockResolvedValueOnce({ data: 'success' })

    render(<Home />)
    const submitButton = screen.getByRole('button')

    const addressInput = screen.getByLabelText('Address')
    fireEvent.change(addressInput, { target: { value: testAddress } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getTokenBalances).toHaveBeenCalledWith(testAddress)
    })

    expect(
      screen.getByText('At least one balance needs to be greater than zero.'),
    ).toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('submits a valid address and displays fetched balances', async () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    const testBalances = [
      { name: 'Dai', symbol: 'DAI', balance: '100' },
      { name: 'USD Coin', symbol: 'USDC', balance: '200' },
      { name: 'Maker', symbol: 'MKR', balance: '300' },
    ]

    ;(getTokenBalances as jest.Mock).mockResolvedValueOnce(testBalances)
    ;(axios.post as jest.Mock).mockResolvedValueOnce({ data: 'success' })

    render(<Home />)

    const submitButton = screen.getByRole('button')

    const addressInput = screen.getByLabelText('Address')
    fireEvent.change(addressInput, { target: { value: testAddress } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getTokenBalances).toHaveBeenCalledWith(testAddress)
    })

    testBalances.forEach((token) => {
      expect(screen.getByTestId(`${token.symbol.toLowerCase()}-value`)).toBeInTheDocument()
      expect(screen.getByTestId(`${token.symbol.toLowerCase()}-value`)).toHaveTextContent(
        token.balance,
      )
    })

    expect(axios.post).toHaveBeenCalledWith('/api/balances', {
      address: testAddress,
      balances: testBalances.map((token, index) => ({
        token: ['DAI', 'USDC', 'MKR'][index],
        balance: token.balance,
      })),
    })
  })

  it('should return the expected token balances', async () => {
    const address = '0x1234567890123456789012345678901234567890'

    const mockSdk = {
      dai: { decimals: jest.fn(), balanceOf: jest.fn() },
      usdc: { decimals: jest.fn(), balanceOf: jest.fn() },
      mkr: { decimals: jest.fn(), balanceOf: jest.fn() },
    }

    const testBalances = [
      { name: 'Dai', symbol: 'DAI', balance: '1' },
      { name: 'USD Coin', symbol: 'USDC', balance: '2' },
      { name: 'Maker', symbol: 'MKR', balance: '3' },
    ]

    ;(getTokenBalances as jest.Mock).mockResolvedValueOnce(testBalances)
    ;(getMainnetSdk as jest.Mock).mockReturnValueOnce(mockSdk)

    // Set up mock return values for the contract functions
    mockSdk.dai.decimals.mockResolvedValueOnce(18)
    mockSdk.usdc.decimals.mockResolvedValueOnce(6)
    mockSdk.mkr.decimals.mockResolvedValueOnce(18)

    mockSdk.dai.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('1000000000000000000'))
    mockSdk.usdc.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('2000000'))
    mockSdk.mkr.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('3000000000000000000'))

    // Call the function and check the result
    const result = await getTokenBalances(address)
    expect(result).toEqual([
      { name: 'Dai', symbol: 'DAI', balance: '1' },
      { name: 'USD Coin', symbol: 'USDC', balance: '2' },
      { name: 'Maker', symbol: 'MKR', balance: '3' },
    ])
  })

  it('handles errors when fetching token balances', async () => {
    ;(axios.post as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<Home />)
    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, {
      target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2' },
    })

    fireEvent.click(submitButton)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('error')).toHaveTextContent(
      'Please provide a valid Ethereum address.',
    )
  })
})
