
# Server Chassis: NestJS + Express.js + MongoDB + Mocha

Chassis for a REST API using [NestJS](https://github.com/nestjs/nest), Express.js and MongoDB. Tests are run using Mocha.

## Requirements

- `node` v20.11.0
- `npm` v10.2.4
- MongoDB running locally

## Basic Usage

- use `npm run start:dev` to run the service in development mode (with `NODE_ENV=dev`).
- use `npm run nodemon` to run the service in development mode (with `NODE_ENV=dev`) using nodemon.
- use `npm run lint` for code linting.
- use `npm test` for executing tests.
- use `npm run test:e2e` for executing e2e tests.
- use `npm run test:cov` for tests coverage.

I also recommend to use `ncu` to find outdated dependencies (and run `ncu -u` to upgrade `package.json`).

App is launched listening on ***8080*** port by default, set the environment variable ***PORT*** to change it.

## How was this chassis created?

### Setup steps

1. Create NestJS project:

  ```bash
  npm i -g @nestjs/cli
  nest new chassis-nest
  cd chassis-nest
  ```

2. Add Node.js and npm versions used to `package.json`:

    ```json
    "engines": {
      "node": ">=20.11.0",
      "npm": ">=10.2.4"
    }
    ```

3. Install mongoose: `npm install mongoose`.
4. Install dev dependencies such as testing ones (supertext, c8, mocha, chai), linter (eslint, eslint-plugin-json-format) and nodemon:
    - `npm install cors cookie-parser @types/cors @types/cookie-parser`
    - `npm install --save-dev c8 mocha chai @types/mocha @types/chai`
    - `npm install --save-dev eslint-plugin-json-format`
    - `npm install --save-dev nodemon`
5. Check the eslint configuration, `.eslintrc.json` file should have:

    ```json
    "env": {
      "node": true,
      "es2021": true,
      "mocha": true
    }
    ```

    Also add `json-format` plugin (the one installed with the dependency `eslint-plugin-json-format`)

    ```json
    "plugins": [
      "json-format"
    ]
    ```

    Add `.eslintignore` file.

6. Create Mocha configuration file `.mocharc.json`. With `exit: true` the server is stopped after executing tests (without the need to click Ctrl+C).
7. Create test coverage configuration file `.c8rc.json`. The params set will be needed for the tests to pass successfully.
8. Create nodemon configuration file `nodemon.json` including the files that should be ignored when being updated.
9. Create npm configuration file `.npmrc` with `engine-strict=true` in order to notify with an error alert when trying to install/test/start something without the correct Node.js and npm versions.
10. Install [Husky](https://typicode.github.io/husky/how-to.html) to execute linter fixes and check tests before a commit is created or pushed: `npm install --save-dev husky`. Install husky git hooks (only once): `npx husky init` and add it to `package.json` script called `prepare`. If you want to make a commit skipping husky pre-commit git hooks you can use `git commit -m "..." -n`; the same occurs when you want to skip pre-push hooks: `git push --no-verify`.
11. Install `lint-staged` to check linting only in staged files before making a commit: `npm install --save-dev lint-staged`. Add configuration file `.lintstagedrc`.
12. Install [CommitLint](https://github.com/conventional-changelog/commitlint) dev dependencies to apply Conventional Commits: `npm install --save-dev @commitlint/cli @commitlint/config-conventional` and create its configuration file `.commitlintrc.json`:

    ```json
    {
      "extends": [
        "@commitlint/config-conventional"
      ]
    }
    ```

13. Add `pre-commit`, `pre-push` and `pre-commit-msg` scripts to be run with husky git hooks:

    ```json
    "pre-commit": "npx lint-staged",
    "pre-commit-msg": "npx --no -- commitlint --edit ${1}",
    "pre-push": "npx NODE_ENV=test c8 --all mocha",
    ```

14. Create `.husky/pre-commit` file to insert command that should be executed before making a commit. This file looks like this:

    ```bash
    npm run pre-commit
    ```

15. Create `.husky/pre-commit-msg` file to insert command that should be executed to check the commit message. This file looks like this:

    ```bash
    npm run pre-commit-msg
    ```

16. Create `.husky/pre-push` file to insert command that should be executed before pushing a commit. This file looks like this:

    ```bash
    npm run pre-push
    ```

    If tests fail, commit won't be pushed.

17. Use TypeScript in your database models [to define both a document interface and a schema or rely on Mongoose to automatically infer the type from the schema definition](https://mongoosejs.com/docs/typescript/schemas.html).

### Development steps

1. Add `Dockerfile` and `.dockerignore`. After that, you can create de docker image and run the docker container with the following commands:

    ```bash
    docker build -t [IMAGE_NAME] .
    docker run --name [CONTAINER_NAME] -p 8080:8080 -t -d [IMAGE_NAME]
    ```

2. Configure GitHub Action in `.github/workflows/main.yaml`. This action executes linter and tests and reads the [GitHub secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) of the repository to fill the .env file with the secret called `ENV_FILE` and use the `GITHUB_TOKEN` secret to build and push a Docker image to [GitHub Packages](https://github.com/features/packages).
