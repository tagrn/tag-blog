---
sidebar_position: 11
description: AWS에서 사용하는 도커
---

# ECR&ECS

:::note
ECS는 Elastic Container Service의 약자이고, 도커 컨테이너를 관리하는 기술이다.
ECR은 Elastic Container Registry이고 AWS의 독자적인 DockerHub이다.
:::

<br/>

## 클러스터 타입

### EC2 Launch Type

EC2에 컨테이너를 올리고, 관리한다. 그 때문에 EC2를 관리하는 일까지 있다.

EC2 Instance Profile을 설정해서 EC2를 올리고, EC2 Task Role를 정해줘야 한다. EC2 Task Role를 정하는 이유는 각 롤 별로 서비스에 접근할 수 있는 권한이 다르기 때문이다.

### Fargate Launch Type

서버리스 개념으로 서버가 어떤 건지 상관안해도 되고 태스크 별로 움직이기 때문에 도커 컨테이너만 관리하면 된다.

주의점으로는 CLB는 Fargate와 같이 사용불가한 것이랑 FSx For Lustre 지원을 하지 않는다. 또, S3 버킷으로 마운팅 불가하기 때문에 Fargate + EFS로 잘 사용한다.

<br/>

## ASG

CPU 사용률, 메모리 사용률, 타겟당 요청 수 등을 가지고 오토 스케일링을 한다. 예전에 배운대로 타겟 트래킹, 스텝 스캐일링, 스케줄링 스케일링을 지원한다.

- 타겟 트래킹 - 타겟의 베이직 클라우드와치 메트릭
- 스텝 스캐일링 - 클라우드 와치 알람
- 스케줄링 스케일링 - 시간에 따라서(예측)

### EC2 Launch Type일 경우

씨피유 베이스해서 EC2 추가하는 기능이 있다. Cluster Capacity Provider을 통해 새 태스크에 EC2의 용량이 부족하면 오토스케일링할 수 있다. 또한, RAM 및 CPU 모자랄 때 오토스케일링을 할 수 있다.

<br/>

## Rolling Update

현재 실행중인 리소스를 100으로 친다.

예를 들어,

```
minimum healthy percent - 100
maximum percent - 200
```

이면 새로운거 다생기고 예전 버전 다 지워버리는 방법이다.

```
minimum healthy percent - 50
maximum percent - 100
```

이면 현재 리소스의 50%를 지우고 새 버전 50%를 생성하고 다시 이전 버전 50%를 지우고 새 버전 50%를 생성하여 새 버전으로 갈아끼운다.

<br/>

## 포트 연결

### EC2 Launch Type

ALB가 ECS랑 연결되어 있으면 EC2 인스턴스에 있는 포트가 자동적으로 연결된다. 이건 ALB에만 가능하고 다른 ELB에는 불가하다. 근데 어느 포트로 될지 모르니까 ALB한테 모든 포트를 열어줘야 한다.

### Fargate Launch Type

각각의 Task는 private IP를 가진다. 각 타스크가 IP가 달라서 같은 포트로 연결가능하다.

<br/>

## 환경변수

SSM Parameter Store와 Secrets Manager을 통해서 환경변수 설정이 가능하다. 또한, S3로도 파일을 통한 벌크 로딩으로 환경변수 설정이 가능하다.

<br/>

## Volume

EC2 타입은 EC2 인스턴스의 수명까지 공유 Data Volume 가능하고, Fargate는 20 ~ 200GB 스토리지가 있다. 볼륨 서비스는 사이드 카 컨테이너를 위해서 잘 사용한다. (대표적으로 로깅)

<br/>

## EC2 타입 컨테이너 배치

3개의 EC2인스턴스가 있고, 새 컨테이너를 넣을려면 어디에 넣을지 생각해야 한다. 그게 태스크 배치 프로세스이다.

태스크 배치 프로세스는 다음과 같다.

1. 태스크 정의 내에서 CPU, 메모리, 포트조건을 만족하는 인스턴스를 찾음.
2. 배치 제한과 배치 전략을 따짐. 그 후 배치

### 전략

- Binpack - CPU, 메모리가 제일 많이 남는 곳에 배치, 비용 절감가능
- Random - 무작위로 배치
- Spread - instance ID나 AZ나 이런것들로 기준을 세워서 분산 배치

### 제한

- distinctInstance - 한 인스턴스에 한 태스크만 가능
- memberOf - 인스턴스 표현식에 맞는 것만 가능(ex. 인스턴스 t2에만 컨테이너 배치)

<br/>

## ECR 특징

도커 허브와 거의 유사하다. 프라이빗 이미지와 퍼블릭 이미지를 생성 가능하다. 이미지는 백그라운드로 S3에 저장되고, 이미지 취약점 스캐닝, 버저닝 ,태그, 수명주기확인을 지원한다. ECR은 도커 명령어로 관리 가능한데, 먼저 ECR과의 연결을 해야한다.

`$(aws ecr get-login --no-include-email --region {region})`로 바로 연결 가능하다.

<br/>
