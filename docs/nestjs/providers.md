---
sidebar_position: 2
description: 대표적인 4가지 Provider 사용방법 및 예제
---

# Provider 4가지 사용방법

:::note
`providers`는 의존성 주입(Dependency Injection)을 관리하기 위해 사용되는 중요한 개념 중 하나이며, 설정한 모듈 내에서 사용할 수 있는 서비스, 레파지토리, 서드파티 모듈과 같은 컴포넌트를 정의한다. 이러한 컴포넌트는 클래스 형태로 생성되며, NestJS의 의존성 주입 시스템을 통해 필요한 곳에서 주입되어 사용된다.

4가지 방법이 있다.

- useClass
- useValue
- useFactory
- useExisting
:::

<br/>

## useClass

가장 기본적인 방법이다. 클래스를 사용하여 Provider를 생성하고 주입하는 방법이며, 주로 서비스 클래스를 등록할 때 사용된다.

예를 들어, 밑과 같은 UserService가 있다고 생각하자.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getUser(id): User {
    return new User(id, 'name');
  }
}
```

그리고 모듈에서 이를 등록할 수 있다.

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
})
export class UserModule {}
```

하지만 위의 Provider 등록을 보면 useClass가 쓰이지 않는 것을 볼 수 있다. 사실 위와 같이 등록하는 것은 편의를 위해 해놓은 방법이고 원래는 밑과 같이 등록되어진다.

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [{
    provide: UserService,
    useClass: UserService
  }],
})
export class UserModule {}
```

<br/>

## useValue

직접 값을 제공하여 Provider를 생성하는 방법이며, 주로 설정 값이나 미리 생성된 인스턴스를 주입할 때 사용된다.

먼저 밑과 같이 어떠한 값을 만든다.

```typescript
export const config = {
  a: "abc",
  b: "bcd",
}
```

그리고 밑과 같이 주입시킨다. 그러면 `@Inject('CONFIG')` 데코레이터와 함께 모듈내에서 사용할 수 있게 된다.

```typescript
import { Module } from '@nestjs/common';
import { config } from './common.config';

@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: config,
    },
  ],
})
export class AppModule {}
```

자, 그러면 왜 이런짓을 하는지 궁금할 수 있다. 왜냐하면 굳이 저렇게 하지 않고 config를 받아서 사용하면 되기 때문이다. 이는 의존성 주입(DI) 때문이다. Nest.js에서 이렇게 주입하여 사용하면 관리하기가 편하기 때문이다. 내가 쓴 코드에서 그냥 가져오는 것이 아니라 무조건 주입되어서 가져온다는 사실만 알게 되면 어디서 사용되는지 알게 되어 코드를 타고 올라가기도 편하고, 특히 테스트할 때 주입된 것들만 Mocking하면 되어 편하다.

하지만 추가적인 설정을 해야한다는 단점도 있긴 해서, 어떻게 쓸지는 개발자의 몫이다.

<br/>

## useFactory

팩토리 함수를 사용하여 Provider를 생성하고 주입하는 방법이며, 이 방법을 사용하면 동적으로 인스턴스를 생성하거나 외부 종속성을 관리할 수 있다.

밑과 같이 쓸 수 있다. DatabaseModule에서 'DATA_SOURCE'를 export해주고 있고, 팩토리 함수에서 밑과 같이 받아 사용할 수 있다. 그리고 모듈 내에서 `@Inject('BOARD_REPOSITORY')`를 통해 주입시켜 사용할 수 있게 된다.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/typeorm.module';

@Module({
  imports: [DatabaseModule],
  providers: [{
    provide: 'BOARD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Board),
    inject: ['DATA_SOURCE'],
  }],
})
export class BoardsModule {}
```

<br/>

## useExisting

이미 만들어진 Provider에 별칭을 붙여 다른 이름으로 사용할 수 있게 만드는 방법이다.

밑과 같이 사용할 수 있으며, 특수한 상황에서 사용될만한 방법이다.

```typescript
import { Injectable, Module } from '@nestjs/common';

@Injectable()
class LoggerService {}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class LoggerModule {}
```

<br/>