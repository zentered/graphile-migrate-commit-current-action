# Commit current Graphile Migrate migration

This action commits the current migration. Migrations must be present under `/migrations/`.

Use this action in conjunction with [Add & Commit](https://github.com/marketplace/actions/add-commit) to commit
the committed migration to the repository.

## Inputs

none

## Outputs

none

## Example usage

```yaml
name: Commit current migration (test)

on:
  [ push ]

jobs:
  commit-current-migration:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Commit current migration
      uses: actions/graphile-migrate-commit-current-action@v1.0.0

    - uses: EndBug/add-and-commit@v5
       with:
         add: migrations/current.sql migrations/committed/*.sql
         message: Commit migration changes in repo
```
