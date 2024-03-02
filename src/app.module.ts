import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule], // Any exported providers of these imported modules are now fully available here as well.
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
