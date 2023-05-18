import type { NextPage } from 'next'
import React, { useState } from 'react'
import TokenBalance from '@/components/TokenBalance'
import SaveAccountBalances from '@/components/SaveAccountBalances'
import classes from '@/styles/Home.module.css'
import { getTokenBalances } from '@/lib/eth'
import axios from 'axios'
import Link from 'next/link'

const Home: NextPage = () => {
  const dai = { name: 'Dai', symbol: 'DAI', balance: '---' }
  const usdc = { name: 'USD Coin', symbol: 'USDC', balance: '---' }
  const mkr = { name: 'Maker', symbol: 'MKR', balance: '---' }
  const [balances, setBalances] = useState([dai, usdc, mkr])
  const [errorString, setErrorString] = useState('')

  const submitAddress = async (address: string) => {
    try {
      const fetchedBalances = await getTokenBalances(address)
      const hasNonZeroBalance = fetchedBalances.some((token) => parseInt(token.balance) > 0)

      if (!hasNonZeroBalance) {
        setErrorString('At least one balance needs to be greater than zero.')
        setBalances([dai, usdc, mkr])
        return
      }

      setBalances(fetchedBalances)

      await axios.post('/api/balances', {
        address,
        balances: fetchedBalances.map((token, index) => ({
          token: ['DAI', 'USDC', 'MKR'][index],
          balance: token.balance,
        })),
      })
    } catch (error) {
      setErrorString('Please provide a valid Ethereum address.')
      setBalances([dai, usdc, mkr])
    }
  }

  return (
    <div className={classes.container}>
      <div className={classes.containerHeader}>
        <img src="/random-generated-icon-152x152.png" alt="Logo" style={{ float: 'left' }} />
        <div className={classes.headerText}>
          <h1>Beniamino Daniele</h1>
          <h3 style={{ fontWeight: 'normal' }}>Full-stack candidate</h3>
          <h4>
            <Link href="https://github.com/NindoK" className={classes.link}>
              @NindoK
            </Link>
          </h4>
        </div>
      </div>

      <div className={classes.containerBody}>
        <div className={classes.containerBalance}>
          <h2>Token balances</h2>
          {balances.map((token, index) => (
            <TokenBalance
              key={index}
              name={token.name}
              symbol={token.symbol}
              balance={token.balance}
            />
          ))}
        </div>

        <div className={classes.containerActions}>
          <SaveAccountBalances
            errorString={errorString}
            setErrorString={setErrorString}
            onSubmit={submitAddress}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
