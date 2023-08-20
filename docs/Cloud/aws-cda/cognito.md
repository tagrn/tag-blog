---
sidebar_position: 6
description: AWS Managed 인증 서비스
---

# Cognito

## Cognito User Pools

CUP라고 불리며, ADMIN 페이지와 유저 관리를 지원해준다. 심플로그인을 통해 어플리케이션 접속하는 일이 가능하다는 말이다. 소셜 로그인 및 연합 인증도 지원해주고, 개인 정보가 유출된 사용자의 접근 차단도 가능하다. 인증하면 JWT를 반환하게 된다.

### AWS와 통합방법

API Gateway나 ALB로 통합가능하다. API Gateway 사용은 `Cognito <-> 클라이언트` 통신 후, 클라이언트가 API Gateway로 JWT 보내고 인증해서 람다에 요청하고 다시 데이터 돌려주는 방식이다. ALB는 ALB에서 Cognito 인증하고 JWT 돌려주면 그거로 다시 ALB 가서 인증한 후, 서버로 가는 방법이다.

ALB가 좀 더 확장성이 높으니 대부분의 상황에는 ALB지만, 상황에 맞게 선택하면 된다.


### 커스텀

거의 모든 방면에서 커스텀 가능하다.

예를 들면, 회원가입부터 로그인까지 각 단계에서 람다트리거를 사용가능하고, 로그인 화면 커스텀 CSS 적용 가능하다.

<br />

## Cognito Identity Pools

해당 인증을 통해서 IAM Policy 기반의 권한을 얻을 수 있게 된다. 즉, AWS 시스템을 사용가능하게 된다는 말이다. user_id 기반으로 권한이 조정될 수 있다.

OpenID Connect Providers / SAML Identity Providers / CUP / Customer login Server / guest policy (unknown user) 들과 연결 가능하다.

<br />

## Cognito Sync

현재는 AppSync로 쓰이고 있다. AppSync의 말 그대로 앱 내 사용자의 설정 및 상태를 저장하며, 기기(플랫폼) 간의 동기화를 지원한다. 데이터셋은 20개 까지, 1MB까지 저장된다.

### Push Sync

identity data가 바뀌면 모든 디바이스에 알림을 통해 동기화해준다.

### Cognito Stream

Kinesis에 스트림 데이터 보낸다.

### Coginto Events

트리거로 Lambda를 사용 가능하게 한다.

<br />