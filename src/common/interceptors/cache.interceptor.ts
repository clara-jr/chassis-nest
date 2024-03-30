import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import CacheService from 'src/cache/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    // only cache GET requests
    if (req.method !== 'GET') return next.handle();

    const key = `chassis-nest-${req.jwtUser.userName}-${req.originalUrl}`;

    // Get data from cache
    try {
      const cachedData = await this.cacheService.get(key);
      if (cachedData) {
        console.log('Return cached data');
        // It's not possible to return res.status(200).json(JSON.parse(cachedData));
        // If we did it we'd have an Exception in HttpExceptionFilter and it'd be neccessary to add: if (res.headersSent) return;
        // In the context of an interceptor in NestJS, the intercept method must return an Observable, Promise, or void.
        // We cannot directly return a response.
        // By returning an Observable using the RxJS of() operator, we are returning a valid stream and the route handler won't be called at all.
        // https://docs.nestjs.com/interceptors#stream-overriding
        return of(JSON.parse(cachedData));
      }
    } catch (error) {
      console.info('⚠️ Error getting data from cache');
      console.error(error);
    }

    // Send data and cache it
    return next.handle().pipe(
      map(async (data) => {
        if (!data.errorCode) {
          await this.cacheService.setex(key, data);
        }
        return data;
      }),
    );
  }
}
