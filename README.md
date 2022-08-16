load-test of stCelo backend
=================

Run withdrawal

```
USAGE
  $ load-test withdraw [PRIVATE_KEY] -c <value> -a <value> -n <value> -g <value>

ARGUMENTS
  PRIVATE_KEY  Private key of primary account that needs to have enough of CELO to run test

FLAGS
  -n, --network=<value>  (not required) CELO network - default alfajores
  -c, --count=<value>  (not required) count of parallel requests - default 10
  -a, --amount=<value>  (not required) amount of CELO to transfer to each account - default 0.01
  -g, --gas=<value>  (not required)   "extra amount of CELO to transfer to each account (as gas) - default 0.001",


EXAMPLES
  $ oex withdrawal 0xe7a7399d65b92667fa114a3ea7d0ded38c43c1728071abb3cd1f951ecab413eb -c 25
```

Run claim

```
USAGE
  $ load-test claim [ACCOUNTS_FILE] -n <value>

ARGUMENTS
  ACCOUNTS_FILE File that was generated from previous withdrawal run

FLAGS
  -n, --network=<value>  (not required) CELO network - default alfajores


EXAMPLES
  $ oex claim accounts_alfajores_10_0.01CELO_20220816_132253.json
```