import { render, screen } from '@testing-library/react'
import TokenBalance from '@/components/TokenBalance'

describe('TokenBalance component', () => {
  it('renders the component without errors', () => {
    render(<TokenBalance name={'Dai'} symbol={'DAI'} balance={'150,000'} />)

    const tokenElement = screen.getByTestId('dai-value')
    expect(tokenElement).toBeInTheDocument()
    expect(tokenElement).toHaveTextContent('150,000')

    const tokenElementSymbol = screen.getByText('DAI')
    expect(tokenElementSymbol).toBeInTheDocument()

    const tokenElementName = screen.getByText('Dai')
    expect(tokenElementName).toBeInTheDocument()

    const tokenElementImage = screen.getByAltText('DAI')
    expect(tokenElementImage).toBeInTheDocument()
  })
})
