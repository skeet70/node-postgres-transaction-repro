# Transaction Behavour

This is  a minimal reproduction of undocumented behaviour in `node-postgres`. It seems like running a query with `;` separating statements (such as a SQL read in from disk to be run) results in the driver (or postgres itself, not sure) wrapping that query in a transaction block implicitly. This causes statements that cannot be run in a transaction block (such as `CREATE DATABASE`) to error.

The workaround is parsing the file into individual statements, and running each of those manually. I expected this behaviour to be documented in the [node-postgres transactions docs](https://node-postgres.com/features/transactions) (either that it does this implicit transaction, or some postgres setting does).

## Requirements

- docker
- nodejs + yarn
- python

> there's a `flake.nix` providing ^ for Nix users

Install node modules with:

```console
yarn
```

## Running

Run the tests with:

```console
yarn start
```

Note one test passes and one test fails, the difference between them  being split statement queries vs one query with `;`.
