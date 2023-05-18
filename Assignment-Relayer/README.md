# Assignment

## Prerequisites
Current setup used:
```
Node.js 16.14.2
npm 8.15.0
yarn 1.22.19
```

## Installation
Clone the repository:
```
cd Assignment-Relayer
```

## Install dependencies:

```
yarn
```

Then install dependencies for both frontend and backend:

```
(cd frontend && yarn) && (cd relayer && yarn)
```

### ENV file

In both `Assignment-Relayer` and `relayer` folder there are 2 `.env.example`.

Make sure that you are in the `Assignment-Relayer` folder and then run the following:
```
(mv .env.example .env) && (cd relayer && mv .env.example .env)
```
### Important Note on Security and Best Practices
For security reasons, it is considered best practice to avoid placing sensitive data inside the `.env` file. In this project, we use addresses from Hardhat with exposed private keys, which is acceptable for testing purposes only.

Your `.env` file inside Assignment-Relayer should look like so:

```
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PRIVATE_KEY2=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
RECEIVER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

While the `.env` file inside the relayer should look like so:

```
CHAIN_ID=31337
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RECEIVER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TARGET_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

## Running Tests

To run the unit tests with Hardhat (from the Assignment-Relayer folder only):

```
yarn hardhat test
```

For test coverage run:

```
yarn hardhat coverage
```

For the relayer I have used `nyc` which already outputs the coverage of the tests. Make sure to run first:

```
yarn hardhat node
```

then you can run the unit tests for the relayer (from the relayer folder only):

```
yarn test
```


## Deployment

### Hardhat - Smart Contract deployment

To deploy the smart contracts on a local development network, in a terminal run:


```
yarn hardhat node
```

The contracts should be already deployed, but in case they are not, in a new terminal run the following command:

```
yarn hardhat deploy
```
This will deploy the smart contracts on the local development network and display the contract addresses.

### Relayer deployment

To deploy the relayer, run the following command in another new terminal:

```
cd relayer && yarn start
```

### Frontend deployment

To deploy the frontend, run the following command in another new terminal:

```
cd frontend && yarn dev
```

Now the project should be accessible at `http://localhost:4000` for the frontend, while the backend should be running at `http://localhost:3000`.

#### How to interact with the frontend

Once the page at `http://localhost:4000` is loaded, there will be a form that needs to be filled with the following data:

```
 1) Token To Send: the amount of token that the user wants to send
 2) Target Address: which is one of the Target contract deployed (hardhat will deploy the Target at this address`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`)
 3) To: The address to send the token to.
```

Make sure to also have Metamask connected to the following JSON-RPC: `http://127.0.0.1:8545`

## Expected behavior:

 1) Users can go to `http://localhost:4000` and connect their metamask to the dApp.
 2) Once connected, the user can fill out the form.
 3) Then the user can press the submit button.
 4) A metamask pop-up notification should appear with the EIP712 transaction to be signed.
 5) The user can sign the transaction.
 6) After a short interval, the hash of the transaction should appear in the `Last Transaction` section of the page.
 7) If the user reject the transaction, an error message should appear `Error signing transaction` 

## Possible Improvements
1) Pop-up notification to notify users for successful or unsuccessful performed transactions

## License
This project is licensed under the MIT License.