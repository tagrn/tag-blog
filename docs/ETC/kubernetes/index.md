---
description: Kubernetes(k8s)을 알아보자.
---

# Kubernetes

### 쿠버네티스란?
- 컨테이너화된 애플리케이션의 배포, 확장, 관리를 자동화하는 오픈소스 컨테이너 오케스트레이션 플랫폼.
- 수많은 서버에 걸쳐 있는 컨테이너의 수동 관리 과정을 자동화하여 분산 시스템 운영을 단순화함.


### 쿠버네티스 CICD - Pull 방식

<img width="944" height="575" alt="image" src="https://github.com/user-attachments/assets/6626a9bc-f68c-4e4c-b52a-729957d46ebc" />

Desired을 Current로 변경하려고 한다. 해당 부분은 Image Updater가 변경/감지하고 Operator가 동기화하게 끔 만든다.

보통 CICD를 통해서 배포를 진행함.


### 컨테이너

<img width="828" height="403" alt="image" src="https://github.com/user-attachments/assets/54d5d1ae-d32f-44b4-bf5a-bded6289fbe6" />

Host OS의 커널을 공유하기 때문에 게스트 OS가 필요없음.

또한, 프로세스, 파일시스템, 네트워크 등도 공간분리가 되어 있으므로 독립성을 가질 수 있다.

다른 장점으로는 이식성이 있다. 표준화, 규격화된 컨테이너는 이미지를 통해 생성, 이동이 손쉽게 이루어진다.


### 진행중...
