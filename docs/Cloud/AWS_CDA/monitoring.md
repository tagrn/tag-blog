---
sidebar_position: 16
description: AWS에서 모니터링 하는 방법
---

# Monitoring

## CloudWatch

- CPU, Network 사용량 이런 지표들을 통해서 에러 핸들링이 가능하다.
  - 비용을 더 지불하면 1분마다 디테일 모니터링 가능하고, 디폴트는 5분이다.
  - 프리티어로는 10개까지 가능하다.
- Namespace라는 매트릭 이름을 통해서 커스텀 매트릭을 설정할 수 있다.
  - 로그인 한 유저 수, 디스크 용량, 램 사용량 등
- 스토리지 해상도(데이터 집계 단위)를 선택 가능하다. 기본은 1분이다
  - storage resolution - {1s, 5s, 10s, 30s, 60s}마다 집계 API 호출

:::info
자세한 정보 - https://aws.amazon.com/ko/cloudwatch/faqs/
:::

### CloudWatch Logs

로그를 저장하는 최적의 장소라고 생각하면 된다. Log groups로 나눠서 저장하고 Log stream은 인스턴스 내의 어플리케이션, 로그파일, 컨테이너 들을 뜻한다.(시험에서 Log stream 단위마다 저장한다라는 문구가 나올 수 있으니 주의!) 데이터 삭제 설정은 삭제하지 않거나 30일 뒤에 삭제하는 정책이 있다.

#### Third Party

S3, Kinesis Data Streams / Firehose , Lambda, ElasticSearch로 로그를 보낼 수 있다. 여기에 로그를 보낼 수 있는 서비스 유형은 SDK, CWLA, 빈스톡, ECS, 람다, Flow Logs, API Gateway, Cloud Trail, route53 이다. 어떠한 표현식을 filtering 해서 클라우드 와치 알람으로 전달 가능하다.

S3 Export는 내보내기(CreateExportTask(API))에 최대 12시간 걸릴 수 있다. 클라우드 와치에서 Subscription Filter가 데이터를 받아 어떠한 곳으로 보내준다. Data Firehose를 통해서 S3로 거의 실시간 데이터 전달이 가능하다. (ex. CWL -> SF -> KDS -> KDF -> S3로 near realtime) 멀티 리전도 가능한데, 앞의 CWL -> SF 로 가는 루트를 여러 개 설정하면 된다.

#### Agent

기본적으로 EC2 인스턴스에서 클라우드 와치로 로그를 못 보낸다. 에이전트가 필요하다. EC2에서 클라우드 와치 로그 에이전트가 설치되고 클라우드 와치 로그에 쌓는 방식을 사용해야 하고, 온프레미스도 가능하다.

#### Access

Cloudwatch Logs Access는 Cloudwatch Logs의 로그 작업만 보낸다. 하지만 Unified Access는 시스템레벨의 매트릭도 가져와 준다. 이를 통해 로그 중앙 집중화가 가능하다.

Unified Access에서 쓸 수 있는 데이터들 예시: Netstats, processes, ram, cpu, disk metrics 등

### Metric Filters

경보 트리거(특정 단어가 몇번 이상 나왔을 때, 즉 임계값 설정)를 설정할 수 있다. 필터가 생긴 후의 데이터만 확인한다.

사용 예제: Instance(+ Agent) -> Cloudwatch logs -> Metric Filters -> Cloudwatch alarm -> AWS SNS

### Cloud Alarms

Sampling, %, max, min 등의 다양한 옵션을 사용할 수 있다. 앞에서 처럼 resolution(해상도) 설정이 가능하다. 원래는 60초 단위인데, 10, 30초로 설정가능하다.

CLI의 set alarm state를 통해서 알람 테스트 가능하고, 테스트는 `--alarm-name` `--state-value` `--state-reason` 옵션을 정해서 보내야 한다.

3가지 상태 존재: OK(정상), INSUFFICENT_DATA(설정한 경보 값), ALARM(알람)

알람 트리거로 할 수 있는 것 예시: EC2 중지 종료, 리부팅 / ASG 스케일 인, 아웃 / SNS 알림

### Cloud Events

AWS의 서비스들의 이벤트를 인터셉트하여 어떠한 이벤트를 발생시키는 게 가능하다. 스케줄이나 크론으로 이벤트를 생성하는 것도 가능하다. JSON 페이로드가 생성되어서 타겟으로 보내지게 된다. 하지만 이는 deprecated 되었고, event Bridge를 사용한다.

### with Event Bridge

- Default Event Bus - 클라우드 이벤트와 같음.
- Partner Event Bus -여러 Saas서비스, 앱에서 이벤트를 받을 수 있음.
- Custom Event Bus - 나의 앱에서 이벤트 받기 가능

Event Bus는 AWS 계정에서 접근 가능하고, 모든 이벤트를 아카이빙 하거나 필터를 통해서 몇 개만 아카이빙할 수도 있다. 기간도 무기한이나 따로 정할 수 있다. 아카이빙을 통해 다시 볼 수 있고, 룰을 통해 이벤트를 처리한다.

이벤트를 받는 것도 리소스-베이스 정책을 설정할 수 있다. (지역, 계정 등)

#### Schema Registry

- 이벤트 브릿지에 데이터가 오면 스키마를 분석해줌
- 스키마레지스트리가 나의 앱이 이해하기 위한 코드 이벤트를 보냄.
- 이벤트브릿지는 클라우드 와치 이벤트의 상위버전

<br/>

## X-ray

여러 어플리케이션의 시각적 분석을 제공한다. 그렇기 때문에 마이크로 서비스 아키텍처 종속성을 이해하기 쉽다. 어떤 서비스에 이슈가 있는지, 각 요청의 동작을 이해할 수 있고, 요청 기반으로 에러 핸들링 및 트러블 슈팅을 할 수 있다. 여러 서비스(Lambda, Beanstalk, ECS, ELB API Gateway, EC2(+ 온프레미스) 등)에 호환 가능하다.

ex. 병목현상 확인, SLA 만족하는지 확인, 어디서 제한(throttle)되고 있는지 확인, 오류의 영향을 받는 사용자 확인

### 보안

여기는 다른 서비스들과 거의 비슷하다.

- IAM 인증
- KMS 암호화

### 용어

- Segments - URL에서 볼 수 있는 것. 각각의 어플리케이션/ 서비스에 보내는 것들.
- Subsegments - Segments의 세부사항 - 원할 때 사용.
- Trace - 모든 Segment를 모은 것 - ETE의 추적에 용이
- Sampling - 몇몇개의 요청만 사용 (%)
- Annotations - 필터와 함께 사용할 key-value의 index된 값들.
- Metadata - key-value의 값들 index된 값들은 아니다.

### Sampling

정해진 초(reservoir)마다 첫번째의 요청 기록 및 다음 정해진 양(rate)의 요청만 기록한다.

- reservoir - 몇 초당
- rate - 몇 퍼센트

기본은 1초당 5%이다.

### use case

X-ray를 사용하려면 우리의 코드에 X-ray SDK를 가져와야 한다. 그리고 인스턴스에 X-ray daemon / agent를 실행시킨다. 데몬은 1초마다 배치로 로그를 AWS X-Ray에 보내게 된다.

#### Beanstalk에서 X-ray 사용방법

.ebextensions/xray-daemon.config에 밑과 같이 설정해주면 된다.

```
option_settgins:
	aws:elasticbeanstalk:xray:
		XRayEnabled: true
```

물론 IAM 권한을 부여해야 한다.

콘솔에서도 configuration에서 활성화가능 / 활성화되면 Health에서 연결된 EC2 인스턴스를 찾아서 해당 인스턴스의 IAM role을 보면 EBWebTier 폴리시를 보면 X-ray 권한이 부여된 것을 확인할 수 있다.

#### ECS에서 X-ray 사용 패턴

1. ECS Cluster - EC2당 하나의 데몬 자체를 컨테이너로 사용
2. 사이드카 패턴 - 어플리케이션마다 X-ray sidecar가 존재
3. Fargate에서 사이드카 패턴으로 사용

<br/>

## CloudTrail

해당 서비스는 디폴트로 설정되어 있다. AWS 계정 내의 모든 이벤트 / API 콜 내역을 볼 수 있다. Console, SDK, CLI, Services 에서 모두 해당 로그들을 Cloud Logs나 S3로 보낸다. 모든리전에 적용되어 있는데, 한 리전에만 적용시키게 할 수도 있다.

### Event

#### 관리(Management) Event

AWS 계정에 있는 리소스에서 수행되는 작업을 뜻한다. 관리이벤트는 무조건 기록하도록 디폴트 구성이 되어 있고, 바꿀 순 있다. read 이벤트와 write 이벤트를 필터로 나누기 가능하다.

ex. 누군가 IAM 보안 정책을 설정할 때마다, 서브넷 설정할 때마다 등

#### 데이터 Event

디폴트로 저장하지 않는다. 왜냐하면 해당 로그들은 엄청나게 많기 때문이다. 여기도 read 이벤트와 write 이벤트의 분리가 가능하다.

ex. S3 getObject, deleteObject .... , lambda API 콜

#### CloudTrail Insights Event

해당 서비스는 유료이며, CloudTrail의 log들로 이상현상을 체크해준다. 이전에 잘 작동할 때를 기준으로 베이스라인을 만들고 비정상적인 패턴을 감지하게 되는 것이다. 간단한 예제로 관리이벤트는 인사이트로 체크를 하고 있는데, 이상한 현상이 발생하면 ClooudTrail 콘솔에 나타나고 이벤트 브릿지를 통해서 어떠한 이벤트도 만들 수 있다.

### Event Retention

Events는 90일 동안 저장된다. 이거 이후로 저장하려면 로그를 S3에 보내야한다.

<br/>

## CloudTrail vs CloudWatch vs X-ray

* CloudTrail은 Audit API calls by users / services / AWS console 에 쓰이며, 승인되지 않은 API콜을 찾거나 근본적인 변경 원인을 찾는 것이다.
* CloudWatch Metrics로 지표 모니터링을 하고, Logs로 어플리케이션 로그 저장을 하며, Alarms 를 통해 어떤 예상치 못한 지표가 나왔을 때 알려준다.
* X-ray는 자동화된 추적분석, 중앙서비스 시각화 기능을 가지고 있다. 지연율 , 오류 분석에 좋고, 분산 시스템 전체의 추적에 좋다고 볼 수 있다.

<br/>
