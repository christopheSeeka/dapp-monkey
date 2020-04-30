# monkey-dapp
Monkey test for invokescript transactions, this is an early version 0.1

## Simple monkey invokeScript transaction testing

Only enter your params details and any logic before it.

This is using [Waves Transactions library](https://wavesplatform.github.io/waves-transactions/) for the invokeScript and [Chance library](https://chancejs.com/) for random data generation. the "chance" variable is available inside the editor.

## Fields overview

### Account(s) Configuration

Main account seed: the seed of the main account that will populate new accounts with waves or custom tokens.

Network: ether testnet or stagenet, there is no mainnet since its only a development testing tools

Number of account to generate: the number of account you want create, you can only add account of a same network to existing list, if you want change network you needs to clear the account(s) list first

Token ID: if left empty the main account will send Waves, else it will use this token id and send the associated tokens.

Amount to distribute per account: the amount of token/waves you want send to each account of the Account(s) list

Number of invokation per account: this will multiply the number of calls, for example if you have 20 accounts in the Accounts list and put this field at 2, then i will call 40 invokescript transactions, 2 for each account

Save button: Will save the configuration for following fields: Users, Seed, Asset ID, chain ID and Code

Clear button: will clear the configuration and erase the following fields: Users, Seed, Asset ID, chain ID and Code

Run x invokeScript: will start the monkey test and initiate the transactions

### InvokeScript transaction params

Enter you invokeScript transaction params here, it have to use:

```
let params = {
 // your params here
}
```

You can define all you random logic, before the params for example:

```
let myString = chance.string({ length: chance.integer({ min: 20, max: 50 }) })
let myInteger = chance.integer({ min: 0, max: 200000 })

let params = {
  call: {
  args: [
    { type: 'string', value: myString },
    { type: 'integer', value: myInteger }
  ],
    function: 'call'
  },
  dApp: '3MouSkYhyvLXkn9wYRcqHUrhcDgNipSGFQN'
}
   
```
As you can see, the "chance" variable is available and give you access to all the associated methods, see list [here](https://chancejs.com/basics/string.html).
This will allow you to chose any random data generation according to your dApp

### Accounts list

This display the list of all generated accounts, you can delete them one by one or all at once.
It display the Address, Seed and Balance in waves or token (if token ID have been entered)

### Console

This console is displaying your console.log the same way as you browser console, if you needs more details for some output you may still needs to check the browser console.
