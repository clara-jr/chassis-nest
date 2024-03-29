import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUserType {
  userName?: string;
}

export const JwtUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.jwtUser;
  },
);
