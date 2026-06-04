---
description: Kubernetes(k8s)을 알아보자.
---

# Kubernetes

### 쿠버네티스란?

- 컨테이너화된 애플리케이션의 배포, 확장, 관리를 자동화하는 오픈소스 컨테이너 오케스트레이션 플랫폼.
- 수많은 서버에 걸쳐 있는 컨테이너의 수동 관리 과정을 자동화하여 분산 시스템 운영을 단순화함.


### 쿠버네티스 CICD - Pull 방식

- Image Updater가 Git or DockerHub 등의 Repository를 바라보면서 코드가 변경될 때, k8s가 바라보는 Repository에 동기화 시킨다.
- k8s는 Current를 Desired(k8s가 바라보는 Repository)로 동기화시키려고 하고 이 때, Operator가 나서서 Current를 동기화한다.
- 보통 CICD를 통해서 배포를 진행함.


### 컨테이너

<img width="828" height="403" alt="image" caption="sds" src="https://github.com/user-attachments/assets/54d5d1ae-d32f-44b4-bf5a-bded6289fbe6" />

- Host OS의 커널을 공유하기 때문에 게스트 OS가 필요없음.
- 또한, 프로세스, 파일시스템, 네트워크 등도 공간분리가 되어 있으므로 독립성을 가질 수 있다.
- 다른 장점으로는 이식성이 있다. 표준화, 규격화된 컨테이너는 이미지를 통해 생성, 이동이 손쉽게 이루어진다.


### k8s 리소스

- k8s는 여러개의 node 가짐
- node는 여러개의 pod 가짐
- pod는 여러개의 container 가짐
- pdb는 최소가용성 설정
- VPA,HPA는 수직,수평 오토스케일링 설정
- DaemonSet은 노드당 하나의 DaemonSet Pod(모니터링, 관리 등) 만들어줌
- StatefulSet은 영구적 데이터를 저장함(볼륨연결정보 등)
- Job은 CronJob 같은 거



### 구성

- Service는 로드밸런서와 같은 역할을 해줌(타입에 따라 기능이 상이함 - nordport, ClusterIP, LB)
- Ingress Controller <- 이걸 ALB(L7)로 만들고 안에 Service 는 nordport로 하는게 대부분 이상적.
- 외부 인터넷 망과 연결하는거는 NLB 이용해서 L4를 통해 연결하는게 바람직 함.
- 쿠버네티스는 인증을 혼자서 하지 않는다. 다른 인증시스템과 연동하여 인가를 지원한다.
