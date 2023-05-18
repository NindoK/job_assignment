import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import "../styles/globals.css"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>EIP712 Relayer Assignment</title>
                <meta name="description" content="EIP712 Relayer Assignment" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />
                    <Component {...pageProps} />
                </NotificationProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
