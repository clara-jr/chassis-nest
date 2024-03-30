
# Server Chassis: NestJS + Express.js + MongoDB + Redis + Jest

Chassis for a REST API using [NestJS](https://github.com/nestjs/nest), Express.js, MongoDB and Redis. Tests are run using Jest.

## Requirements

- `node` v20.11.0
- `npm` v10.2.4
- [Nest CLI](https://www.npmjs.com/package/@nestjs/cli)
- MongoDB running locally

## Basic Usage

- use `npm run start:dev` to run the service in development mode (with `NODE_ENV=dev`).
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
4. Install dev dependencies such as linter ones (eslint-plugin-json-format):
    - `npm install --save-dev eslint-plugin-json-format`
5. Check the eslint configuration, `.eslintrc.json` file should have:

    ```json
    "env": {
      "node": true,
      "jest": true
    }
    ```

    Also add `json-format` plugin (the one installed with the dependency `eslint-plugin-json-format`)

    ```json
    "plugins": [
      "json-format"
    ]
    ```

    Add `.eslintignore` file.

6. Create npm configuration file `.npmrc` with `engine-strict=true` in order to notify with an error alert when trying to install/test/start something without the correct Node.js and npm versions.
7. Install [Husky](https://typicode.github.io/husky/how-to.html) to execute linter fixes and check tests before a commit is created or pushed: `npm install --save-dev husky`. Install husky git hooks (only once): `npx husky init` and add it to `package.json` script called `prepare`. If you want to make a commit skipping husky pre-commit git hooks you can use `git commit -m "..." -n`; the same occurs when you want to skip pre-push hooks: `git push --no-verify`.
8. Install `lint-staged` to check linting only in staged files before making a commit: `npm install --save-dev lint-staged`. Add configuration file `.lintstagedrc`.
9. Install [CommitLint](https://github.com/conventional-changelog/commitlint) dev dependencies to apply Conventional Commits: `npm install --save-dev @commitlint/cli @commitlint/config-conventional` and create its configuration file `.commitlintrc.json`:

    ```json
    {
      "extends": [
        "@commitlint/config-conventional"
      ]
    }
    ```

10. Add `pre-commit`, `pre-push` and `pre-commit-msg` scripts to be run with husky git hooks:

    ```json
    "pre-commit": "npx lint-staged",
    "pre-commit-msg": "npx --no -- commitlint --edit ${1}",
    "pre-push": "npx jest",
    ```

11. Create `.husky/pre-commit` file to insert command that should be executed before making a commit. This file looks like this:

    ```bash
    npm run pre-commit
    ```

12. Create `.husky/pre-commit-msg` file to insert command that should be executed to check the commit message. This file looks like this:

    ```bash
    npm run pre-commit-msg
    ```

13. Create `.husky/pre-push` file to insert command that should be executed before pushing a commit. This file looks like this:

    ```bash
    npm run pre-push
    ```

    If tests fail, commit won't be pushed.

### Development steps

1. Create a new controller: `nest g co`.
2. Create a service: `nest g s`.
3. Create a module: `nest g mo`.
4. Generate a DTO class (with --no-spec because no test file needed for DTO's): `nest g class cats/dto/create-cat.dto --no-spec` `nest g class cats/dto/update-cat.dto --no-spec`.

5. Install DTO validator dependencies (in order to send a 400 BAD_REQUEST error when body does not match DTO):
`npm i class-validator class-transformer`
`npm i @nestjs/mapped-types`

6. Apply the `ValidationPipe` globally in our `main.ts` file:

    ```typescript
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // avoid creating/updating objects with fields not included in DTO by ignoring them
      forbidNonWhitelisted: true, // avoid creating/updating objects with fields not included in DTO by throwing an error 400
      transform: true, // enable auto transform feature to transform body in an instance of the proper DTO, or path/query params to booleans or numbers depending on the indicated type in the controller
    }));
    ```

7. Implement validation rules in our `CreateCatDto` (i.e. `@IsString()`).
8. Import validation rules in `UpdateCatDto` from `CreateCatDto` and set attributes to be optional (no more duplicated code!).

9. Install mongoose dependencies: `npm i mongoose @nestjs/mongoose`.

10. Setup `MongooseModule` in `AppModule`:

    ```typescript
    @Module({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/nest-course'),
      ],
    })
    export class AppModule {}
    ```

11. Migrate Cat entity to a Mongoose Schema using `@nestjs/mongoose` (collection name will be Cats by default if class is named Cat).

12. Add Schema to `MongooseModule`:

    ```typescript
    @Module({
      imports: [
        MongooseModule.forFeature([
          {
            name: Cat.name, // the name of the Cat typescript class, which is "cat"
            schema: CatSchema
          }
        ])
      ],
      controllers: [CatsController],
      providers: [CatsService],
    })
    export class CatsModule {}
    ```

13. Use Mongoose Cat Model in `cats.service.ts`:

    ```typescript
    constructor(
      @InjectModel(Cat.name)
      private catModel: Model<Cat>,
    ) {}
    ```

14. Install `@nestjs/config` to work with environment variables in process.env: `npm i @nestjs/config`. Update `AppModule` to use process.env variables:

    ```typescript
    import { ConfigModule } from '@nestjs/config'
    @Module({
      imports: [
        ConfigModule.forRoot(), // load and parse our .env file from default location
        ...
      ],
    })
    export class AppModule {}
    ```

    To specify another path for this file, let’s pass in an options object into the `forRoot()` method and set the `envFilePath` property like so:

    ```typescript
    ConfigModule.forRoot({
      envFilePath: `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    })
    ```

15. Generate exception filter to catch exceptions: `nest g filter middlewares/http-exception`.

16. Create authentication guard: `nest g guard auth` and install dependencies needed for authentication process: `npm i jsonwebtoken uuid ioredis`. Create authentication service and its module. Create cache service and its module. Import both modules in `AppModule` and set guard in `main.ts`:

    ```typescript
    // app.module.ts
    @Module({
      imports: [
        ...
        CacheModule,
        AuthModule,
      ],
    })

    // main.ts
    const authService = app.get(AuthService);
    app.useGlobalGuards(new AuthGuard(authService));
    ```

    Another option (instead of using `app.useGlobalGuards`) is adding `AuthGuard` as a provider in `AuthModule`:

    ```typescript
    import { APP_GUARD } from '@nestjs/core';

    @Module({
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        ...
      ],
      ...
    })
    export class AuthModule {}
    ```

17. Create `JwtUser` decorator (to retrieve `req.jwtUser`) and use it like this: `@JwtUser() jwtUser`.

    ```typescript
    export const JwtUser = createParamDecorator(
      (_data: unknown, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.jwtUser;
      },
    );
    ```

18. Document API with [OpenAPI Specification](https://spec.openapis.org/oas/latest.html).

    18.1. Install `@nestjs/swagger` and Swagger UI for Express.js: `npm i @nestjs/swagger swagger-ui-express`.

    18.2. Set up Swagger document in `main.ts`:

    ```typescript
    import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
    const options = new DocumentBuilder()
      .setTitle('chassis-nest')
      .setDescription('Chassis for a REST API using NestJS, Express.js, MongoDB and Redis')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('openapi', app, document);
    ```

    To view the Swagger UI go to: `http://localhost:8080/openapi`.

    18.3. Having a DTO of a POST/PUT request body is not enough to automatically generate de OpenAPI schemas out of the box. This can be addressed at compilation time. Nest provides a plugin that enhances the TypeScript compilation process to reduce the amount of boilerplate code we'd be required to create: `@nestjs/swagger/plugin`. We can enable NestJS Swagger plugin to help automate the documentation process. Add `@nestjs/swagger/plugin` to our application `nest-cli.json` to enable the Swagger CLI plugin:

    ```json
    "compilerOptions": {
      "deleteOutDir": true,
      "plugins": ["@nestjs/swagger/plugin"]
    }
    ```

    18.4. We can now use decorators to set (or override) API methods/properties/responses documentation: `@ApiProperty`, `@ApiResponse`, `@ApiTags`... We also need to fix PartialType for Swagger `import { PartialType } from '@nestjs/mapped-types';` ➡️ `import { PartialType } from '@nestjs/swagger'`;

19. Create `entity.repository.ts` and `cats.repository.ts` to follow de [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html).
