---
sidebar_position: 21
description: 메세지, 이벤트 큐 및 실시간 데이터 처리 시스템
---

# SQS&SNS&Kinesis

:::note
3가지 서비스는 비동기, event 기반으로 어플리케이션과의 커뮤니케이션을 지향한다.

- SQS - queue model
- SNS - pub/sub model
- Kinesis - real-time streaming model
:::

<br/>

## SQS

AWS의 첫 서비스들 중 하나로 의미있는 서비스라고 할 수 있다. 어플리케이션 분리를 위해 만들어졌고, 지금도 잘 쓰인다. 버퍼 역할을 하는 Queue를 통해 메세지를 쌓고 Consuming 하여 메세지를 가져가게 되는 구조이다.

메세지를 보내는 Producer와 메세지를 받는 Consumer가 있고, 메세지를 받고 처리하면 대기열의 메세지를 삭제하는 API를 호출한다.

### 메세지

메세지 처리량에 제한이 없고, 수명은 짧다. 4일이 기본이고 최소 1분, 최대 14일이다. 메세지 처리의 지연시간은 10ms 밖에 되지 않는다. 256KB 이하의 메세지만 처리가능하다. (최소 1KB ~ 최대 256KB)

메세지가 duplicated 될 수 있어서 전달이 최소 1번이라고 정해져있다. 그래서 어플리케이션 만들때 주의해야 한다. 이에 대해서는 가시성 초과시간(message visibility Timeout) 설정을 통해 잘 조정해야 한다.

### 가시성 초과시간

한 consumer가 데이터를 받았다면 가시성 타임아웃동안 다른 consumer가 데이터를 수신할 수 없음을 뜻한다. 가시성 타임아웃은 기본 30초이며, 0초에서 12시간까지 설정가능하다. ChangeMessageVisibility API를 통해서 현재 그 메세지를 좀 더 처리해야한다고 SQS에 알릴 수도 있다.

### Producer & Consumer

Producer는 SDK의 SendMessage API를 사용하여 SQS에 메세지를 보낸다.

Consumer는 Consuming 할 때, 한 번에 메세지 10개까지 받을 수 있다. 데이터를 받고 deleteMessage API를 SQS로 보내서 처리했다는 표시를 하고, 메세지는 SQS에서 사라진다.

### ASG Consumer

SQS를 사용 할 때, ASG상의 Consumer를 늘리는 기준은 SQS의 대기열 길이이다. 너무 길어지면 CloudWatch 알람에 알리고 ASG는 Consumer를 늘리게된다.

### Dead Letter Queue

가시성 초과시간에 메세지를 Consumer가 읽지 못하고 대기열로 돌아가는 현상이 계속 반복되면 문제가 발생하게 된다. 그런 문제가 몇번 발생하는지 확인하고 임계값을 넘으면 Dead Letter Queue으로 보내지게 되고, 나중에 해당 메세지를 처리하도록 해준다. (재드라이브 정책 사용)

디버깅에 유용하고 Dead Letter Queue도 SQS라서 기간이 지나면 사라지니까 14일로 설정하는 것을 기본으로 한다.

### Delay Queue

15분까지 지연시킬 수 있다. 기본 값은 0초이다. 매번 메세지를 보낼 때마다 DelaySeconds 파라미터로 메세지마다 설정할 수 있고, SQS 상에 기본적으로 설정된 값을 쓸 수도 있다.

### Long Polliong

대기열에 메세지가 없으면 메세지가 들어올 때까지 기다리게 하는 것이다. 이를 쓰는 이유는 SQS에 보내는 API의 호출 횟수를 줄일 수 있고, 대기열에 들어오는 메세지를 바로 받을 수 있기 때문이다. 롤 폴링시간은 1~20초로 설정 가능하다. 대기열 레벨에서 설정할 수 있고, WaitTimeSeconds 파라미터를 사용해서 폴링단에서 설정도 가능하다.

short polling(1초)을 사용하면 너무 많은 호출로 인해서 많은 비용이 발생할 수도 있기 때문에
조심해야 한다.

### SQS Extended Client(Java Library)

`1GB 메세지를 보내는 것을 어떻게 할 것 인가?`에 대한 답을 찾은 라이브러리이다.

S3 버킷을 레파지토리로 사용하고, 프로듀서는 대용량 메세지를 S3에 담고 small metadata를 SQS에 담는다. Consumer는 small metadata를 받고나서 S3 버킷에서 대용량 데이터를 가져오는 방식이다. (근데 라이브러리 안 쓰고 이런 부분은 그냥 구현해도 된다.)

### APIs

- CreateQueue 대기열 생성 - MessageRetentionPeriod 파라미터 사용가능
- DeleteQueue 대기열 삭제 - 모든 메세지도 같이 삭제
- PurgeQueue - 모든 메세지 삭제
- SendMessage - DelaySeconds 파라미터 사용가능
- RecieveMessage - 메세지 폴링
- DeleteMessage - 메세지 삭제
- MaxNumberOfMessages - 파라미터는 1 ~ 10 가능
- RecieveMessageWaitTimeSeconds - 롱 폴링 설정 (1~20초)
- ChangeMessageVisibility - 가시성 타임아웃 설정(0초 ~ 12시간)

### SQS FIFO

표준 대기열은 메시지가 일반적으로 전송된 것과 동일한 순서로 배달되도록 보장하는 최선형 순서를 제공한다. 최선형 순서라는 것은 순서를 보장한다는 말이 아니기 때문에 순서를 보장하는 SQS FIFO가 필요하다.

> 참고 - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html

메세지가 하나씩 간다면 초당 300 msg/s, 배치는 3000msg/s 로 처리량 제한이 있고, SQS 이름이 .fifo로 끝나야 한다.

deduplication 정책을 통해 중복제거를 할 수 있다. 중복제거를 활성화하면 5분 간격이내에 같은 메세지를 보내면 리젝시킨다. 동일한 메세지인지 확인하는 것은 2가지가 있다.

1. 직접적으로 deduplication ID를 지정하는 것.
2. 내용이 같은지 확인하는 것.

### Messge Grouping

입력을 하지 않으면 그룹 ID가 모두 똑같은 것으로 인지한다. 그룹 ID를 동일하게 만들면 한명의 소비자를 위해 사용되고, 여러 ID를 만들어서 각각 Consumer에게 전달할 수 있다. 그룹 당 Consumer 한 개로 지정되고, 그룹 안에서는 메세지들이 순서대로 정렬된다.

### 기타

#### Cross Account Access

다른 계정(정책 설정 가능)간에 메세지를 받을 수 있도록 한다.

#### SQS를 사용하는 예제

비디오인코딩 및 백준/코드포스 문제풀이 대기열

#### 보안

- HTTPS
- KMS
- IAM Policies
- SQS Access Policies

<br/>

## SNS

Publisher가 메세지를 보내면, Topic을 통해서 메세지 구분을 하고 Subscriber에게 전달한다. Topic별로 1250만개의 구독이 가능하다. Topic 수 는 10만개 제한된다.

### Fan-out 패턴

SQS와 통합하여 사용하는 패턴이다.

** Service -> SNS Topic -> SQS Queue(여러개로) -> 서비스 도달 **

SNS에서 메세지를 통해 SQS Queue에 여러 메세지를 보내는 것이다.

### SNS FIFO

SQS와 마찬가지이다. 여기도 그냥 SNS는 최선형 순서만 보장하기 때문에 SNS FIFO가 필요하다.

메세지 Group Id당 order 되고, Deduplication ID or Content Base로 중복적재를 방지한다.

여기서 다른 점은 SQS와 통합할 때, SQS FIFO만 subscriber로 가능하다는 점이다.

### 기타

#### Filter Policy

각각의 subscriber에 메세지 필터를 해서 보낼 수 있다.

#### Subscribers

SQS, Lambd, Emails, Mobile, SMS, Kinesis Data Firehose, Https End points

#### 보안

- HTTPS
- KMS
- IAM Policies
- SNS Access Policies

<br/>

## Kinesis Data Stream

실시간, 빅데이터, 데이터 분석 등에 사용되는 실시간 스트리밍 서비스이다.

### Shard

KDS안 에는 번호가 매겨진 여러 샤드가 존재한다. 샤드는 프로비저닝 되어야 하고, 샤드가 수집, 소비율에 맞춰 스트림 용량을 결정하게 된다. Ondemand Mode를 사용할 때는 프로비저닝될 필요는 없고 알아서 주기적으로 스케일링을 한다.

#### Shard Splitting

한 샤드로 많은 트래픽이 모이는 것을 Hot-shard가 되었다라고 하는데, Hot-shard가 정상적으로 움직이기 위해 샤드 분리를 해준다. 예를 들어, 샤드 2를 분리할 때, 샤드 3, 4를 만들고 새로운 데이터는 샤드 3, 4로 들어간다. 샤드 2의 데이터 보존기간이 끝나면 샤드 2가 지워진다.

#### Shard Merging

반대로 한 샤드로 적은 트래픽이 모이는 것을 Cold-shard가 되었다라고 하는데, Cold-shard 두개를 합쳐도 트래픽이 견딜만하다면 비용을 위해 샤드를 병합한다. 예를 들어, 샤드 1, 4가 Cold-shard 이면 둘을 합쳐서 -> 샤드 5로 새로 생성시킨다. 샤드 1, 4의 데이터 보존기간이 끝나면 샤드 1, 4가 지워진다.

주의 할 점은 샤드 3개 이상으로 병합이 불가능하다.

### Record

Producer의 레코드는 Partition Key(샤드 지정 키), Data Blob(진짜 데이터)로 구성되고, Consumer의 레코드는 Sequence No.(샤드안의 번호) / PartitionKey(샤드) / Data Blob(진짜 데이터)로 구성된다.

Data Blob은 1MB까지 제한이 있다.

### Producer & Consumer

Producer가 KDS에 Record를 보내고, Consumer가 Record를 polling한다.

#### Producer

SDK로 Producer를 만들 수 있고, Kinesis Producer Library, Kinesis Agent를 통해서도 만들 수 있다. Kinesis Producer Library은 SDK 기반 라이브러리이고 배치 처리, 압축, 재시도 같은 고급 API 기능을 사용할 수 있게 해준다. Kinesis Agent는 KPL을 기반으로 하고, log files를 모니터링하여 그것들을 stream에 사용 가능하게 한다.

PutRecordAPI를 써서 Produce하고 배치 PutRecordAPI를 사용하면 비용 감소와 처리량 향상가능하다. 샤드 배정은 Device Id가 Partition Key로 가고 해당 키는 Hash Function을 거쳐서 샤드에 배정한다. 즉, 같은 Partition Key는 같은 샤드로 간다.

KDS의 처리량 초과할 경우 3가지 방법이 있다.

- Hot Partition 피하게 Partition Key 알아서 잘 분리
- 샤드 분할 - 샤드를 늘려서 처리량 초과한 것 처리
- 지수백오프를 통해서 다시 시도하게 만들기

#### Consumer

SDK 혹은 Kinesis Client Library를 사용한다.

샤드당 하나의 인스턴스를 가지게 된다. 예를 들어, 샤드 4개, 인스턴스 2개 및 샤드 4개 인스턴스 4개는 가능하지만 샤드 4개 인스턴스 6개는 불가능하다.

기본 Fan-out Consuemr는 샤드당 2MB/s 라 컨슈머가 3개라면 처리량을 666KB/s 씩 가져간다. 지연율은 up to 200ms 이고, GetRecords API 호출은 5/sec이다.

Enhanced Fan-out Consumer는 샤드 당 Consumer 당 2MB/s라서 병렬 Consuming에 뛰어난 처리량을 보이고, 최대 5개의 Consumer를 가질 수 있다. 지연율은 up to 70ms 이고 HTTP/2를 사용하며 비용이 높다.

데이터 스트림당 Consumer의 최대 제한 수를 늘리고 싶다면 티켓으로 문의 가능하다.

람다는 Consumer로 10개까지 배치가능하고, 배치사이즈, 배치 윈도우를 지정하여 배치로 데이터 읽는다.

### Throttle

Producer는 샤드당 1MB/s, 1000MSG/s를 보낼 수 있고, Consumer는 샤드당 2MB/s를 받을 수 있다.

Enhanced Fan-out Consumer를 사용하게 되면, 샤드당 Consumer당 2MB/s를 받을 수 있다. 다른 Consumer와 처리량을 공유하지 않아도 되는 것이다.

### 수명주기

1 ~ 365일의 수명주기를 가진다. 기본적으로 데이터를 재처리, 반복할 수 있고, 삽입된 데이터는 수명주기가 끝날 때까지 삭제 불가하다.

### Capacity Modes

* Provisioned Mode - 시간당 샤드당 프로비져닝 된 돈을 낸다.
* On-demand Mode - 용량이 알아서 변경된다. 4/MB/s or 4000msg/s 이 기본 용량이고, 200MB/s or 200000msg/s 이 최대 용량이다. 30일 이전의 데이터를 기반으로 자동적으로 스케일링을 실행하며, 스트림 1시간당 비용 및 GB당 data in/out 비용을 내서 Provisioned Mode와 요금체제가 다르다.

### 기타

#### 보안

- HTTPS
- KMS
- IAM Policies
- VPC endpoint

<br/>

## Kinesis Data Firehose

1MB 이하의 레코드가 들어와서 Lambda Function 작업 후, 레코드가 보내진다. 레코드 도착지는 S3, Redshift(S3를 통해서 한 번 더 가공), ES, 서드 파티, HTTP EndPoint 이다.

거의 리얼타임(버퍼 업데이트 60초)을 자랑하고 자동 스케일링을 지원한다. 하지만 데이터를 저장하지 않기에 다시 데이터를 불러올 수 있는 기능이 없다. 그렇기 때문에 파이어호스 과정의 데이터를 S3 버킷에 백업할 수 있다. 모든 레코드 혹은 실패한 레코드를 S3 버킷에 백업 할 수 있는 설정을 한다.

<br/>

## Kinesis Data Analysis

리얼타임 서비스이며, 자동적으로 스케일링을 해준다. 시계열 데이터 분석, 실시간 대시보드, 실시간 메트릭 등에 쓰이며, 스트림소스를 통해 데이터를 받아서 SQL로 데이터 분석해서 새로운 데이터스트림으로 옮겨주게 된다.

<br/>
