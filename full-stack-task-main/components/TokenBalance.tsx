import React from 'react'
import classes from '@/styles/TokenBalance.module.css'

interface TokenBalanceProps {
  name: string
  symbol: string
  balance: string
}

const TokenBalance = ({ name, symbol, balance }: TokenBalanceProps) => (
  <div className={classes.tokenWrapper}>
    <div className={classes.imageTextWrapper}>
      <img src={`/${symbol.toLowerCase()}_circle_color.svg`} alt={symbol} />
      <h3>{name}</h3>
    </div>
    <div className={classes.imageTextWrapper}>
      <p data-testid={`${symbol.toLowerCase()}-value`}>{balance}</p>
      <h3 style={{ marginLeft: '5px' }}>{symbol}</h3>
    </div>
  </div>
)

export default TokenBalance
