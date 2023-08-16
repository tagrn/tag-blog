---
sidebar_position: 19
description: AWS 서버리스 서비스 자동화 배포 및 STS 자격증명
---

# SAM&STS

## SAM

서버리스 서비스들의 cloudFormation을 쉽게 만든 것이라 보면 된다. `sam build -> sam package -> sam deploy` 명령어를 치면, `SAM Template -> Cloud Formation Template -> S3 -> CloudFormation` 형식으로 진행된다.

- S3ReadPolicy, SQSPollerPollicy, DynamoDBCrudPolicy 같은 정책을 설정한다.
- 템플릿에 Transform / Resources 를 무조건 필요로 한다.

### SAR

SAR이라는 저장소에 sam 패키지를 저장해놓고 다른 사용자가 바로 사용할 수 있게끔도 할 수 있다. 다른 사용자는 환경변수같은 변경해야 하는 서비스들만 설정해주면 바로 사용가능하다.

### CodeDeploy와 SAM의 통합

lambda함수를 버전업할 때, 사용할 수 있다. canary deploy도 가능하다.

<br/>

## STS

최대 1시간까지 임시 보안 자격 증명을 얻어서 액세스 할 수 있다.

### API

여러가지 API가 있으며, 밑은 예시이다.

- AssumeRole: 계정 또는 교차 계정 내의 역할 자격 증명
- AssumeRoleWithSAML: SAML로 로그인 한 역할 자격 증명
- AssumeRoleWithWebIdentity: 요즘은 CUP을 대신 사용하는데, Oatuth2.0으로 얻을 수 있는 역할 자격 증명
- GetSessionToken: MFA가 있는 경우, AWS 유저의 자격 증명
  - 이 경우, 적합한 IAM 폴리시가 필요함.
  - `aws:MultiFactoerAuthPresent: "true"` 조건을 줘야함.
  - 반환 값은 Access ID, Secret Key, Session Token, Expiration date 이 있음.
- GetFederationToken: 엽합된 사용자의 임시자격 증명
- GetCallerIdentity IAM 유저 or 롤의 디테일 정보 얻음(신원과 계정정보)
- DecodeAuthorizationMessage 오류메세지를 디코딩

<br/>
