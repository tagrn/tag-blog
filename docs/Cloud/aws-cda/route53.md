---
sidebar_position: 17
description: Domain 관리 서비스
---

# Route53

:::note
Route53은 AWS의 DNS 서비스로 고가용성, 확장성을 갖추었고, DNS 레코드의 권한을 우리가 가지는 관리형 DNS이며, SLA 100%를 보장한다. 53이 붙은 이유는 DNS 기본 포트가 53이기 때문에 가져왔다고 한다.
:::

<br/>

## 레코드 요약

- 도메인/서브도메인네임: 인터넷에서 요청받을 이름 (test.com, www.test.com ...)
- 레코드 타입: Value 주소로 연결하는 타입 지정 (A, AAAA, NS, CNAME)
- Value: IP나 다른 서버의 주소 (10.0.0.1, aws.test.com ...)
- Routing Policy: 여러 전략 존재 (simple, weighted ...)
- TTL: 레코드가 DNS에 캐싱되는 시간 (300, 600, 3600 ...)

<br/>

## 레코드 타입

### A 타입

A 레코드 타입은 Alias의 약자로 설정한 도메인으로 요청이오면 Value로 설정한 IPv4의 주소로 연결시켜주는 것을 의미한다. 원래는 IP만 가능하지만, AWS 상에서는 A 타입으로도 내부 호스트 네임을 통해서 서비스들과 연결할 수 있다.

### AAAA 타입

AAAA 레코드 타입도 똑같이 Alias인데, IPv6의 주소라는 점만 다르다.

### NS 타입

NS 레코드는 호스팅 존에 연결함을 뜻한다. 그래서 도메인 등록하면 NS는 기본적으로 설정되어 있다.

### CNAME 타입

CNAME 레코드는 다른 호스트 네임을 매핑하고, 설정한 AAAA, A로도 요청을 연결시켜줄 수 있다. 하지만 서브 도메인만 지정가능하다. 즉, www.test.com으로 Value를 지정할 수 있지만 test.com으로 지정은 못 한다.

<br/>

## 라우팅

여기서 라우팅은 트래픽을 전달하는게 아니라 DNS 쿼리만 처리한다. 쿼리를 처리하면 실제 엔드포인트를 찾아낼 수 있다.

### 단순 라우팅 정책(simple)

기존의 라우팅 정책과 같다고 보면 된다. 하나만 지정하는게 대다수의 설정이지만, 여러 개를 설정하는 것도 가능하다. 예를 들어, 해당 레코드에 지정된 주소가 3개면 3개 다주고 3개중에 클라이언트가 하나를 골라 타겟으로 결정하게 만든다.

### 가중치 라우팅 정책(weighted)

각각의 인스턴스에 가중치를 설정하고 해당 가중치만큼 주소를 지정해준다. 즉, 한 레코드에 3개의 주소를 연결하고 각각 7, 2, 1로 가중치를 잡는다. 그러면 100요청이 들어왔다면, 7으로 잡은 곳에 70 요청을, 2으로 잡은 곳에 20요청, 1으로 잡은 곳에 10요청을 준다. 모든 0 가중치면 동일하게 분배한다.

단순 레코딩과 다르게 한 레코드 안에 모든 주소를 넣는게 아니라 각각 가중치와 주소를 따로 설정해줘야한다.

### 지연시간 라우팅 정책(latency)

여러 서버를 지정해 놓고, 클라이언트에서 연결되는 시간을 기반으로 가까운 리젼에 주소를 할당하게 된다.

### 장애조치 라우팅 정책(failover)

프라이머리 인스턴스에 요청을 보내고 헬스체크가 이상하면, 세컨더리 인스턴스에 요청을 보내게 된다. 프라이머리 인스턴스와 세컨더리 인스턴스는 사용자가 직접 설정한다.

### 지리적 위치 라우팅정책(geolocation)

지연시간 라우팅 정책이랑은 다르다. 실제 유저위치(ex. 아시아, 한국, 미국, 유럽, 프랑스)에 의해 라우팅되는 주소가 다르게된다.

### 지리적 근접성 라우팅 정책 (geoproximity)

지리적 편향값을 이용해서 지리적인 위치와 함께 주소를 결정한다.

예를 들면 서울과 부산이라는 리전이 있고, 대구 사용자가 서비스에 접속하려할 때, 대구는 부산과 가까우니 부산의 서비스를 이용할 것이다. 하지만 편향값을 서울에 50정도 줘버리면 서울이 위치가 더 멀지만 편향값 때문에 대구 사용자는 서울 서비스를 이용하게 된다. 이 때 밀양사용자 정도는 부산을 이용하게 된다.

### 다중 값 라우팅 정책(multivalue answer)

클라이언트 사이드의 멀티밸런싱이라고 보면 된다. 최대 8개의 주소를 받고 받은 모든 주소는 정상일 때만 주소를 클라이언트에게 주게 된다. 그러면 클라이언트에서 그 주소들 중 하나를 사용한다.

<br/>

## 트래픽 플로우

정책 하나당 월 50달러나 하지만 시각적으로 라우팅 정책을 설정할 수 있고, 실제 흐름이 보이며, 복잡한 정책들을 한 번에 설정할 수 있다. 버전 및 호스팅 영역도 설정할 수 있어서, 회사 입장에서 쓰기에는 50달러를 내기에 충분한 가치가 있다고 볼 수 있다.

<br/>

## Health Check

보통 3가지로 나뉜다. 기본 / 심화 / 추가 서비스 라고 생각하면 된다.

### 공용 엔드포인트 확인 (Base Health Check)

15개의 글로벌 헬스체커가 해당 엔드포인트에 헬스 체크를 보내서 확인한다. 기간은 30초, 10초로 정해줄 수 있고, 10초로 설정할 경우 비용이 커진다. 실패 처리 3번이 디폴트이고 설정으로 변경가능하다. 프로토콜은 HTTP, HTTPS, TCP을 지원한다. 18% 이상의 상태확인이 정상이면 해당 엔드포인트는 정상이라고 판단하고, 상태확인에 사용될 위치도 설정가능하다. 상태확인은 2xx, 3xx 응답만 받으며, 해당 헬스체커가 보안그룹에서 막힐 수 있으니 주의해야 한다.

### 엔드포인트 확인 심화 (Calulated Health Check)

계산된 헬스체크는 256개의 자식 헬스체커를 가질 수 있고 해당 헬스체커들의 응답을 OR, AND, NOT으로 설정할 수 있다. 그렇게 자식 헬스체커를 모두 합쳐서 부모 헬스체커가 헬스 상태를 판단하게 된다.

### 추가 서비스 이용 (CloudWatch)

개인리소스를 모니터링하는 것은 개인 VPC나 온프레미스면 접근을 못하는데, 클라우드 와치 알람으로 상태확인을 가능하게 만든다. 그렇기 때문에 프라이빗 리소스 확인할 경우 CloudWatch와 함께 써준다.

<br/>