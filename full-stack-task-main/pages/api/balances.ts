import type { NextApiRequest, NextApiResponse } from 'next'

type Balance = {
  token: string
  balance: number
}

type Data = {
  address: string
  balances: Balance[]
}

export let savedBalances: Data[] = []

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { address, balances }: Data = req.body
    if (!savedBalances.find((item) => item.address === address)) {
      savedBalances.push({ address, balances })
    }
    res.status(200).json({ success: true })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
