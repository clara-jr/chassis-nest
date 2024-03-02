import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chassis-nest'),
    CatsModule,
  ], // Any exported providers of these imported modules are now fully available here as well.
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
