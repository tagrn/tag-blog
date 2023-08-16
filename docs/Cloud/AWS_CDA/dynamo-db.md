---
sidebar_position: 8
description: AWS에서 제공하는 비관계형 DB
---

# Dynamo DB

:::note
AWS의 비관계형 DB이다. 수평적 확장에 매우 좋고, 고가용성의 NoSQL이라고 보면 된다.

해당 서비스는 RDS랑 완전히 다르게 대규모 워크로드로 확장되고 완벽하게 분산된다. 초당 100만 요청 처리할 수 있고, 100TB 스토리지를 갖는다. 매우 빠르고 일관성있으며, 검색 시 지연시간 짧다. 잘 쓰면 비용이 저렴하고, 오토스케일링도 가능하다. Standard 스토리지와 Infrequent Access Class 스토리지가 있어서 비용측면에서 절약도 가능하다.
:::

<br/>

## Table

테이블은 행을 무한대로 가질 수 있고, 행은 속성을 가지며, 속성은 중복 될 수 있다. 각 행의 최대 사이즈는 400KB이고, 다양한 자료구조를 지원한다.

기본키에는 단일 PK(simple key)와 복합 PK(composite key) 두 가지 종류가 존재한다. 복합 키를 쓸 때, 4개의 컬럼 어트리뷰트가 있으면 partitionKey + sortKey를 합쳐서 기본 키로 쓰게 되는데, 파티션 키는 카디널리티가 높은 것으로 골라야 한다. 복합 키라 파티션 키의 중복은 가능하다. 속성은 계속 추가할 수 있고, 무조건 널러블이라고 생각하면 된다.

TTL attribute를 설정해서 자동 삭제하게 할 수 있다.

<br/>

## Read/Write Capacity

두 모드가 있고, 변경 시 24시간마다 가능하다.

* 프로비저닝 모드 - 초당 몇개까지 가능하게 할 건지 먼저 정한다.
* 온디맨드 - 알아서 되는데, 프로비저닝보다 많이 비싸다.

### 프로비저닝 모드

오토스케일링 옵션을 해놓으면 뭘 쓰든 상관없다. 민, 맥스, 타겟(평균 - 퍼센트로 지정)

버스트 용량을 일시적으로 사용할 수 있는데, 만약 버스트 용량도 다 사용하면 프로비저닝 처리량 초과 Exception이 뜬다. 이게 발생하면 지수 백오프 전략으로 읽기, 쓰기가 진행되게 된다.

:::info
RCU / WCU - 읽기, 쓰기 처리량을 뜻한다.
:::

#### WCU

**1KB/1s당 1 unit**이다. 2KB 초당 보내면 2 unit을 쓰게 된다. 즉, n KB * n 초 만큼이 Capacity라는 말이다. 소수점이 나올 때는 올림으로 계산한다. 예를 들어, 4.3 이면 5로 올림계산된다.

#### RCU

읽기는 두가지 모드가 있다.

* **Strongly Consistent Read** - 이것은 무조건 최신의 데이터를 얻을 수 있게 만든다. - Consitent Read라는 파라미터로 같이 요청 가능 - 하지만 RCU를 2개 씀.
* **Eventually Consistent Read** - 복제가 안 일어나서 오래된 데이터를 얻을 수 있다. (100ms 이후면 최신 데이터가 나오기 때문에 거의 상관없긴 하다)

RCU는 최대 **4n KB * (n(strongly Consistent) or n/2(eventually Consistent))**이다. 이것도 올림계산이다. 예를 들어, 7KB 초당 4개씩 보내면 strongly Consistent는 8 unit이 필요하고, eventually Consistent는 4 unit이 필요하다.

<br/>

## Hot Partition

Hot Partition, Hot Key는 해당 파티션과 키만 너무 호출이 많을 때를 뜻한다. 이런 Hot Partition, Hot Key이 일어나거나 너무 큰 데이터를 읽을 땐, 지수 백오프 전략을 사용하거나 파티션 키를 분산시켜야 한다.

그리고 한 파티션이나, 한 아이템만 너무 읽은 경우, DynamoDB Accelerator (DAX) 사용하면 좋다. 이것도 RRU / WRU 기반인데, 2.5배 정도 비싸다.

<br/>

## API

* PutItem: 새로운 아이템이 만들어지거나 기존 것을 대체
* UpdateItem: 새로운 아이템을 만들거나 기존 것을 수정함. Atomic Counters와 같이 사용가능
* ConditionalWrite: 조건이 충족될 때만 쓰기, 업데이트 삭제만 허용하며 동시 엑세스를 지원
* GetItem: 기본 키를 기반으로 읽음. 읽기 방법(SCR, ECR)을 선택하여, ProjectionExpression을 통해서 원하는 속성만 가져올 수 있다.
* Query: KeyConditionExpression - Partition Key가 필수 Sort Key로 =, <, <= 등 연산 지원
* FilterExpression - 데이터가 반환되기 이전에 필터링한다. 키속성을 통해서 필터링하며, Sort, Partition Key로 불가하다.
* Returns - Limit으로 갯수 제한, 1MB 제한 / 페이지네이션으로 페이징 처리 가능
* Scan: 전체 테이블을 읽음. 데이터를 필터링하는 것은 클라이언트에서 해야한다. 최대 1MB이며, 페이징 처리로 읽는다. 전체 테이블을 읽기 때문에 RCU가 많이 쓰이고, Expression을 사용해서 필터, 조건 을 걸 수 있지만, RCU 사용은 똑같다. 더 빨리 읽기 위해서는 병렬 스캔 사용할 수 있다. 그러므로 잦은 Scan 호출은 비용증가의 주범이다.
* DeleteItem: 조건부 삭제 가능
* DeleteTable: 그냥 테이블을 드롭해버리므로 삭제 빠름

### API Batch 

호출 수를 줄이기 위한 배치 기능이다.

#### BatchWriteItem

Update는 배치 불가하다. Put, Delete: 한 번에 25개 / 16MB 제한이며, 각 데이터는 400KB 제한이 있다.

#### BatchGetItem

한 번에 100개 / 16MB 제한이며, 지연시간을 줄이기 위해 병렬로 검색된다.

<br/>

## PartiQL

DyamoDB를 SQL로 사용하게 해주는 것이며, 배치도 지원한다.

<br/>

## Index

### LSI

테이블 당 5개 생성 가능한데, 테이블 생성 전에만 설정할 수 있다. 조금은 다르지만, SortKey를 더 추가한다고 생각하면 된다. LSI는 main 테이블 WCU / RCU를 따라간다.

### GSI

대체 기본키를 가지는 것이다. 테이블 생성 후에도 설정가능하며, 거의 새로운 테이블을 생성하는 것나 마찬가지이다. 완전히 새로운 데이터 쿼리를 만들 수 있는 것이므로 완전 빨라진다.

GSI가 Throttle 되면 main table도 Throttle 되기 때문에 GSI의 WCU / RCU를 잘 설정해 줘야 한다. GSI는 비용 추가가 있다.

<br/>

## Optimistic Locking

ConditionalWrites가 있는데, 이 API가 어떤 조건에서만 쓰게 가능하게 하고 이게 바로 낙관적 잠금(Optimistic Locking)이다.

예를 들면, 한 로우가 Version 1로 되어 있는데, name을 속성을 바꾸려고 2가지 호출을 했다. 그러면 한 호출로 인해 Version 2가 되었을테니까, 다른 한 가지 호출은 Version 1 -> 2로 바꾸지 못 하여 실패한다.

<br/>

## WriteType

* 동시성 아예 배제 (Concurrent)
* 조건부 락 (Conditional)
* 락 안건 둘 다 성공 (Atomic)
* 배치 라이팅 (Batch)

<br/>

## DB 백업

1. AWS Data Pipeline 을 사용해서 EMR Cluster를 통해 S3에 데이터 넣어두고 Dynamo DB에 데이터 넣는 것.
2. 데이터 스캔해서 하나씩 카피하는 것
3. 테이블 백업해서 새로 생성하는 것 - 추천

<br/>

## DAX

DynamoDB의 인메모리 캐시이다. 클러스터에 노드로 구성되어있어서 클러스터당 최대 10개의 노드를 가질 수 있고, TTL 5분 기본 설정이다. MultiAZ를 위해 최소 3개 노드 권장한다.

### DAX vs elastic Cache 사용

개별적인 객체 캐시에는 DAX, 어플리케이션 로직적으로 쓸 Aggragation 객체는 Elastic Cache (변형 데이터)를 사용하라고 한다. - ~~이건 경험해보지 못 해서 장담하진 못 하겠다.~~

<br/>

## Streams

table의 아이템 레벨이 CUD 될 때 레코드가 생기는데, 이 레코드를 가지고 여러작업 가능하다. 최대 24시간 수명주기를 가지며, 배치 폴링도 가능하다.

DynamoDB의 모든 수정사항이 Streams에 담긴다고 생각하면 된다. 또한, 스트림에 표시할 데이터를 선택할 수 있다.

* KEYS_ONLY - 수정된 아이템의 키만 보여줌
* NEW_IMAGE - 수정된 아이템의 현재 모습
* OLD_IMAGE - 수정된 아이템의 이전 모습
* NEW_AND_OLD_IMAGES - 이전, 현재 전체 데이터

<br/>

## CLI 옵션

```bash
--projection-expression #하나이상의 속성 가져오게 하기 select
--filter-expression #아이템 필터링
--expression-attribure-values #클라이언트 상의 아이템 필터링 (정렬키가 지정 안되어 있을 때 사용)
--page-size #디폴트 1000개
--max-items #페이지네이션으로 보여줄 총 갯수의 제한 설정
--starting-token #현재 페이지를 마킹하는 토큰
```

<br/>

## 기타

* 세션모드로 DynamoDB를 쓸 수 있다.
* 트랜잭션은 2배의 코스트를 먹는다.
  * 3 Transaction Write(5KB) / s = 30 WCUs 필요
  * 5 Transaction Read(5KB) / s = 20 RCUs 필요

<br/>