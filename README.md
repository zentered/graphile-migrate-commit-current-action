# Commit current Graphile Migrate migration

This action commits the current [Graphile Migrate](https://github.com/graphile/migrate) migration.

Use this action in conjunction with [Add & Commit](https://github.com/marketplace/actions/add-commit) to commit
the committed migration to the repository.

## Limitations

* migrations must be present under `/migrations/`
* only supports "file mode" for current migration (current migration must be present in a single file `/migrations/current.sql`)

## Inputs

none

## Outputs

none

## Example usage

```yaml
name: Commit current migration

on:
  [ push ]

jobs:
  commit-current-migration:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repo
      uses: actions/checkout@v2

    - name: Commit current migration
      uses: zentered/graphile-migrate-commit-current-action@v1.0.1

    - uses: EndBug/add-and-commit@v5
      with:
        add: migrations/current.sql migrations/committed/*.sql
        message: "chore: commit migration changes in repo"
```
