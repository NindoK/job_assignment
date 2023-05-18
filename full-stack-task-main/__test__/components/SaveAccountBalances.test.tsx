import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveAccountBalances from '@/components/SaveAccountBalances'
import React, { useState } from 'react'
import { act } from 'react-dom/test-utils'

describe('SaveAccountBalances component', () => {
  it('renders the component without errors', () => {
    const mockSetErrorString = jest.fn()
    const mockOnSubmit = jest.fn()

    render(
      <SaveAccountBalances
        errorString=""
        setErrorString={mockSetErrorString}
        onSubmit={mockOnSubmit}
      />,
    )

    const title = screen.getByText('Save account balances')
    expect(title).toBeInTheDocument()

    const descriptionText = screen.getByText(
      'Provide an Ethereum address to find out DAI, USDC, and MKR balances. Submit them to save a snapshot for future reference. At least one balance must be greater than zero.',
    )
    expect(descriptionText).toBeInTheDocument()

    const addressLabel = screen.getByText('Address')
    expect(addressLabel).toBeInTheDocument()

    const addressInput = screen.getByPlaceholderText('0x2655...0aa9')
    expect(addressInput).toBeInTheDocument()

    const submitButton = screen.getByText('Submit')
    expect(submitButton).toBeInTheDocument()
  })

  it('updates the input value and clears error and check submit text when handleChange is called', async () => {
    const mockOnSubmit = jest.fn()

    const TestWrapper = () => {
      const [errorString, setErrorString] = useState('Test')

      return (
        <SaveAccountBalances
          errorString={errorString}
          setErrorString={setErrorString}
          onSubmit={mockOnSubmit}
        />
      )
    }

    render(<TestWrapper />)
    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement

    fireEvent.change(input, { target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2' } })

    // Check if the input value has been updated
    expect(input.value).toBe('0x1B7BAa734C00298b9429b518D621753Bb0f6efF2')

    // Check if the errorString and textButton states have been updated
    expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Submit')
  })

  it('after onSubmit the button changes is set to Submitted!, then after update it is Submit', async () => {
    const mockOnSubmit = jest.fn()

    const TestWrapper = () => {
      const [errorString, setErrorString] = useState('')

      return (
        <SaveAccountBalances
          errorString={errorString}
          setErrorString={setErrorString}
          onSubmit={mockOnSubmit}
        />
      )
    }

    render(<TestWrapper />)
    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement

    fireEvent.change(input, { target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2' } })

    const submitButton = screen.getByRole('button')

    fireEvent.click(submitButton)

    expect(screen.getByRole('button')).toHaveTextContent('Submitted!')

    fireEvent.change(input, { target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF' } })

    expect(screen.getByRole('button')).toHaveTextContent('Submit')
  })

  it('disables and enables the submit button based on the form state', async () => {
    const mockOnSubmit = jest.fn()

    const TestWrapper = () => {
      const [errorString, setErrorString] = useState('')

      return (
        <SaveAccountBalances
          errorString={errorString}
          setErrorString={setErrorString}
          onSubmit={mockOnSubmit}
        />
      )
    }

    render(<TestWrapper />)
    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement
    const submitButton = screen.getByRole('button')

    expect(submitButton).toBeDisabled()

    fireEvent.change(input, {
      target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2' },
    })

    expect(submitButton).not.toBeDisabled()

    fireEvent.submit(submitButton)

    expect(submitButton).toBeDisabled()
  })

  it('checks everything', async () => {
    const mockOnSubmit = jest.fn()

    const TestWrapper = () => {
      const [errorString, setErrorString] = useState('')

      return (
        <SaveAccountBalances
          errorString={errorString}
          setErrorString={setErrorString}
          onSubmit={mockOnSubmit}
        />
      )
    }

    render(<TestWrapper />)
    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement
    const submitButton = screen.getByRole('button')

    expect(submitButton).toBeDisabled()

    fireEvent.change(input, {
      target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2' },
    })
    expect(submitButton).not.toBeDisabled()

    fireEvent.submit(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Submitted!')

    fireEvent.change(input, {
      target: { value: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF' },
    })
    expect(submitButton).toHaveTextContent('Submit')
    expect(screen.queryByTestId('error')).toBeInTheDocument()

    expect(mockOnSubmit).toHaveBeenCalledWith('0x1B7BAa734C00298b9429b518D621753Bb0f6efF2')
  })

  it('calls onSubmit with the correct address when the form is submitted', () => {
    const mockSetErrorString = jest.fn()
    const mockOnSubmit = jest.fn()

    const topUSDCHolder = '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2'

    render(
      <SaveAccountBalances
        errorString=""
        setErrorString={mockSetErrorString}
        onSubmit={mockOnSubmit}
      />,
    )

    const input = screen.getByPlaceholderText('0x2655...0aa9') as HTMLInputElement
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, {
      target: { value: topUSDCHolder },
    })

    // Submit the form
    fireEvent.submit(submitButton)

    // Check if onSubmit is called with the correct address
    expect(mockOnSubmit).toHaveBeenCalledWith(topUSDCHolder)
  })
})
