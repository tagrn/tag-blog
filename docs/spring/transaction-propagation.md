---
---
# Transaction Propagation

## Propagation.REQUIRED - default

부모 트랜잭션이 존재할 경우, 부모 트랜잭션에 참여한다.

부모 트랜잭션이 없을 경우, 새 트랜잭션을 생성하여 적용시킨다.

#### Example Code

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log

```
2022-08-11 19:30:10.390  INFO 18004 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:30:10.399  INFO 18004 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:30:10.407  INFO 18004 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:30:10.407  INFO 18004 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>


## Propagation.SUPPORTS

부모 트랜잭션이 존재할 경우, 부모 트랜잭션에 참여한다.

부모 트랜잭션이 없을 경우, 작동하지 않는 트랜잭션이 명시적으로만 생성된다.


#### Example Code 1

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.SUPPORTS)
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.SUPPORTS)
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log 1

```
2022-08-11 19:37:34.177  INFO 33624 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:37:34.186  INFO 33624 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:37:34.194  INFO 33624 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:37:34.195  INFO 33624 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>

부모 트랜잭션을 빼게 되면 밑과 같이 트랜잭션이 생성된다.

#### Example Code 2

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

#### Example Log 2

```
2022-08-11 19:43:32.073  INFO 7204 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: null
2022-08-11 19:43:32.173  INFO 7204 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 19:43:32.189  INFO 7204 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.ThirdService.doThird
2022-08-11 19:43:32.190  INFO 7204 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>

하지만 밑과 같이 secondService를 변경하고 코드를 실행해보면, 트랜잭션이 명시가 될 뿐 트랜잭션이 적용되지 않는다. 트랜잭션이 동작하지 않으므로, Exception이 났을 때, 데이터가 rollback이 되어야 하지만 DB에 저장된 상태로 남아있게 된다.

#### Example Code 3

```java
@Slf4j
@Transactional(propagation = Propagation.SUPPORTS)
@RequiredArgsConstructor
@Service
public class SecondService {

	private final TestEntityRepository testEntityRepository;

	public void doSecond() {
		testEntityRepository.save(new TestEntity("test"));
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		throw new RuntimeException();
	}

}
```

#### Example Log 3

```
2022-08-11 19:49:13.765  INFO 32388 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: null
Hibernate: select nextval ('hibernate_sequence')
Hibernate: insert into test_entity (str, id) values (?, ?)
2022-08-11 19:49:14.153  INFO 32388 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 19:49:14.253 ERROR 32388 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is java.lang.RuntimeException] with root cause

java.lang.RuntimeException: null
	at com.inssafy.backend.api.member.service.SecondService.doSecond(SecondService.java:35) ~[main/:na]
```

<br/>

## Propagation.MANDATORY

부모 트랜잭션이 존재할 경우, 부모 트랜잭션에 참여한다.

부모 트랜잭션이 없을 경우, Exception이 발생한다.

#### Example Code 1


```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.MANDATORY)
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.MANDATORY)
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log 1

```
2022-08-11 19:55:38.484  INFO 6300 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:55:38.490  INFO 6300 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:55:38.498  INFO 6300 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 19:55:38.499  INFO 6300 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>


밑의 코드처럼 부모 트랜잭션이 없어지면 Exception 발생한다.

#### Example Code 2


```java
@Slf4j
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

#### Example Log 2

```
2022-08-11 19:57:37.116  INFO 30692 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: null
2022-08-11 19:57:37.168 ERROR 30692 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is org.springframework.transaction.IllegalTransactionStateException: No existing transaction found for transaction marked with propagation 'mandatory'] with root cause

org.springframework.transaction.IllegalTransactionStateException: No existing transaction found for transaction marked with propagation 'mandatory'
```

<br/>



## Propagation.REQUIRES_NEW

부모 트랜잭션 유무에 상관없이, 새 트랜잭션 생성하여 적용시킨다.

새 트랜잭션이 끝난 후, 다시 부모 트랜잭션을 이어나간다.

#### Example Code

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.REQUIRES_NEW)
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.REQUIRES_NEW)
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log

```
2022-08-11 20:06:09.153  INFO 29412 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:06:09.180  INFO 29412 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 20:06:09.194  INFO 29412 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.ThirdService.doThird
2022-08-11 20:06:09.194  INFO 29412 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```


<br/>


## Propagation.NOT_SUPPORTED

부모 트랜잭션 유무에 상관없이 명시적으로 트랜잭션이 생성되지만 트랜잭션이 동작하지 않는다.

부모 트랜잭션이 존재할 경우, 부모 트랜잭션에서 동작하는 태스크는 트랜잭션이 동작하지만 NOT_SUPPORTED 설정이 된 트랜잭션 안에서는 동작하지 않는다.


#### Example Code 1

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log 1

```
2022-08-11 20:07:49.746  INFO 18844 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:07:49.754  INFO 18844 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 20:07:49.763  INFO 18844 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.ThirdService.doThird
2022-08-11 20:07:49.763  INFO 18844 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>

Propagation.SUPPORTS와 같이 밑처럼 테스트 해보면, 트랜잭션에 상관없이 저장됨을 알 수 있다.

#### Example Code 2

```java
@Slf4j
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@RequiredArgsConstructor
@Service
public class SecondService {

	private final TestEntityRepository testEntityRepository;

	public void doSecond() {
		testEntityRepository.save(new TestEntity("test"));
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		throw new RuntimeException();
	}

}
```

#### Example Log 2

```
2022-08-11 20:10:00.776  INFO 9484 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
Hibernate: select nextval ('hibernate_sequence')
Hibernate: insert into test_entity (str, id) values (?, ?)
2022-08-11 20:10:01.069  INFO 9484 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 20:10:01.141 ERROR 9484 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is java.lang.RuntimeException] with root cause

java.lang.RuntimeException: null
	at com.inssafy.backend.api.member.service.SecondService.doSecond(SecondService.java:35) ~[main/:na]
```


<br/>


## Propagation.NEVER

트랜잭션이 명시적으로 표현은 되지만 트랜잭션을 아예 쓰지 않는 설정이다.

부모 트랜잭션이 존재할 경우, Exception이 발생한다.

#### Example Code 1

```java
@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.NEVER)
@Service
public class SecondService {

	public void doSecond() {
		log.info("[Second Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

```java
@Slf4j
@Transactional(propagation = Propagation.NEVER)
@Service
public class ThirdService {

	public void doThird() {
		log.info("[Third Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
	}

}
```

#### Example Log 1

```
2022-08-11 20:12:03.100  INFO 28648 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:12:03.260 ERROR 28648 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed; nested exception is org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'] with root cause

org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'
```

<br/>

부모 트랜잭션이 없을 경우, 명시적으로 보이지만 잘 동작함.

#### Example Code 2

```java
@Slf4j
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

#### Example Log 2

```
2022-08-11 20:13:41.592  INFO 9356 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: null
2022-08-11 20:13:41.629  INFO 9356 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.SecondService.doSecond
2022-08-11 20:13:41.641  INFO 9356 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.ThirdService.doThird
2022-08-11 20:13:41.641  INFO 9356 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>

그렇다면 NEVER -> NEVER로 가면 어떻게 될까? 명시적이지만 동작하지 않는 Transaction은 과연 동작하는 부모 Transaction으로 인지할까?

#### Example Code 3

```java
@Slf4j
@Transactional(propagation = Propagation.NEVER)
@RequiredArgsConstructor
@Service
public class FirstService {

	private final SecondService secondService;
	private final ThirdService thirdService;

	public void doFirst() {
		log.info("[First Service]: " + TransactionSynchronizationManager.getCurrentTransactionName());
		secondService.doSecond();
		thirdService.doThird();
		log.info("-----------  DONE  ------------");
	}

}
```

#### Example Log 3

```
2022-08-11 20:15:23.443  INFO 17528 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : [First Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:15:23.453  INFO 17528 --- [nio-8080-exec-1] c.i.b.api.member.service.SecondService   : [Second Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:15:23.461  INFO 17528 --- [nio-8080-exec-1] c.i.b.api.member.service.ThirdService    : [Third Service]: com.inssafy.backend.api.member.service.FirstService.doFirst
2022-08-11 20:15:23.462  INFO 17528 --- [nio-8080-exec-1] c.i.b.api.member.service.FirstService    : -----------  DONE  ------------
```

<br/>

명시적으로 트랜잭션이 생겨나면서 Exception은 발생하지 않는다. 헷갈리지 말고 동작하지 않는 Transaction이라는 것을 인지해야 한다.

<br/>