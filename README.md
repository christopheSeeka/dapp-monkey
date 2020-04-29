# monkey-dapp
Monkey test for invokescript transactions

## Simple monkey invoketransaction testing

Only enter your params details and any logic before it.

This is using the [Chance library](https://chancejs.com/) for random data generation.

Example to use random data in params:

```
let params = {
  call: {
  args: [
    { type: 'string', value: chance.string({ length: chance.integer({ min: 20, max: 50 }) }) },
    { type: 'integer', value: chance.integer({ min: 0, max: 200000 }) }
  ],
    function: 'call'
  },
  dApp: '3MouSkYhyvLXkn9wYRcqHUrhcDgNipSGFQN'
}
```



