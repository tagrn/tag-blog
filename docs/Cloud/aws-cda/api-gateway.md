---
sidebar_position: 1
description: 서버리스에서 주로 사용하는 백엔드 통합 인터페이스
---

# API Gateway

:::note

* Open API, Swagger 와 연동 가능하다.
* CORS 커스텀 설정이 가능하다.
* Lambd API와 연결 시, 요청하는 타임아웃은 29초이다. (디폴트 29 / 맥스 29)
* 스테이지를 통해서 URL에 값을 설정하여 dev, test, prod로 이어지게 만들 수 있다.
  * 이는 버전 기반이며, API를 다시 배포하는 게 아니라 구성값만 바꾼다.
* 카나리 배포도 할 수 있다.

:::

<br />

## 통합 타입

#### MOCK 통합 타입

이름 그대로 서버 없이 그냥 응답만하는 것을 뜻한다. 테스트 용도로 쓸 수 있다.

#### HTTP / AWS 통합 타입

API로 요청보내면 서비스와 연동하고 그리고 요청과 응답을 변경해서 사용가능하다. 매핑 템플릿을 통해서 응답과 요청의 파라미터, 내용, 헤더 등을 변경할 수 있다. 변경만이 아닌 새로운 값 추가도 가능하다.

#### AWS_PROXY 통합 타입

요청 / 응답을 변경해서 사용 불가하며, 요청하면 바로 AWS 람다 함수로 간다.

#### HTTP_PROXY 통합 타입

요청 / 응답을 변경해서 사용 불가하며, 백엔드의 요청 / 응답을 보내고 받게 된다.

:::tip

자세한 내용은 [공식문서](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-integration-settings.html)에서 확인할 수 있다.

:::

<br />

## API Type

#### HTTP API
  * API 키가 없어 사용량 설정 불가
  * 비용 저렴
  * 프록시하는 것만 지원
  * 직접 인증 시스템 만들어야 함
  * IAM 사용 불가
#### Websocket API
  * 실시간 어플리케이션을 위해 만들어짐
  * onConnect / sendMessage / onDisconnect 를 통해서 작동
  * 콜백 URL: `{기본URL}/@connections/{connectionId}`
  * 라우팅 키 테이블을 통해서 어떤 람다에 요청할지 정하는 라우팅 시스템 존재
#### Rest API
  * API 키가 있어 사용량 설정 가능
  * 인증 시스템 지원
  * IAM 사용 가능
  * private Rest API 존재

<br />

## EndPoint Type

3가지 타입이 있다. default는 Edge-Optimized 타입이다.

#### Edge-Optimized
클라우드 프론트 엣지 로케이션을 사용해서 글로벌하게 사용하는 타입(주의할 점은 API Gateway는 한 리전에만 살아있음)
#### Regional
해당 지역만 사용하는 타입
#### Private
Private VPC의 ENI만 접근가능한 타입

<br />

## 캐시

비용이 비싸다. 메모리는 0.5GB - 237GB, TTL은 0 - 3600로 설정 가능하다. 캐시는 스테이지 당 정의되고 오버라이딩 세팅을 통해 메서드에 따라 따로 캐시 세팅을 하는 것도 가능하다.

#### 캐시 무효화

2가지 방법이 존재한다.
1. 콘솔을 통해서 모든 캐시 없애기
2. 헤더를 통해서 캐시 max-age=0으로 설정

<br />

## 인증

1. IAM 으로 가능
2. Coginto User Pool로 가능
3. Lambda(Custom) Authorizer로 가능 - 이게 제일 많이 사용
4. Lambda(Custom) Authorizer에 토큰이 맞는지 확인해서 람다랑 연결 가능

<br />

## 사용량 제한

#### API Key

사용자들을 분리하는 기준이다. 처리량을 설정할 수 있다. x-api-key 헤더에 api key를 넣어서 요청해야 한다.

#### Usage Plan

사용량 설정할 수 있다. API Key를 통해서 해당 클라이언트의 액세스, 처리량들을 확인할 수 있고, 추가 요청이 없는 한 해당 사용량을 초과하면 서비스를 사용 못하게 된다.

#### Usage Plan과 연동방법

API Key 생성 - Key마다 처리량 설정 - Usage Plan 작성 - API Key와 Usage Plan 연동

<br />

## CloudWatch의 중요한 Metrics

* CacheHitCount: 캐시 힛 수
* CacheMissCount: 캐시 미스 수
* Count: 일정 기간에 보내진 API request 수
* IntegrationLatency: API Gateway가 백엔드에 요청을 보내고 응답을 다시 받는 시간까지 시간(통합지연시간)
* Latency: 클라이언트가 요청을 보내고 응답을 받는 시간(지연시간)
* 4XXError: 클라이언트 에러 수
* 5XXError: 서버 에러 수

<br />

## Stage limit & method limit

초당 10000 처리량이 기본이다. Stage limit & method limit & Usage Plan에 따라서 API Gateway의 처리량에 제한이 걸린다. 제한이 걸리면 `throttle - 429 Error` 이라는 에러가 나온다.

:::tip
 초당 10000 처리량(RPS)에 대한 내용은 [공식문서](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html) 참고
:::

<br />
