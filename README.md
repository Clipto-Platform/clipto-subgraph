## Clipto Graph

This subgraph indexes for v2 architecture (using graph for all data storage)

0. To generate the subgraph.yaml file
```shell
# requires mustache to be install
$ npm install -g mustache

# for mainnet
$ npm run prepare:mainnet

# for testnet
$ npm run prepare:testnet
```

1. Generate types for current contract
```shell
$ graph codegen
```

2. To compile the mappings
```shell
$ graph build
```

3. Add auth token
```shell
$ graph auth --product hosted-service <access-token>
```

4. Deploy
```shell
$ graph deploy --product hosted-service <username/subgraph name>
```

## Example Queries
1. Get all request order by timestamp
```graphql
{
    requests(
        orderBy: timestamp
        orderDirection: desc
    ) {
        id
        requestId
        requester
        creator {
            id
        }
        amount
        description
        delivered
    }
}
```

2. To get all transfer history for particular token
```graphql
{
    transfers(
        where: {
            nftContract: "0x123....."
            tokenId: 0
        }) {
            id
            from
            to
            tokenId
            cliptoToken {
                currentOwner
            }
            nftContract
            eventType
            blockNumber
            timestamp
        }
    )
}
```