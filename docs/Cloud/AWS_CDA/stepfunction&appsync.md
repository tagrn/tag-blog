---
sidebar_position: 22
description: 서버리스 서비스 워크플로우 및 웹/앱 모바일 어플리케이션 구축 간편화 서비스
---

# StepFunction&AppSync

## Step Functions

쉽게 워크플로우를 짤 수 있다. Task State에 어떠한 서비스가 올지 설정하거나 어떠한 서비스와 연동하는 행동을 설정할 수 있다. JSON으로 스크립트를 짜야하며, 시각적으로 볼 수 있다.

### Step Status

- Choice State - 어떠한 조건에 따라서 설정한 브랜치로 이동
- Fail or Suceed State - 해당 태스크의 성공과 실패에 대한 설정
- Pass State - 입력값을 전달하거나, 어떠한 고정된 값을 주입
- Wait State - 지정된 시간을 지연 시킴
- Map State - 단계들을 동적으로 반복
- Parallel State - 병렬적으로 실행 시켜줌

### WorkFlow

#### Standard WorkFlow

- 최대 기간 1년
- 초당 2000개의 워크플로우 생성 가능
- 1초당 4000개의 상태변환 가능
- 실행이력 보기 가능
- 워크플로우가 정확히 한 번 실행

#### Express WorkFlow

- 최대 기간 5분
- 초당 100000 워크플로우 생성가능
- 상태전환 무제한
- 실행 이력 보기 불가, 클라우드 와치 로그로 볼 수 있음
- 적어도 한 번 실행

### Error Hadling

Retry 정책과 Catch 정책을 만들 수 있다.

#### 미리 정의되어 있는 에러 코드

- States.ALL
- States.Timeout
- States.TaskFailed
- States.Permissions

에러 코드는 커스텀 해서 만들 수 있다.

#### Retry 변수

- ErrorEquals - 리스트 형태로 어떤 에러에 contains 되어 있는지 확인한다.
- IntervalSeconds - 다시 요청하는 것에 딜레이를 준다.
- MaxAttempts - 최대 몇 번 요청
- BackoffRate - 지수 백오프 지수 설정

#### Catch 변수

- ErrorEquals - 리스트 형태로 어떤 에러에 contains 되어 있는지 확인한ek.
- Next - 어떤 스테이트를 호출 한다
- ResultPath - `"ResultPath": "$.error"` 으로 사용하며, 전송되는 입력값을 같이 에러 블록과 같이 보낸다.

<br/>

## AppSync

웹 및 모바일 애플리케이션 구축을 간소화해주는 서비스이다. 여러 서비스랑 연결 가능하고 클라우드 와치 로그/메트릭으로 모니터링 가능하고, 캐싱 설정도 가능하다.

### usecase

- GraphQL API
- 실시간 웹소켓, MQTT 웹소켓
- 모바일 어플리케이션 - 로컬 데이터 액세스 및 동기화

### Graphql

Schema를 AppSync에 업로드 후, 클라이언트에서 Query를 받고 DB에서 resolve해서 바로 전달 가능하다.

### 보안

- API_KEY 로 사용 가능
- AWS_IAM users / roles / cross-acount access 으로 사용 가능
- OPENID_CONNECT - OpenID 제공자랑 연동(JWT 사용)
- CUP 사용

HTTPS를 사용하기 위해서는 AppSync 앞에 클라우드 프론트 붙여서 사용하면 된다.

<br/>

## Amplify

모바일 및 웹 어플리케이션을 위한 엘라스틱 빈스톡이다. authentication은 Cognito를 통해서 지원해 주고, Data는 AppSync와 DynamoDB를 통해서 지원해 준다. 이거도 클라우드 포메이션 베이스이다.

### 종류

- 시각적으로 풀스택을 위한 Amplify Studio
- CLI로 풀스택을 위한 Amplify CLI
- 여러 서비스와 연결하기 위한 Amplify Libraries
- AWS로 호스팅 해주는 Amplify Hosting

<br/>
