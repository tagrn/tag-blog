---
description: TypeOrmModule을 사용하지 않고 Typeorm을 쓸 수 있다.
---

# TypeOrmModule 없이 DB 연결

:::note
`@nestjs/typeorm` 라이브러리에는 DatabaseModule이 있어서 쉽게 레파지토리 패턴을 구현할 수 있다. 하지만 해당 라이브러리가 어떤 식으로 구현해주는지는 모르기 때문에 해당 라이브러리 없이 구현하여 어떻게 동작하는지 알아본다.
:::

<br/>

## TypeOrmModule 사용

### 라이브러리 설치

```bash
npm install --save @nestjs/typeorm typeorm mysql2
```

### 설정 예제

먼저 User 엔티티가 있다고 생각하고 진행한다. 밑처럼 AppModule에 `TypeOrmModule.forRoot()`를 설정해준다.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.HOST,
      port: Number(process.env.PORT),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      synchronize: true, // 테이블 생성을 위해
      entities: [User],
      // entities: [__dirname + '/../**/*.entity.{js,ts}'],
      logging: true, // 디버깅을 위해
      charset: 'utf8mb4', // 이모티콘을 쓰기 위해
    }),
  ],
})
export class AppModule {}
```

위 설정이 끝나면 하위 모듈에서 사용가능하게 되며, 밑과 같이 사용할 수 있다.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { User } from './users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
})
export class UsersModule {}
```

이렇게 모듈에 설정이 끝나면 UserService에서 밑과 같이 주입받을 수 있게 된다.

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```

<br/>

## TypeOrmModule 미사용

### 라이브러리 설치

```bash
npm install --save typeorm mysql2
```

### 설정 예제

여기도 User 엔티티가 있다고 생각하고 진행한다. 밑과 같이 모듈을 데이터소스를 모듈에 등록해주고 이 모듈을 각 도메인모듈에서 꺼내쓰게 된다.

```ts
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/users.entity';

@Module({
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'mysql',
          host: process.env.HOST,
          port: Number(process.env.PORT),
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
          database: process.env.DATABASE,
          synchronize: true, // 테이블 생성을 위해
          entities: [User],
          // entities: [__dirname + '/../**/*.entity.{js,ts}'],
          debug: true, // 디버깅을 위해
          charset: 'utf8mb4', // 이모티콘을 쓰기 위해
        });

        return dataSource.initialize();
      },
    },
  ],
  exports: ['DATA_SOURCE'],
})
export class DatabaseModule {}
```

밑과 같이 데이터베이스 모듈을 가져와서 import 해주고, provider 팩토리 패턴을 이용하여 데이터소스를 레파지토리로 사용할 수 있게 만든다.

```ts
import { UserService } from './users.service';
import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/typeorm.module';
import { User } from './users.entity';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
      inject: ['DATA_SOURCE'],
    },
    UserService
  ],
})
export class UsersModule {}
```

그 후, UserService에서 레파지토리를 주입시켜 사용하면 된다.

```ts
import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
}

```

보면 데이터베이스 연결을 설정해주고 각 도메인 모듈에 등록해 주입시켜 사용하는건 같지만, 첫 번째 TypeOrmModule을 사용하는 것이 더 간단하고 코드를 보기도 쉽다. 그렇기 때문에 `@nestjs/typeorm`을 만들어서 사용하는 것 같고, 그렇다하더라도 해당 라이브러리 없이 해봐야 어떻게 데이터소스를 받고 레파지토리를 생성하는지 알 수 있기 때문에 잘 파헤쳐 본 듯하다.

<br/>
