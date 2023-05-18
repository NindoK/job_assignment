import React, { useEffect, useState } from 'react'
import classes from '@/styles/SaveAccountBalances.module.css'
import { isAddress } from 'ethers/lib/utils'

interface SaveAccountBalancesProps {
  errorString: string
  setErrorString: (errorString: string) => void
  onSubmit: (address: string) => void
}

export const SaveAccountBalances = ({
  errorString,
  setErrorString,
  onSubmit,
}: SaveAccountBalancesProps) => {
  const [address, setAddress] = useState('')
  const [textButton, setTextButton] = useState('Submit')
  const [isDisabled, setIsDisabled] = useState(true)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit(address)
    setTextButton('Submitted!')
  }

  useEffect(() => {
    setIsDisabled(!isAddress(address) || textButton === 'Submitted!')

    if (address !== '' && !isAddress(address) && errorString === '') {
      setErrorString('Please provide a valid Ethereum address.')
    } else if ((address === '' || isAddress(address)) && errorString !== '') {
      setErrorString('')
    }
  }, [address, textButton])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value)
    if (textButton === 'Submitted!') {
      setTextButton('Submit')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={classes.formContainer}>
      <h2>Save account balances</h2>
      <div className={classes.container}>
        Provide an Ethereum address to find out DAI, USDC, and MKR balances. Submit them to save a
        snapshot for future reference. At least one balance must be greater than zero.
      </div>
      <div className={classes.container}>
        <label
          htmlFor="address"
          style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          placeholder="0x2655...0aa9"
          value={address}
          onChange={handleChange}
          className={classes.inputBox}
        />
        {errorString !== '' && (
          <p data-testid={`error`} className={classes.error}>
            {errorString}
          </p>
        )}
      </div>
      <button
        type="submit"
        className={`${classes.submitButton} ${isDisabled ? classes.greyOut : ''}`}
        disabled={isDisabled}
      >
        {textButton}
      </button>
    </form>
  )
}

