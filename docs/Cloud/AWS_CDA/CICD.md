---
sidebar_position: 2
description: AWS에서 제공하는 CI/CD 서비스 종류와 기능
---

# CI/CD

## CodeCommit

일종의 GitHub이다. 코드가 중앙 레파지토리에 동기화되고, 백업, 롤백 모두 다 된다.

AWS CodeCommit 은 AWS의 개인 레파지토리가 생긴다. 레파지토리 크기도 제한없고, 제한에 걸리면 AWS에 문의하면 된다. 완전 관리형에 가용성, 보안성이 높고 형식도 일관되게 가져간다. AWS Cloud Acount내에서 코드가 관리(즉, IAM 유저를 잘 사용하라는 말)된다.

깃 커멘드라인을 사용할 수 있는데, ECR과 마찬가지로 계정 확인이 필요하다. 인증은 IAM 폴리시를 통해서 관리한다. AWS KMS를 통해서 암호화 전송을 지원한다. IAM를 통해서 자격을 나누면 된다.

<br />

## CodeBuild

기본 언어나 docker가 지원된다. 코드빌드 컨테이너가 buildspec.yml를 불러와서 안의 명령을 실행한다. buildspec.yml 파일은 코드의 루트에 있어야한다. S3 캐싱하는 옵션이 있다. 빌드를 다하면 S3에 아티팩트를 전달하고, 로그는 Cloud Watch Logs나 S3에 남긴다.

원래는 VPC 밖에서 빌드하지만 VPC가 필요한 여러 서비스들이랑 연결해서 빌드해야하는 경우, VPC 안에서도 빌드하기도 한다. 딥한 트러블 슈팅을 위해 로컬에서도 빌드하기도 한다.

### buildspec.yml

```
version: 0.2

run-as: Linux-user-name

env:
  shell: shell-tag
  variables:
    key: "value"
    key: "value"
  parameter-store:
    key: "value"
    key: "value"
  exported-variables:
    - variable
    - variable
  secrets-manager:
    key: secret-id:json-key:version-stage:version-id
  git-credential-helper: no | yes

proxy:
  upload-artifacts: no | yes
  logs: no | yes

batch:
  fast-fail: false | true
  # build-list:
  # build-matrix:
  # build-graph:

phases:
  install:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    runtime-versions:
      runtime: version
      runtime: version
    commands:
      - command
      - command
    finally:
      - command
      - command
  pre_build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
      - command
    finally:
      - command
      - command
  build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
      - command
    finally:
      - command
      - command
  post_build:
    run-as: Linux-user-name
    on-failure: ABORT | CONTINUE
    commands:
      - command
      - command
    finally:
      - command
      - command
reports:
  report-group-name-or-arn:
    files:
      - location
      - location
    base-directory: location
    discard-paths: no | yes
    file-format: report-format
artifacts:
  files:
    - location
    - location
  name: artifact-name
  discard-paths: no | yes
  base-directory: location
  exclude-paths: excluded paths
  enable-symlinks: no | yes
  s3-prefix: prefix
  secondary-artifacts:
    artifactIdentifier:
      files:
        - location
        - location
      name: secondary-artifact-name
      discard-paths: no | yes
      base-directory: location
    artifactIdentifier:
      files:
        - location
        - location
      discard-paths: no | yes
      base-directory: location
cache:
  paths:
    - path
    - path
```

위의 모든 것을 사용하진 않고, 자주 사용하는 것들에 대한 설명은 밑에 있다.

- env - 환경변수
  - variables - 평문 변수
  - parameter-store - AWS parameter-store에서 가져옴.
  - secrets-manager - AWS secrets-manager에서 가져옴.
- phases: 단계를 설정함.
  - install - 디펜던시 필요한 것들 설치
  - pre-build - 빌드 전 필요한 명령
  - build - 빌드에 필요한 명령
  - post-build - 빌드 후 필요한 명령
  - artifacts.files: 어떤 파일을 S3에 보낼지
- cache
  - paths: 빌드 속도 개선을 위해 S3에 캐시할 것들

:::tip
 자세한 내용은 [공식문서](https://docs.aws.amazon.com/ko_kr/codebuild/latest/userguide/build-spec-ref.html) 참고
:::

<br />

## CodeDeploy

CodeBuild와 마찬가지로 CodeDeploy가 어떻게 배포할 지 정해놓는 appspec.yml 파일이 있다.

CodeDeploy를 사용하기 위해서는 밑과 같은 것들이 필요하다.

- 어플리케이션
- 컴퓨트 플랫폼 (EC2, ECS, 람다, 온프레)
- 배포 설정 (배포 실패 성공의 룰)
- 배포 그룹 (이씨투 태그) - 옵션
- 배포 타입 (인플레이스, 블루/그린) - EC2/온프레미스는 무조건 인플레이스
- IAM 인스턴스 프로필 - EC2 인스턴스에 S3랑 깃허브 접근 허용
- 어플리케이션 리비전 - 어플리케이션 코드랑 appspec.yml
- 서비스 롤 - IAM 롤인데, 코드 디플로이가 EC2, ASGs, ELB를 운영할 권한
- 타겟 리비전 - 특정 그룹에게 배포 - 옵션

### appspec.yml

json으로도 작성할 수 있지만, yml이 더 편한 것 같다. 밑의 코드는 EC2/온프레미스 예시이다.

```
version: 0.0
os: linux

# S3/github에서 파일 복사
files:
  - source: Config/config.txt
    destination: /webapps/Config
  - source: source
    destination: /webapps/myApp

# 순서에 따른 디플로이
hooks:
  ApplicationStop:
  DownloadBundle:
  BeforeInstall:
  Install:
  AfterInstall:
  ApplicationStart:
  ValidateService: // 해당 배포가 잘 동작하는지 확인
    - timeout: 3600
    - location: Scripts/MonitoerService.sh
    - runas: codedeployuser
  BeforeAllowTraffic:
  AllowTraffic:
  AfterAllowTraffic:
```

위의 자주 사용하는 것들은 거의 이름에서 유추 가능하다.

:::tip
 자세한 내용과 ECS appspec.yml의 예시는 [공식문서](https://docs.aws.amazon.com/ko_kr/codebuild/latest/userguide/build-spec-ref.html) 참고
:::

### 배포 전략

- 한 번에 한 인스턴스만 stop 및 재배포
- 전체 반씩 재배포
- 한번에 모든 것 재배포
- 커스텀 - ??% 설정가능

실패하면 자동적 롤백하도록 설정가능하다. 롤백은 최근에 배포에 성공한 리비전을 다시 새로 배포하는 것이다. 이전 버전이 원래부터 살아있는게 아니니 주의하자.

배포 그룹은 EC2들이나 ASG / 태그랑 ASG를 섞은 것도 가능하고, 스크립트를 통해 환경변수로 설정도 가능하다.

<br />

## CodePipeline

AWS의 젠킨스이다. 소스를 가져와서 빌드하고 테스트 하고 배포한다. 아티팩트를 만들어서 S3 버킷에 저장하고 해당 아티팩트가 CodeBuild에서 빌드되어 만들어진 아티팩트를 S3에 저장 및 CodeDeploy로 전달하여 배포한다.

즉, 파이프라인 안에는 CodeCommit, CodeBuild, CodeDeploy, S3가 서로 상호작용한다.

<br />

## CodeStar

CI/CD에 관련된 모든 서비스를 합친 것이다. JIRA랑 Git Issue를 연결해서 이슈트래킹이 가능하다.

<br />

## CodeArtifact

퍼블릭 레파지토리를 프록시해서 VPC 안의 프라이빗 레파지토리를 만들어주고 그 레파지토리에서 AWS 사용자가 아티팩트를 가져가게 한다. 넥서스 같은 것이라 보면 된다. 소프트웨어 라이브러리 간의 종속성을 관리한다. 즉, Maven, Gradle, npm, pip 등의 라이브러리를 관리해준다.



<br />

## CodeGuru

머신러닝을 통해 자동화 코드 리뷰 및 성능 리뷰를 해준다.

#### CodeGuru Reviewer
정적분석 툴이다. 보안 취약점, 버그확인, 리소스 누수 찾기, 입력값 검증 등을 통해 자동화된 추론을 해준다. 그리고 머신러닝을 통해 계속 학습한다.

#### CodeGuru Profiler
비용 및 성능을 분석해서 분석 내용과 최적화할 수 있는 개선사항을 제공한다. 런타임에 확인할 수 있어, 동적이라고도 볼 수 있다. 이 서비스를 사용해서 코드 비효율성을 확인하고, 컴퓨팅 비용 낮추고, 어떤 오브젝트가 메모리 잘 차지하는지 확인할 수 있다.

<br />
