# Apps Full Stack task

#### Estimated time: ~5-6 hours

Your task is to implement a UI where users will be able to check token balances for a given
blockchain address and save them. Tracked tokens are Dai, USD Coin and Maker.

Please use the provided repository as the basis of the task. It is based on next.js with typescript.

To interact with the Ethereum network we recommend to use the eth-sdk package, it greatly simplifies
interactions with the blockchain. Token Addresses to use:

```
DAI:    0x6b175474e89094c44da98b954eedeac495271d0f
USDC:   0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
MKR:	  0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2
```

The finished app should consist of only one page `/`. It has 3 sections:

- Page Header including:
  - Company logo,
  - Your name or any handle you like,
  - Subheader: `Full stack candidate`
  - A link to your profile (to any platform you like)
- Token balances:
  - It has a list of 3 tokens showing their names, icons and balances for the entered address.
    Initially when form is empty, the list displays a placeholder `---`
  - When a user inputs some address (and this address is valid) the app should read token balances
    from the blockchain for the inputted address and display them.
  - If the provided address was not valid, display the placeholders.
- Form section:
  - It has header and the following instructions for the user:
    > Provide an Ethereum address to find out DAI, USDC and MKR balances. Submit them to save a
    > snapshot for future reference. At least one balance must be greater than zero.
  - One text input with label `Address`
  - Submit button
  - Form handles 2 validation cases:
    - Invalid address: `Please provide a valid Ethereum address`
    - All balances for given address are zero: `At least one balance needs to be greater than zero`

Futher description can be found in the document sent to you.

# Assignment

## Prerequisites

Current setup used:

```
Node.js 16.14.2
npm 8.15.0
yarn 1.22.19
next.js 13.3.0
react 18.2.0
```

## Install dependencies:

Run the following command once inside the root folder:

```
yarn && yarn build
```

Otherwise, if you are still currently outside of the folder:

```
cd full-stack-task-main && yarn
```

Then you need to get the abis with `eth-sdk`. This command will prepare the abi automatically:

```
yarn eth-sdk
```

## Running Tests

Jest have been used to implement tests. To run the tests, run this command in the root folder:

```
yarn test
```

For test coverage run:

```
yarn coverage
```

## Expected behavior:

1.  User can go to `http://localhost:3000`.
2.  The user should be able to put an address inside the input box at the center of the screen
3.  At first the button should be greyed out
4.  Once the user insert a valid address, the button should turn dark green
5.  The user can press the button "Submit"
6.  The button should become "Submitted" and become grey
7.  After a small delay, the user should be able to see the updated balances for that current
    address
8.  If the user insert an invalid address, the button should not turn green
9.  If the user press submit with an address which balance is 0 for each of the tokens, an error
    message should pop-up below the input address box.

## Minor bug

When running `yarn coverage` all files should have **100%** coverage.

## License

This project is licensed under the MIT License.
