# monkey-dapp
Monkey test for invokescript transactions, this is an experimental tools in a very early version 0.1
Only use it if you understand what it does and the limitations.

## Simple monkey invokeScript transaction testing

Only enter your params details and any logic before it.

This is using [Waves Transactions library](https://wavesplatform.github.io/waves-transactions/) for the invokeScript and [Chance library](https://chancejs.com/) for random data generation. the "chance" variable is available inside the editor.

## Details overview

### Account(s) Configuration

<b>Main account seed:</b>  
the seed of the main account that will populate new accounts with waves or custom tokens.

<b>Network:</b>  
ether testnet or stagenet, there is no mainnet since its only a development testing tools

<b>Number of account to generate:</b>  
the number of account you want create, you can only add account of a same network to existing list, if you want change network you needs to clear the account(s) list first

<b>Token ID:</b>  
if left empty the main account will send Waves, else it will use this token id and send the associated tokens.

<b>Amount to distribute per account:</b>  
the amount of token/waves you want send to each account of the Account(s) list

<b>Number of invokation per account:</b>  
this will multiply the number of calls, for example if you have 20 accounts in the Accounts list and put this field at 2, then it will call 40 invokescript transactions, 2 for each account

<b>Save button:</b>  
Will save the configuration for following fields: Users, Seed, Asset ID, chain ID and Code

<b>Clear button:</b>  
will clear the configuration and erase the following stored data: Users, Seed, Asset ID, chain ID and Code

<b>Run x invokeScript:</b>  
will start the monkey test and initiate the transactions

### InvokeScript transaction params

Enter you invokeScript transaction params here, it have to use "let params" as object name:

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

## LIMITATIONS

This tools is using the public nodes API:  
https://wavesexplorer.com/testnet/tx/  
https://stagenet.wavesexplorer.com/tx/  
  
These have [limitations](https://docs.wavesprotocol.org/en/waves-node/api-limitations-of-the-pool-of-public-nodes) and exceeding them will result in a "503 Service Temporarily Unavailable" error for some broadcast.
To remove the limitations, install your own version of the tools with your own node API url.

This early version is not using Web Workers so the more you enter in terms of Number of invokation per account, the more you may expect your browser to not respond for seconds to minutes untill processed all transactions.
For example 3500 invocations requests took almost a minute.
