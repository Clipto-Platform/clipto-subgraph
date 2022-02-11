## Clipto Graph

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