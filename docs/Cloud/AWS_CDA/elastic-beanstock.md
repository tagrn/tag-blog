---
sidebar_position: 12
description: 소규모 서비스 배포 자동화 툴
---


# Elastic Beanstock

:::note
> **공식문서 내용**
>
> Elastic Beanstalk를 사용하면 애플리케이션을 실행하는 인프라에 대해 자세히 알지 못해도 AWS 클라우드에서 애플리케이션을 신속하게 배포하고 관리할 수 있습니다. Elastic Beanstalk를 사용하면 선택 또는 제어에 대한 제한 없이 관리 복잡성을 줄일 수 있습니다. 애플리케이션을 업로드하기만 하면 Elastic Beanstalk에서 용량 프로비저닝, 로드 밸런싱, 조정, 애플리케이션 상태 모니터링에 대한 세부 정보를 자동으로 처리합니다.
>
> 참고 - https://docs.aws.amazon.com/ko_kr/elasticbeanstalk/latest/dg/Welcome.html

자동화의 끝판왕까진 아니고 중간보스라고 할 수 있는 녀석이다. 로드밸런서, EC2 등이 있는 클래식한 서버티어와 EC2 직접접근 요청이 없이 SQS를 사용해서 EC2가 polling하는 워커티어로 나뉘며, 설정 한 번으로 어플리케이션에 필요한 거의 모든 것을 제공해준다. 자동화의 끝판왕인 CloudFormation 기반으로 움직이기 때문에 좀 더 자세한 설정을 하고 싶다면 CloudFormation을 사용하면 된다. 

주의 할 점은 빈스톡 설정하면 한 번에 다 생성해주지만 커스텀으로 뭔갈 하기 어렵다는 점이며, 빈스톡으로 RDS 설정 시, RDS를 꼭 분리해야 하며 분리 안하고 빈스톡을 삭제하면 RDS가 같이 삭제된다. 또한, 빈스톡에서 로드밸런서 생성 시, 로드밸런서 다른 유형으로 변경 불가하다.
:::

## 배포모드

### All at once

모든 애플리케이션을 한 번에 배포하는 것이다. 가장 빠르지만, 잠시동안은 트래픽을 받아낼 수 없다. 서버를 모두 정지시키고 다음 버전을 생성하게 되어 다운 타임이 있고, 추가비용은 없다.



### Rolling

어플리케이션 하나씩 업데이트 하는 것이다. 그래서 서버는 가용성은 떨어지지만 계속 정상이다.

몇 개만 정지시키고 새 버전으로 변경한 다음, 정상이 되면 다시 다른 몇개를 정지시키고 새 버전으로 변경하면서 모두 변경시킨다. 비용 추가가 없지만, 배포시간이 오래걸리며, 이전 버전과 새 버전이 동시에 살아 있을 때가 있다.



### Rolling with additional batches

새 인스턴스를 만들어서 롤링하는 방식이다.

새 인스턴스를 더 배포해서 정상이 되면 예전 버전을 삭제 시키는 롤링 작업이다. 비용 추가가 있고, 배포시간이 오래걸리며, 이전 버전과 새 버전이 동시에 살아 있을 때가 있다.



### Immutable

새 버전을 생성해서 다 정상일 때 ASG를 변경해버리는 방식이다. 즉, 새로 모든 것을 다 만든다음 갈아끼우는 방식이며, 변경될 때 비용이 두 배로 든다.

새로운 ASG(temp)를 얻고, 그 ASG에서 Current ASG로 인스턴스를 이동시킨다. 배포에 실패한 경우 바로 롤백 가능하고, 비용지불이 괜찮다면 production으로 괜찮은 방법이다.



### Blue/Green

또 다른 EB(Elastic Beanstalk)로 새로운 환경을 만들어서 준비가되면 생성시켜서 테스트 해본다. Route 53 가중치 정책을 통해서 blue에 90% 주고 green에 10% 준다. 그리고 잘 동작하면 그린으로 변경해버리는 방식이다.


### Traffic Splitting

카나리 테스트(Canary Testing)라고 한다. 새로운 ASG를 만들어서 Blue/Green처럼 테스트한다. ALB가 새로운 ASG를 모니터링해서 이게 이상하면 이전 버전으로 롤백하고 안정적이면 새로운 ASG로 연결해준다. Blue/Green은 수동이지만 이건 자동이다.

<br/>

## 수명관리

1000개의 버전이 저장 가능하고, 1000개가 가득 찬 경우, 이전 버전을 삭제하지 않으면 배포할 수 없다. 그래서 빈스톡 수명 주기 정책을 사용한다.

* 선택 가능한 수명주기 정책
  * 버전이 너무 많으면 이전 버전 삭제
  * 이전 버전 생성된 시간에 따라 삭제

현재 버전은 삭제되지 않으며, 소스 번들을 S3에 남길것인가 아니면 영구삭제할 것인가에 대해 선택할 수 있는 예방정책있다.

<br/>

## 확장

YAML, JSON 파일을 .config 파일로 확장자를 변경해서 .ebextensions/ 디렉토리에 올리면 UI에 있던 것들의 설정들을 파일로 설정가능하다. 파일을 설정해서 올렸을 때, AWS Console에 해당 파일대로 설정되어 있는 것을 확인할 수 있다.

즉, .ebextensions/ 의 파일에서 AWS 상의 모든 서비스를 원하는 것들을 모두 설정할 수 있다는 것이다.

<br/>

## 복제 

프로덕션 버전을 test 버전으로 배포할 때 유용하게 쓰인다.

모든 서비스를 유지하는데, RDS는 구성만 유지하고 데이터는 유지되지 않는다.

<br/>

## 마이그레이션

ELB 유형은 못 바꾸고 구성만 바꿀 수 있다. 바꾸려면 마이그레이션을 해야하는데, 하는 방법은 다음과 같다.

1. ELB 구성 빼고 같은 구성으로 EB를 만듬.
2. ELB 구성 바꾸고 Route53에서 CNAME으로 주소를 스왑함.
3. 이전 것은 지움.

RDS의 수명주기가 빈스톡이랑 붙어있어서 프로덕션 환경에는 불리하다. 그러므로 RDS는 분리시켜야하는데, EB와 RDS랑 분리하는 방법은 다음과 같다.

1. RDS의 스냅샷을 생성함.(백업)
2. RDS 콘솔에서 어떤 상황에서든 삭제되지 않는 것으로 설정.
3. 새로운 EB를 만들고 그 RDS를 지정.
4. 새로운 EB로 CNAME 스왑을 함.
5. 이전 것은 지움.

<br/>

## 커스텀 플랫폼

언어나 도커를 지원하지 않는 환경과 튜닝된 플랫폼을 위해 만들어졌다. Platform.yaml 파일이 필요하고 Packer software을 사용하여 AMI를 만든다.

<br/>

## HTTPS

콘솔로 SSL 인증서를 올리거나 .ebextensions/securelistenser-alb.config에 넣어주면 된다. ACM(AWS Certificate Manager)에서 매니징할 수 있다.

<br/>