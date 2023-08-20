---
sidebar_position: 3
description: CLI와 SDK의 기능을 알아본다
---

# CLI&SDK

## dry-run

cli에는 `--dry-run` 이라는 옵션이 있다. 명령에 옵션으로 넣으면 되고, EC2 인스턴스에서 해당 명령을 할 권한이 있는지 확인하는 것이다. 이렇게 하면 실제로 실행되지 않으므로 비용적인 문제나 실제 구동이 되는 것을 방지할 수 있다.

<br />

## Error Message Decode

명령을 내렸을 때, 에러가 나오면 에러메세지가 나오는데, 이 에러 메세지를 STS 커맨드로 디코딩할 수 있다. 해당 IAM에 sts 권한을 줘야한다. 밑에 예시코드를 적어 두었다.

`aws sts decode-authorization-message --encoded-message {value}`

<br />

## meta-data

앞에서 user-data를 배웠다. user-data는 해당 인스턴스가 시작될 때, 딱 한 번만 실행되는 스크립트라고 말했고, 지금 이 meta-data는 조금 다른 개념이다. 인스턴스 정보를 뜻하며, 인스턴스의 거의 모든 정보를 불러올 수 있고, 특정한 ip를 통해서 가져온다. 가져오는 방법은 아래의 주소에 명령내릴 키워드를 추가하여 데이터를 불러올 수 있다.

`169.254.169.254/latest/meta-data/{keyword}`

<br />

## with MFA

STS GetSessionToken API 를 써서 MFA를 인증해야한다. 밑과 같이 명령을 내려 세션토큰을 얻은 후, 프로필에 저장해준다.

`aws sts get-session-token --serial-number {arn-of-the-mfa-device} --token-code {code-from-token} --duration-seconds 3600`

<br />

## limit & Quotas

EC2 상세정보 API는 100req/sec 로 제한되고, s3 get Object API는 5500req/sec로 제한된다. 이처럼 각 API는 제한되어 있고, 이 제한(API Rate Limits)을 증가시키려면 AWS에 요청해야 한다.

서비스 할당량도 제한이 있는데, 1152개의 CPU까지 사용가능하다. 이렇게 서비스 할당량도 각 리소스마다 정해진 양이 있고, 빈도 제한과 마찬가지로 티켓을 열어서 AWS에 더 많은 CPU를 사용할 수 있도록 요청 가능하다.

<br />

## 지수(Exponential) 백오프

요청을 재시도를 해야하는 경우 사용한다. Throttling Exception(재시도 에러) 시, 1초동안 첫번째 요청, 다음 요청은 2초, 다음요청은 4초, 다음시도는 8초, 그 다음시도는 16초처럼 지수곱을 하여 다음 요청을 요청하게 된다.

<br />

## 권한 인증

* Command line options - 최우선
* Env variable - 두번째 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
* cli credentials file - 세번째 (~/.aws/credentials on Linux)
* cli configration file - 네번째 (~/.aws/config)
* Container credentials - ECS tasks - 다섯번째
* Instance profile credentials - 여섯번째

이걸보면 인스턴스 자체에서 환경변수로 쓰는 것을 권장하지 않는다. 예를 들어, 한 인스턴스에서 두 서비스가 돌 때, 한 서비스에는 권한이 모두 풀려야 되고, 다른 서비스에서는 읽기 권한만 가져와야한다고 상상해보자. 그 때, 환경변수에 지정해 놓으면 읽기 권한만 가져와야하는 서비스도 모든 권한이 풀려있기 때문에 쓰기가 된다. 그렇기 때문에 IAM role을 많이 쓰게 된다고 한다.

<br />

## 기타

* CLI, SDK에 기본 리전을 정해주지 않으면 us-east-1이 디폴트로 지정된다.
* 모든 요청은 SigV4를 통해서 이루어진다. 추가적인 인증데이터(ex. url에 시간 제한적인 토큰)가 날라가는 형식이다.

<br />
