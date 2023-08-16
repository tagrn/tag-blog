---
sidebar_position: 20
description: AWS의 보안과 암호화 시스템
---

# Security&Encryption

## KMS

AWS에서 암호화에 필요한 키를 관리하는 서비스이다. IAM과 완전히 통합되어서 인증한다.

### KMS의 타입(Customer Master Key(CMK) Types)

#### Symmetric (AES-256 keys) - 대칭키

해당 키를 사용하기 위해서는 KMS API를 사용해야 하고 키를 보지 않아도 된다.

#### Asymmetric(RSA & ECC key pairs) 비대칭 키

KMS 서명 검증에 사용하기도 한다. KMS API를 사용할 수 없는 AWS 외부의 사람이 공용키를 통해서 암호화하는 형식에 사용한다.

### AWS 대칭키 세부정보

AWS에서는 대칭키를 주로 사용한다. 사용할 때, 해당 키의 사용량 확인 가능하고, 생성, 로테이션 정책, 사용/미사용 트리거 등이 가능하다. 기본 CMK는 무료이며, 전용 키는 1달에 1달러, 외부에서 생성한 키를 만들면 1달에 1달러로 관리 가능하다. 앞에서 말했듯이 KMS의 좋은 점은 관리를 KMS에서 해주니까 키를 안보고 KMS API를 통해서 암호화가 가능하다는 점이다.

호출 비용은 1만번 호출(KMS API)당 0.03달러이다. 호출당 4KB 데이터만 암호화 가능하다. 더 많은 데이터를 암호화 하고 싶다면 봉투암호화라는 것을 사용해야 한다. (Envelope Encryption) KMS 키는 특정리전에 묶이게 되어, 리전간 이동이 불가능하다.

### 봉투 암호화(Envelop Encryption)

GenerateDataAPI를 쓰며, 클라이언트 사이드에서 큰 파일을 암호화 및 해독하게 된다.

### 요청 할당량

할당량을 초과하게 되면 ThrottlingException이 떨어지게 된다. 지수 백오프 전략으로 retry 가능하다. 암호화, 해독은 모두 할당량에 포함된다. (모든 서비스 할당량 공유) 그렇기 때문에 캐싱을 이용한다. (DEK 캐싱을 사용하면 좀 나음 - 나중에 배우는 S3 Bucket Key를 이용하면 사용량이 엄청 줄어든다) 더 이상의 할당량 증가 요청은 AWS에 티켓을 열면 된다.

### S3 암호화

SSE-KMS는 KMS가 키를 관리하면서 audit trail도 이용가능하다. 4KB 까지만 암호화 가능하고, KMS 액세스를 승인하는 IAM 폴리시가 있어야한다. GenerateDataKey 및 Decrypt API 호출을 주로 사용한다.

#### S3 Bucket Key

KMS 비용을 99% 감소나 감소하게 만든다. KMS의 키를 이용해서 S3에 버킷키를 만들어서 해당 키로 암호화한다. (S3내에서 암호화가 되는 형식)

<br/>

## Parameter Store

- KMS를 사용해서 암호화 가능(선택 사항)
- 서버리스이고, SDK로 쉽게 사용 가능
- 설정과 secrets의 버저닝도 가능
- Cloudformation과 통합 및 CloudWatch Event Notification 가능
- Secret Key Lotation이 가능한데, 클라우드 이벤트를 이용하여 람다와 함께 사용해야 함

### Path

모든 보안은 IAM과 Path를 통해서 설정하는데 이 중 Path는 파라미터가 있는 위치를 뜻 한다. 패스를 통해서 값을 가져올 때, 해당 패스의 밑에 있는 파라미터는 모두 가져올 수 있다. 정책에도 어떤 패스 밑의 값을 가져올 수 있게 할지 정할 수 있다. 추가로 Secrets Manager 나 다른 서비스의 리소스 값을 `aws/` 하위 경로를 통해 가져올 수 있다.

### 티어

표준티어는 무료이고, 고급티어는 유료이다.

**표준**

- 초당 4KB 파라미터를 1만개까지 가능.

**고급**

- 초당 8KB 파라미터를 10만개까지 가능.
- 추가 정책 설정가능(TTL, 변경 주기 강제 등)

<br/>

## Secrets Manager

- 암호화 위주의 서비스
- X days 업데이트를 로테이션 할 수 있음. (람다 사용해서 자동으로 가능 - Parameter Store보다 쉬움)
- RDS랑 통합 가능
- 암호화 필수

암호 저장, 암호의 순환, RDS 통합에 관련된 암호 매니저라고 생각하면 된다. 이게 더 비싸고, 다른 서비스와 통합되어 있는 것이 많다.

<br/>
