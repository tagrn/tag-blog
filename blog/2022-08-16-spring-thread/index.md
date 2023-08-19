---
slug: spring-thread
title: Spring 스레드 작동 이슈 해결
authors: [tagrn]
---

## 문제 발생

Spring으로 비동기 프로그래밍을 돌리면서 이상한 현상이 발생했다. Thread가 10개만 동작하고 스프링 동작이 멈춰지는 것이었다. 심지어 스프링 첫 기동 시에도 돌려야하는 작업이라 해당 작업들이 다 끝난 후 스프링이 기동되는 현상까지 발생했다. 뭐야...?

<!--truncate-->

![??](./question.jpeg)

<br />

## 상황 재현

상황 재현을 위해 간단하게 밑의 코드로 Executor 빈을 만들고 상황 재현을 위해 첫 서비스 메소드에서 두 번째 서비스 메소드(`@Async` 어노테이션 포함)로 비동기 요청을 진행한다.

```java
@Bean
public Executor AsyncExecutor() {
	ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
	threadPoolTaskExecutor.setCorePoolSize(15);
	threadPoolTaskExecutor.setMaxPoolSize(1000);
	threadPoolTaskExecutor.setQueueCapacity(10);
	threadPoolTaskExecutor.initialize();

	return threadPoolTaskExecutor;
}
```

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

    private final SecondService secondService;

    public void doFirst() {
    	for (int i = 0; i < 20; i++) {
    		secondService.doSecond();
    	}
    	log.info("-----------  DONE  ------------");
    }

}
```

```java
@Slf4j
@Transactional
@Async // 비동기 요청
@Service
public class SecondService {

    public void doSecond() {
    	try {
    		Thread.sleep(5000);
    	} catch (Exception e) {
    		log.error(e.getMessage());
    	}

    	log.info("[Second Service]: " + Thread.currentThread().getName());
    }

}
```

<br />

그러면 예상할 수 있는 것은 15개의 Thread가 먼저 움직이고 5초 뒤 5개의 Thread가 남은 작업을 끝내는 것이다. 실행해보자.

```
2022-08-16 20:55:13.437 INFO 22796 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService : ----------- DONE ------------
2022-08-16 20:55:18.479 INFO 22796 --- [AsyncExecutor-7] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-7
2022-08-16 20:55:18.480 INFO 22796 --- [syncExecutor-11] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-11
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-9] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-9
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-8] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-8
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-6] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-6
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 20:55:18.480 INFO 22796 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 20:55:18.480 INFO 22796 --- [syncExecutor-12] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-12
2022-08-16 20:55:23.483 INFO 22796 --- [syncExecutor-15] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-15
2022-08-16 20:55:23.483 INFO 22796 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 20:55:23.483 INFO 22796 --- [AsyncExecutor-7] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-7
2022-08-16 20:55:23.483 INFO 22796 --- [AsyncExecutor-8] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-8
2022-08-16 20:55:23.484 INFO 22796 --- [syncExecutor-10] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-10
2022-08-16 20:55:23.485 INFO 22796 --- [syncExecutor-14] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-14
2022-08-16 20:55:23.485 INFO 22796 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 20:55:23.486 INFO 22796 --- [syncExecutor-11] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-11
2022-08-16 20:55:23.485 INFO 22796 --- [AsyncExecutor-9] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-9
2022-08-16 20:55:23.484 INFO 22796 --- [syncExecutor-13] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-13
```

하지만 위의 로그를 보면 2가지가 잘못되었다는 것을 느낄 수 있다.

1. 스레드는 한 번에 10개씩 돌아간다.
2. 한 번에 10개씩 돌아가지만 스레드는 15개가 찍힌다.

`AsyncExecutor-{number}`가 15개가 찍힌다. 시간을 보면 20:55:18에 10개가 돌아가고 20:55:23에 10개가 돌아간다. 도대체 무엇 때문에 이렇게 되었을까?

<br />

## 원인 발견

뭐가 잘못 되었는지 알기 위해, 코드를 다시 작성하기도 하고, 프로젝트를 새로 파기도 하고, 주입되는 서비스들도 다 빼보고, 따로 비동기 Executor를 직접 만들고 생성해서 해봐도 똑같았다. 그러다 왠걸..

<br/>

**`@Transactional` 어노테이션을 빼니 정상작동**하기 시작했다!!

<br/>

사실 해당 코드는 DB에 접근하는 코드가 없었으니까, 해당 어노테이션은 아닐거라 생각했다. DB에 접근하는 코드가 트랜잭션 어노테이션에 숨겨져 있는지 모르고 말이다.

<br/>

**Transaction과 DBCP**

`@Transactional` 때문에 쓰레드가 10개만 도는 것이다. 진짜 원인 찾는데만 10시간 넘게 걸린 것 같다. 😂 로그를 볼 때 DB 커넥션이 끊어지던데, 그 끊어지는게 spring 자체가 기동이 중지되어서 인 줄 알았는데, DB 커넥션이 진짜 Timeout 되어서 끊어진 것일 줄이야. 원인을 찾았다고 해도 여기서 끝낼 순 없었다. 왜냐하면 서비스에는 `@Transactional`이 꼭 필요하기 때문이다.

**"그럼 Transaction이 무슨 죄길래, ThreadPool이 지맘대로 움직이게 되는 것일까?"**

알고보니 Transactional annotation은 Transaction을 생성할 때, DB Connection을 하나 점유하게 된다. 그리고 DB Connection Pool의 maxDbPoolSize 기본값이 10이다. 즉, DB Connection을 점유하기 때문에, DB Connection을 가지는 작업들이 싹다 정지되어 버리는 것이다. `@Transactional`안에서 DB에 접근도 안하는데 DB 커넥션을 선 점유하고 있다는 사실에 충격먹었다.

<br />

## 해결

해결 방안은 크게 두 가지이다.

#### 1. DBCP maxPoolSize 변경

원인 자체를 없애는 방법이라 좋긴 하지만, DB의 성능도 고려해야 하고, 서비스 간의 협약도 생각해야 한다. MSA 구조 특성상 다른 서비스들과의 유대가 필요하기 때문이다. 예를 들어, 해당 DB의 Connection이 1000개로 제한되어 있고, 여러 서비스가 같이 사용하는 DB라면 Connection의 수도 마냥 늘려버리는 것도 한계가 있다. 그렇기 때문에 10개의 서비스가 100씩만 가지기로 했는데, 하나의 서비스가 이를 어기고 150개를 사용하는 순간 다른 서비스의 성능이 저하되니 말이다. (사실 MSA 제대로 하려면 DB도 각자 가지는게 맞는데, 이를 지키는 회사가 얼마나 있을까 싶다.)

자, 그럼 DBCP 커넥션 풀 사이즈를 변경하고 실행시켜보자.

```yml
spring:
  datasource:
    driver-class-name: 'org.postgresql.Driver'
    url: 'jdbc:postgresql://***.***.***.***:15432/{DB_NAME}'
    username: { name }
    password: { pw }
    hikari:
      maximum-pool-size: 50
```

```
2022-08-16 21:18:20.033 INFO 30824 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService : ----------- DONE ------------
2022-08-16 21:18:25.048 INFO 30824 --- [syncExecutor-10] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-10
2022-08-16 21:18:25.048 INFO 30824 --- [AsyncExecutor-7] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-7
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-9] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-9
2022-08-16 21:18:25.048 INFO 30824 --- [syncExecutor-12] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-12
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 21:18:25.048 INFO 30824 --- [syncExecutor-13] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-13
2022-08-16 21:18:25.048 INFO 30824 --- [syncExecutor-14] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-14
2022-08-16 21:18:25.048 INFO 30824 --- [AsyncExecutor-8] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-8
2022-08-16 21:18:25.048 INFO 30824 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 21:18:25.048 INFO 30824 --- [syncExecutor-11] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-11
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
2022-08-16 21:18:25.049 INFO 30824 --- [syncExecutor-15] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-15
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 21:18:25.049 INFO 30824 --- [AsyncExecutor-6] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-6
2022-08-16 21:18:30.050 INFO 30824 --- [AsyncExecutor-7] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-7
2022-08-16 21:18:30.050 INFO 30824 --- [AsyncExecutor-9] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-9
2022-08-16 21:18:30.050 INFO 30824 --- [syncExecutor-12] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-12
2022-08-16 21:18:30.050 INFO 30824 --- [syncExecutor-10] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-10
2022-08-16 21:18:30.050 INFO 30824 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
```

로그를 보면 예상대로 15개 실행되고 5개가 남아서 실행되어 문제를 해결한 것을 확인할 수 있다.

<br/>

#### 2. ThreadPool의 coreSize와 maxSize를 10미만으로 사용

만약 DBCP의 풀 사이즈를 변경할 생각이 없다면 ThreadPool의 사이즈를 조정할 수 밖에 없다. ThreadPool을 쓰는 작업이 Transaction이 없고, dbConnection을 가지지 않는다면, 많이 두어도 상관없기 때문에 두 개를 따로 관리하는 방법도 좋은 방법이 될 수 있다.

```
@Bean
public Executor AsyncExecutor() {
	ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
	threadPoolTaskExecutor.setCorePoolSize(5);
	threadPoolTaskExecutor.setMaxPoolSize(5);
	threadPoolTaskExecutor.setQueueCapacity(Integer.MAX_VALUE);
	threadPoolTaskExecutor.initialize();

	return threadPoolTaskExecutor;
}
```

:::tip
maxPoolSize랑 queueCapacity는 기본 값이 둘 다 Integer.MAX_VALUE라서 core만 선택해줘도 된다.
:::

```
2022-08-16 21:20:57.328 INFO 36484 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService : ----------- DONE ------------
2022-08-16 21:21:02.345 INFO 36484 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
2022-08-16 21:21:02.345 INFO 36484 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 21:21:02.345 INFO 36484 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 21:21:02.345 INFO 36484 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 21:21:02.345 INFO 36484 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 21:21:07.346 INFO 36484 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
2022-08-16 21:21:07.346 INFO 36484 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 21:21:07.346 INFO 36484 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 21:21:07.346 INFO 36484 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 21:21:07.346 INFO 36484 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 21:21:12.347 INFO 36484 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 21:21:12.347 INFO 36484 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 21:21:12.347 INFO 36484 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 21:21:12.347 INFO 36484 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 21:21:12.349 INFO 36484 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
2022-08-16 21:21:17.350 INFO 36484 --- [AsyncExecutor-3] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-3
2022-08-16 21:21:17.350 INFO 36484 --- [AsyncExecutor-2] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-2
2022-08-16 21:21:17.352 INFO 36484 --- [AsyncExecutor-4] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-4
2022-08-16 21:21:17.353 INFO 36484 --- [AsyncExecutor-1] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-1
2022-08-16 21:21:17.355 INFO 36484 --- [AsyncExecutor-5] c.i.b.api.member.service.SecondService : [Second Service]: AsyncExecutor-5
```

로그를 보면 5개씩 실행되어 정상적인 결과가 나온 것을 확인할 수 있다.

<br />

## 느낀 점

이거 처음 겪었을 때, 다른 업무도 해야 하기에 임시방편만 조치해두고 계속 찾아보고 있었다. 임시방편으로도 기능 상은 문제없지만, 원인을 못 찾는 버그는 진짜 맘에 계속 남아서 주변 사람들에게 물어봤지만 해결하지 못 했다. 그래도 역시 집요하게 파고 들면 안 되는건 없나보다. 어떤 문제든 해결할 수 없는 문제는 없다고 생각한다.

<br />
