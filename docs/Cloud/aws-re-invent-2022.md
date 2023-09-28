---
description: AWS Re:Invent 동영상 2개 요약
---

# AWS re:invent 2022

## Accelerating innovation with serverless on AWS 

### Info.

4 Sections / 3 Presentors / Running Time: 51m

[유튜브 동영상 보기](https://www.youtube.com/watch?v=7bY-YH70h8g)

### Summary

**Section 1: Serverless in 2022 - Holly Mesrobian**

* Serverless 진화의 역사
* AWS Serverless 를 사용하는 기업
* Serverless 서비스 소개
* Serverless 마이그레이션

**Section 2: The LEGO Group - Sheen Brisals**

* LEGO Group 의 AWS Serverless 변화 과정
* AWS Serverless Architecture 소개
* AWS Serverless 마이그레이션 후, 여러 장점
* 과정을 통해 배운 점들

**Section 3: Continuous innocation across the stack - Holly Mesrobian**

* Lambda 에 SnapStart 를 통해 Cold Start 시간을 90% 로 줄임
* AWS Fargate tasks 의 최대 성능 향상
  * Up to 16 vCPUs
  * Up to Memory 120 GiB
  * 500 tasks in 1 Minute
  * per service, x16 faster
* Security 문제를 AWS 에서 관리
  * Log4j 보안 문제를 빠르게 해결한 것을 예로 들음.
* Amazon Inspector를 Lambda 에서 사용 가능
* ECS Service Connect 새로 생김
  * Mesh up 구조나 새로운 네트워크 인터페이스 없이 여러 서비스 연결가능

**Section 4: Vercel - Guillermo Rauch**

* Next.js 를 만든 팀에서 만든 Serverless 프론트 배포 서비스
* Svelte, Webpack, Babel 등에 지원 중
* 배포 쪽으로 AWS Serverless 서비스를 사용하고 있음
* 자기네 프로덕트와 팀 자랑

<br/>

## Keynote with Dr. Werner Vogels

### Info.

5 Sections / 3 Presentors / Running Time: 1h 53m

인트로로 Synchronizing 한 매우 비효율적인 세계를 보여줌. Asynchronizing의 중요성을 각인. 매트릭스 패러디를 했고 매우 재밌음.

[유튜브 동영상 보기](https://www.youtube.com/watch?v=RfvL_423a-I)

### Summary

**Section 1: Keynote - Dr. Werner Vogels**

* S3의 Principle 을 소개
  * Concurrency, Parallelism, Asynchorny 를 강조
* 세계는 Synchronous 으로 보이지만, Pure Asynchronous 세계이다.
* Loosely coupled components 를 강조
* 여러 workflow pattern 을 통해서 Asynchronous 서비스를 gathering 할 수 있다.
  * Sequence, Retry, Error Handling, Parallel, Based on data, Concurrent, iterative
  * AWS EventBridge, Step Function을 통해서 지원
* 대규모 데이터 병렬처리 할 수 있는 서비스 Step Function Distributed Map 가 나옴.
  * [AWS 블로그 글 보기](https://aws.amazon.com/ko/blogs/korea/step-functions-distributed-map-a-serverless-solution-for-large-scale-parallel-data-processing/)
* EventDriven Architecture 소개
  * Point-to-Point, Publish/subscribe, Event streaming
  * EventBridge는 3가지 모두 지원
  * EventBus 를 통해 움직임
  * Gall's Law에도 적합함
* AWS Application Composer
  * Visualizing 한 서비스 연결을 지원하는 대시보드 생성 가능
  * 해당 대시보드에서 쉽고 빠르게 서비스 배포 가능
* Events are composable - ex. pipes of Unix
* Amazon EventBridge Pipes
  * pipe 의 장점을 가져와, 여러 이벤트를 파이프로 이어줌(Built-in filtering)
  * 확실한 비용 감소를 보여줄 수 있음.

**Section 2: Guest Speaker - Angela Timofte of Trustpilot**

* Trustpilot - 190,000,000,000+ reviews가 존재하는 리뷰 모음 서비스
* 예상하지 못하는 트래픽 및 증가하는 트래픽을 AWS Serverelss 서비스로 잘 대응하였다.
  * Event Driven 구조 사용
  * SNS, SQS, Lambda, Kinesis 등 많은 서비스 사용
  * DynamoDB의 유연한 확장성

**Section 3: Keynote - Dr. Werner Vogels 이어서 진행**

* AWS Heros 소개(https://aws.amazon.com/heroes)
* dynamo DB를 예시로 들며, Event-driven architecture 강조
* AWS CodeCatalyst 출시, 통합 청사진을 지원한다고 함.
  * https://codecatalyst.aws/explore
* 세상은 다차원적이기 때문에 2D에서 3D를 보여줄 수 있는 것이 중요함.
  * 3D를 만들기 위해 엄청난 양의 사진이 필요없이, NRF를 통해서 12장의 사진만 있으면 3D를 보여줄 수 있음.
  * 비디오로 3D를 보여줄 수 있는 기술이 필요하며, 자율주행에도 이러한 기술들이 필요함. O3DE도 같이 소개.
  * AWS IoT TwinMaker는 물리적인 환경을 가상환경으로 변경하여 3D 모델로 보여주는 역할을 해줌.

**Section 4: Guest Speaker - Nathan Thomas(VP, Unreal Engine, Epic Games)**

* 3가지 서비스가 AWS 에서 돌아가고 있다. 매우 큰 용량의 인스턴스를 사용하고 있고, 비용이 많이 드는 중.
  * Meta Human - 3D 휴먼 만드는 도구
  * Twin Motion -  Unreal Engine 기반 손쉬운 3D 시각화 도구
  * Reality Scan - 실제 사물을 카메라를 통해 3D 모델로 만듬
* The Metrix Awakens 라는 비디오 게임을 만든 이유는 한계를 뛰어넘기 위해, 그리고 뛰어넘을 예정

**Section 5: Keynote - Dr. Werner Vogels 이어서 진행**

* AWS Ambit Scenario Designer
  * 3D content 를 규모에 맞게 생성하여 수 천가지의 시뮬레이션해 볼 수 있다.
* Experiment, measure, learn - 제프 베조스의 메세지에서 가져옴.
* 시뮬레이션을 강조 - 로마, 레오나르도 다빈치, 폰 노이만과 울람 등의 예시를 듬.
* 2000년대의 시뮬레이션은 하드웨어에 제한되었다. 하지만? AWS를 쓴다면?
* 실생활에서 못하는 시뮬레이션을  AWS SimSpace Weaver에서 할 수 있다.
  * ~~영화 만델라이펙트가 생각나는 씬 이었음...~~
  * 해당 시뮬레이션 시스템은 각 셀(병렬 메모리)에서 일어나고 이를 모두 이을 수 있다.
* 퀀텀비트는 시뮬레이션의 혁신을 가져오고, 모든 걸 가능하게 해준다.
* 모든 걸 시뮬레이션해서 큰 도약을 꿈꿔라.

<br/>
