## Clipto Graph

This subgraph indexes for v2 architecture (using graph for all data storage)

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

## Mainnet Deployment
1. Update subgraph.yml by replacing values mentioned
2. Use auth-token for Mainnet Graph Project with the deploy command