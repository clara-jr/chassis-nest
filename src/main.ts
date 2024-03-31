import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { setup } from './app';

const PORT = process.env.PORT || 8080;

async function start() {
  const app = await NestFactory.create(AppModule);

  setup(app);

  // Set openapi documentation
  const options = new DocumentBuilder()
    .setTitle('chassis-nest')
    .setDescription(
      'Chassis for a REST API using NestJS, Express.js, MongoDB and Redis',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('openapi', app, document);

  // Start Express server
  await app.listen(PORT);
  console.info(`✅ Express server listening at port: ${PORT}`);
}

start();
