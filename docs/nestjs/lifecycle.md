---
sidebar_position: 4
description: Nest.js 라이프사이클 파헤치기
---

# 라이프사이클

:::info
<br/>

### 라이프 사이클 순서 - [공식문서](https://docs.nestjs.com/faq/request-lifecycle)
1. Incoming request
2. Middleware
   1. Globally bound middleware
   2. Module bound middleware
3. Guards
   1. Global guards
   2. Controller guards
   3. Route guards
4. Interceptors (pre-controller)
   1. Global interceptors
   2. Controller interceptors
   3. Route interceptors
5. Pipes
   1. Global pipes
   2. Controller pipes
   3. Route pipes
   4. Route parameter pipes
6. Controller (method handler)
7. Service (if exists)
8. Interceptors (post-request)
   1. Route interceptor
   2. Controller interceptor
   3. Global interceptor
9. Exception filters
   1. route
   2. controller
   3. global
10. Server response

밑의 글을 따라가면 밑과 같은 응답을 얻을 수 있다.
```text
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 2.1 - Global Middleware
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 2.2 - Module Middleware
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 3.1 - Global Guard
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 3.2 - Controller Guard
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 3.3 - Route Guard
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 4.1 - Pre Global Interceptor
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 4.2 - Pre Controller Interceptor
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 4.3 - Pre Route Interceptor
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 5.1 - Global Pipe
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 5.2 - Controller Pipe
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 5.3 - Route Pipe
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 5.4 - Parameter Pipe
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 7 - Service
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 8.1 - Post Route Interceptor
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 8.2 - Post Controller Interceptor
[Nest] 53139  - 08/23/2023, 8:28:41 PM     LOG Lifecycle Test: Step 8.3 - Post Global Interceptor

// Exception Filter는 별도

[Nest] 53199  - 08/23/2023, 8:28:49 PM     LOG Lifecycle Test: Step 9.1 - Route Exception Filter
[Nest] 53407  - 08/23/2023, 8:29:04 PM     LOG Lifecycle Test: Step 9.2 - Controller Exception Filter
[Nest] 53576  - 08/23/2023, 8:29:16 PM     LOG Lifecycle Test: Step 9.3 - Global Exception Filter
```
:::

<br/>

## Controller / Service

순서대로 알아보려면 미들웨어부터 작성해야 하지만, 미들웨어만으로 API 요청을 할 수 없기에 컨트롤러와 서비스부터 작성한다. 컨트롤러와 서비스는 기본적으로 api를 만드는데 일조하는 부분이라 많은 사람들이 아는 부분이다. 밑과 같은 코드로 확인할 수 있다.

**UserController**

```ts
import { Controller, Get, Logger } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello() {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

**UserService**

```ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  async getUser() {
    Logger.log('Lifecycle Test: Step 7 - Service');
  }
}
```

**응답**

```text
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 7 - Service
```

<br/>

## Middleware

미들웨어는 어플리케이션의 기능을 확장하거나 조정하며 서로 다른 컴포넌트의 상호작용을 도우는 기능이라고 볼 수 있다. API 요청을 받았을 때, 첫 번째로 여기서 조정을 거치게 된다. 글로벌 미들웨어, 모듈 미들웨어 순으로 지나가며 밑의 코드를 통해 확인할 수 있다.

### Global Middleware

**GlobalMiddleware**

```ts
import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export function globalMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  Logger.log('Lifecycle Test: Step 2.1 - Global Middleware');
  next();
}
```

**main**

```ts
const app = await NestFactory.create(AppModule);
app.use(globalMiddleware);
await app.listen(3000);
```

### Module Middleware

**UserMiddleware**

```ts
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function moduleMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  Logger.log('Lifecycle Test: Step 2.2 - Module Middleware');
  next();
}
```

**UserModule**

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { moduleMiddleware } from './user.middleware';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(moduleMiddleware).forRoutes('user');
  }
}
```

**응답**
```text
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 2.1 - Global Middleware
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 2.2 - Module Middleware
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 7 - Service
```
<br/>

## Guards

Guards는 API 요청에서 리퀘스트 데이터에 대한 검증을 하는 기능이다. 글로벌, 컨트롤러, 경로로 나뉘며 이를 밑의 코드에서 확인할 수 있다.

### Global Guards

**GlobalGuard**

```ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    Logger.log('Lifecycle Test: Step 3.1 - Global Guard');
    return true;
  }
}
```

**main**

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new GlobalGuard());
await app.listen(3000);
```

### Controller Guards

**ControllerGuard**

```ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ControllerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    Logger.log('Lifecycle Test: Step 3.2 - Controller Guard');
    return true;
  }
}
```

**useGuard**

```ts
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerGuard } from './user.guard';

@UseGuards(ControllerGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello() {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

### Route Guards

**RouteGuard**

```ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RouteGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    Logger.log('Lifecycle Test: Step 3.3 - Route Guard');
    return true;
  }
}
```

**UseGuard**

```ts
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RouteGuard } from './user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RouteGuard)
  @Get()
  async getHello() {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

**응답**

```text
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 3.1 - Global Guard
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 3.2 - Controller Guard
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 3.3 - Route Guard
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 8088  - 08/23/2023, 4:03:12 PM     LOG Lifecycle Test: Step 7 - Service
```

<br/>

## Interceptors

인터셉터란 입력이나 출력의 데이터를 가로채서 수정/처리하는 기능을 말한다. 글로벌, 컨트롤러, 경로로 나뉘며, 밑의 코드를 통해 확인할 수 있다.

### Pre/Post - Global Interceptors

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.log('Lifecycle Test: Step 4.1 - Pre Global Interceptor');

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log('Lifecycle Test: Step 8.3 - Post Global Interceptor'),
        ),
      );
  }
}
```

**main**

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new GlobalInterceptor());
await app.listen(3000);
```

### Pre/Post - Controller Interceptors

**ControllerInterceptor**

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ControllerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.log('Lifecycle Test: Step 4.2 - Pre Controller Interceptor');

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log('Lifecycle Test: Step 8.2 - Post Controller Interceptor'),
        ),
      );
  }
}
```

**useInterceptor**

```ts
import { Controller, Get, Logger, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerInterceptor } from './user.interceptor';

@UseInterceptors(ControllerInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello() {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

### Pre/Post - Route Interceptors

**RouteInterceptor**

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RouteInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    Logger.log('Lifecycle Test: Step 4.3 - Pre Route Interceptor');

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log('Lifecycle Test: Step 8.1 - Post Route Interceptor'),
        ),
      );
  }
}
```

**useInterceptor**

```ts
import { Controller, Get, Logger, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { RouteInterceptor } from './user.interceptor';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(RouteInterceptor)
  @Get()
  async getHello() {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

**응답**

```ts
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 4.1 - Pre Global Interceptor
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 4.2 - Pre Controller Interceptor
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 4.3 - Pre Route Interceptor
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 7 - Service
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 8.1 - Post Route Interceptor
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 8.2 - Post Controller Interceptor
[Nest] 31029  - 08/23/2023, 6:48:09 PM     LOG Lifecycle Test: Step 8.3 - Post Global Interceptor
```

<br/>

## Pipes

파이프는 들어오는 데이터를 변환하거나 유효성 검사하며, 이를 통해 컨트롤러의 핸들러 함수에 전달되는 데이터를 사전에 가공하거나 검증하는 데 사용되는 기능이다. 글로벌, 컨트롤러, 경로, 파라미터 파이프가 존재하며, 밑의 코드를 통해 확인할 수 있다.

### Global Pipes

**GlobalPipe**

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';

@Injectable()
export class GlobalPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    Logger.log('Lifecycle Test: Step 5.1 - Global Pipe');
    return value;
  }
}
```

**main**

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new GlobalPipe());
await app.listen(3000);
```

### Controller Pipes

**ControllerPipe**

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ControllerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    Logger.log('Lifecycle Test: Step 5.2 - Controller Pipe');
    return value;
  }
}
```

**usePipe**

```ts
import { Controller, Get, Logger, Param, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerPipe } from './user.pipe';

@UsePipes(ControllerPipe)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello(@Param('id') id) {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

### Route Pipes

**RoutePipe**

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';

@Injectable()
export class RoutePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    Logger.log('Lifecycle Test: Step 5.3 - Route Pipe');
    return value;
  }
}
```

**usePipe**


```ts
import { Controller, Get, Logger, Param, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { RoutePipe } from './user.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UsePipes(RoutePipe)
  @Get()
  async getHello(@Param('id') id) {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

### Route Parameter Pipes

**ParameterPipe**

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ParameterPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    Logger.log('Lifecycle Test: Step 5.4 - Parameter Pipe');
    return value;
  }
}
```

**usePipe**


```ts
import { Controller, Get, Logger, Param, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ParameterPipe } from './user.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello(@Param('id', ParameterPipe) id) {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    return '';
  }
}
```

**응답**

```text
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 5.1 - Global Pipe
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 5.2 - Controller Pipe
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 5.3 - Route Pipe
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 5.4 - Parameter Pipe
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 42936  - 08/23/2023, 7:57:21 PM     LOG Lifecycle Test: Step 7 - Service
```

<br/>

## Exception filters

예외가 발생할 때, 예외를 캐치하여 적절한 응답을 생성하거나 처리하는 기능이다. 글로벌, 컨트롤러, 경로 예외처리 필터로 나뉘며, 밑의 코드를 통해 확인할 수 있다.

:::caution
여기서 주의점은 Exception Filter 같은 경우엔 경로 -> 컨트롤러 -> 글로벌 순으로 순차적 실행이 되지 않는다는 점이다. 예를 들어, 경로 Exception Filter가 실행되면 컨트롤러와 글로벌은 실행되지 않으니 주의하자!
:::

### Route Exception Filters

**RouteExceptionFilter**

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class RouteExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    Logger.log('Lifecycle Test: Step 9.1 - Route Exception Filter');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**useExceptionFilter**

```ts
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RouteExceptionFilter } from './user.exception.filter';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseFilters(RouteExceptionFilter)
  @Get()
  async getHello(@Param('id', ParameterPipe) id) {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    throw new HttpException('Exception Filter Test', HttpStatus.BAD_REQUEST);

    return '';
  }
}
```

### Controller Exception Filters

**ControllerExceptionFilter**

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ControllerExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    Logger.log('Lifecycle Test: Step 9.2 - Controller Exception Filter');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**useExceptionFilter**

```ts
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ControllerExceptionFilter } from './user.exception.filter';

@UseFilters(ControllerExceptionFilter)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getHello(@Param('id', ParameterPipe) id) {
    Logger.log('Lifecycle Test: Step 6 - Controller');
    await this.userService.getUser();

    throw new HttpException('Exception Filter Test', HttpStatus.BAD_REQUEST);

    return '';
  }
}
```

### Global Exception Filters

**GlobalExceptionFilter**

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    Logger.log('Lifecycle Test: Step 9.3 - Global Exception Filter');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**main**

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new GlobalExceptionFilter());
await app.listen(3000);
```

**응답**

```text
[Nest] 50199  - 08/23/2023, 8:24:36 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 50199  - 08/23/2023, 8:24:36 PM     LOG Lifecycle Test: Step 7 - Service
[Nest] 50199  - 08/23/2023, 8:24:36 PM     LOG Lifecycle Test: Step 9.1 - Route Exception Filter

[Nest] 52407  - 08/23/2023, 8:25:04 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 52407  - 08/23/2023, 8:25:04 PM     LOG Lifecycle Test: Step 7 - Service
[Nest] 52407  - 08/23/2023, 8:25:04 PM     LOG Lifecycle Test: Step 9.2 - Controller Exception Filter

[Nest] 52576  - 08/23/2023, 8:25:16 PM     LOG Lifecycle Test: Step 6 - Controller
[Nest] 52576  - 08/23/2023, 8:25:16 PM     LOG Lifecycle Test: Step 7 - Service
[Nest] 52576  - 08/23/2023, 8:25:16 PM     LOG Lifecycle Test: Step 9.3 - Global Exception Filter
```

<br/>

:::info
[라이프사이클 완성코드보기](https://github.com/tagrn/nestjs/tree/main/lifecycle)
:::

<br/>
