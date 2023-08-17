---
sidebar_position: 1
description: watch 옵션과 핫 리로딩의 차이
---

# 핫리로딩과 watch 옵션 비교

:::note
`핫 리로딩(Hot Reloading)`과 `--watch` 기능은 코드 변경 시 자동으로 애플리케이션을 다시 시작하거나 변경 내용을 감지하는 기능으로 비슷해 보일 수 있다. 하지만 어플리케이션의 재실행 관점에서 보면 서로 다른 기능이다.
:::

<br />

## 핫 리로딩(Hot Reloading)

핫 리로딩은 코드 변경 시 애플리케이션을 다시 시작하지 않고도 변경된 내용이 즉시 반영되는 기능이다. 애플리케이션의 상태를 유지한 채로 코드를 변경하고, 변경 사항을 런타임에 즉시 적용하여 결과를 확인할 수 있다. 주로 개발 환경에서 사용되며, 개발자의 생산성을 향상시키고 빠른 피드백을 제공하기 위해 사용된다.

**즉, 어플리케이션 재시작 없이도 코드를 수정하고 저장하는 등의 작업을 통해 변경사항이 자동으로 감지되고 반영된다.**

### 설정방법

#### 1. 필요한 라이브러리를 설치한다.
```bash
npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

#### 2. 루트폴더에 `webpack-hmr.config.js`를 만들어준다.
``` typescript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
```

#### 3. main.ts에 설정해준다.
```typescript
// ----- 타입 설정 -----
declare const module: any;
// 여기까지

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // ---- 핫 리로딩 설정 ------
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  // 여기까지
}
bootstrap();
```

#### 4. 명령어를 설정한다.
```
nest build --webpack --webpackPath webpack-hmr.config.js --watch
```

위와 같이 명령을 하면 되는데, 너무 긴 명령어이므로 package.json에 밑과 같이 설정해 준다.

```json
{
  ...,
  {
    ...,
    "scripts": {
      ...,
      "start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch",
    },
  }
}
```

이제 `npm run start:dev`를 통해 핫리로딩 설정된 어플리케이션을 실행가능하다.

:::info
참고 - https://docs.nestjs.com/recipes/hot-reload
:::

<br/>

## watch 옵션

`--watch` 옵션은 파일이나 디렉토리를 감시하고 있으며, 변경이 감지되면 설정에 따라 특정 동작을 수행하는 기능이다. 주로 빌드 도구나 테스트 도구에서 사용되며, 파일이 수정될 때마다 빌드, 테스트 또는 자동 실행 등의 동작을 수행할 때 유용하다. 개발자가 특정 파일이나 디렉토리를 감시하며, 변경사항이 발생하면 미리 정의된 동작을 실행한다.

**즉, 개발 중인 코드의 변경을 감지하여 어플리케이션을 재시작한다.**

### 설정방법

기본적으로 nest cli 명령인 `nest new project-name`을 실행하면 package.json에 이미 `npm run start:dev` 명령어로 설정되어 있으므로 바로 사용 가능하다.

```json
{
  ...,
  {
    ...,
    "scripts": {
      ...,
      "start:dev": "nest start --watch",
    },
  }
}
```

<br/>