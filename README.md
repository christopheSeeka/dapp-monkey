# monkey-dapp
Monkey test for invokescript transactions

## Simple monkey invokeScript transaction testing

Only enter your params details and any logic before it.

This is using [Waves Transactions library](https://wavesplatform.github.io/waves-transactions/) for the invokeScript and [Chance library](https://chancejs.com/) for random data generation. the "chance" variable is available inside the editor.

Example to use chance random data in params:

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



