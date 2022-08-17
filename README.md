# load-test of stCelo backend

Run withdrawal

```
USAGE
  $ load-test withdraw [PRIVATE_KEY] -c <value> -a <value> -n <value> -g <value>

ARGUMENTS
  PRIVATE_KEY  Private key of primary account that needs to have enough of CELO to run test

FLAGS
  -n, --network=<value>  (optional) CELO network - default alfajores
  -c, --count=<value>  (optional) count of parallel requests - default 10
  -a, --amount=<value>  (optional) amount of CELO to transfer to each account - default 0.01
  -g, --gas=<value>  (optional)   "extra amount of CELO to transfer to each account (as gas) - default 0.001",


EXAMPLES
  $ load-test withdrawal <primary_key> -c 25
```

Run claim

```
USAGE
  $ load-test claim [ACCOUNTS_FILE] -n <value>

ARGUMENTS
  ACCOUNTS_FILE File that was generated from previous withdrawal run

FLAGS
  -n, --network=<value>  (optional) CELO network - default alfajores


EXAMPLES
  $ load-test claim accounts_alfajores_10_0.01CELO_20220816_132253.json
```