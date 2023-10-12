---
description: Async 어노테이션에 대해 알아본다.
---

# Async Annotation

## @Async 구현체 확인(코드)

스프링에는 `@Async` 를 통해서 쉽게 비동기 처리를 할 수 있다. 근데 어떤 구현체를 받아 비동기가 이루어 지는 것일까?

**코드를 뜯어보면서 알아보자.**

간단하게 스택 트레이스를 통해서 **org.springframework.aop.interceptor** 패키지의 **AsyncExecutionInterceptor** 에서 가져온다는 것을 알 수 있었다. 해당 클래스에는 밑의 **getDefaultExecutor** 라는 메소드가 있고, 해당 메소드는 **defaultExecutor** 를 가져온다.

```java
    @Nullable
    protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
        Executor defaultExecutor = super.getDefaultExecutor(beanFactory);
        return (Executor)(defaultExecutor != null ? defaultExecutor : new SimpleAsyncTaskExecutor());
    }
```

<br/>

그럼 위의 코드를 보았을 때, **super.getDefaultExecutor** 메소드에서 **null**이 반환된다면, **SimpleAsyncTaskExecutor**이 반환될 것이란 것을 알 수 있다. 어떤 것을 반환하는지 부모 클래스의 **getDefaultExecutor** 메소드를 확인해보자.

<br/>

```java
    @Nullable
    protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
        if (beanFactory != null) {
            try {
                return (Executor)beanFactory.getBean(TaskExecutor.class);
            } catch (NoUniqueBeanDefinitionException var6) {
                this.logger.debug("Could not find unique TaskExecutor bean. Continuing search for an Executor bean named 'taskExecutor'", var6);

                try {
                    return (Executor)beanFactory.getBean("taskExecutor", Executor.class);
                } catch (NoSuchBeanDefinitionException var4) {
                    if (this.logger.isInfoEnabled()) {
                        this.logger.info("More than one TaskExecutor bean found within the context, and none is named 'taskExecutor'. Mark one of them as primary or name it 'taskExecutor' (possibly as an alias) in order to use it for async processing: " + var6.getBeanNamesFound());
                    }
                }
            } catch (NoSuchBeanDefinitionException var7) {
                this.logger.debug("Could not find default TaskExecutor bean. Continuing search for an Executor bean named 'taskExecutor'", var7);

                try {
                    return (Executor)beanFactory.getBean("taskExecutor", Executor.class);
                } catch (NoSuchBeanDefinitionException var5) {
                    this.logger.info("No task executor bean found for async processing: no bean of type TaskExecutor and no bean named 'taskExecutor' either");
                }
            }
        }

        return null;
    }
```

<br/>

코드를 보면 **TaskExecutor** 와 **Executor** 의 **taskExecutor** 이름으로 된 Bean을 모조리 찾아버린다. 찾게 된다면 **SimpleAsyncTaskExecutor** 대신 해당 구현체를 쓰게 된다는 말이다. 여기서 조심할 점은 여러 개의 **TaskExecutor** Bean을 등록하게 되면 **NoUniqueBeanDefinitionException** 이 나고 **Executor** 의 **taskExecutor** 이름으로 된 Bean부터 반환하게 된다.

<br/>

:::warning
여러 개의 Bean을 찾았는데, **taskExecutor** 라는 이름의 Bean이 없다면 **null** 을 반환한다. 즉, **SimpleAsyncTaskExecutor** 를 사용하게 된다는 말이다. 주의하자!
:::

<br/>

## @Async 구현체 확인(실제)


우리는 Bean 설정을 통해서 **Executor** 를 커스텀하게 설정하거나 기본 값인 **SimpleAsyncTaskExecutor** 를 사용하는 것을 코드로 확인하였다. 그럼 이제 실제로 구동해서 확인해보자.

먼저 **Executor** 를 커스텀 설정하지 않고, 그냥 `@Async` 만 써본다. 쉽게 확인하기 위해서 강제 에러를 내고 스택트레이스를 확인했다.

<br/>

```
java.lang.NullPointerException
	at com.inssafy.backend.api.member.service.SecondService.doSecond(SecondService.java:35)
	at com.inssafy.backend.api.member.service.SecondService$$FastClassBySpringCGLIB$$e0eb626e.invoke(<generated>)
	at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:218)
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:793)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:163)
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.proceed(CglibAopProxy.java:763)
	at org.springframework.aop.interceptor.AsyncExecutionInterceptor.lambda$invoke$0(AsyncExecutionInterceptor.java:115)
	at java.base/java.util.concurrent.FutureTask.run(FutureTask.java:264)
	at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128)
	at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)
	at java.base/java.lang.Thread.run(Thread.java:834)
```

<br/>

뭔가 이상한 점을 확인할 수 있다. **ThreadPoolExecutor** 이 나온다는 것이다. 이는 어떤 **Executor** 를 넣어도 **ThreadPoolExecutor** 로 강제변환을 시키기 때문이다. task를 실행할 땐 **doSubmit** 메소드를 거치게 되는데, 해당 **Executor** 가 어떻게 들어오는지 타고 올라가다 보면 밑의 메소드가 나온다.

<br/>

```java
@Nullable
    protected AsyncTaskExecutor determineAsyncExecutor(Method method) {
        AsyncTaskExecutor executor = (AsyncTaskExecutor)this.executors.get(method);
        if (executor == null) {
            String qualifier = this.getExecutorQualifier(method);
            Executor targetExecutor;
            if (StringUtils.hasLength(qualifier)) {
                targetExecutor = this.findQualifiedExecutor(this.beanFactory, qualifier);
            } else {
                targetExecutor = (Executor)this.defaultExecutor.get();
            }

            if (targetExecutor == null) {
                return null;
            }

            executor = targetExecutor instanceof AsyncListenableTaskExecutor ? (AsyncListenableTaskExecutor)targetExecutor : new TaskExecutorAdapter(targetExecutor);
            this.executors.put(method, executor);
        }

        return (AsyncTaskExecutor)executor;
    }
```

<br/>

여기서 강제 형변환을 당하게 되고 스택트레이스에는 저렇게 찍히게 된다. 그렇다고 해서 구현체 확인을 못 하는 것은 아니다. Bean에 어떤 **Executor** 들이 들어가 있는지 확인하고 Bean에 하나도 없다면 해당 **Executor** 는 **SimpleAsyncTaskExecutor** 라고 할 수 있다. Bean을 확인하는 방법은 밑과 같다.

<br/>

```
...

private final ApplicationContext applicationContext;

...

public void aaa() {
    Arrays.stream(applicationContext.getBeanDefinitionNames()).forEach(a -> log.info(a));
}
```

<br/>

이제 커스텀으로 설정해서 Bean을 생성해서 써보자. 커스텀 설정을 하면 Bean에서도 확인할 수 있을 뿐더러, 로그를 찍어보면 확연하게 티가 난다. 일단 **Thread** 의 이름부터가 다르며, 직접 **prefix** 를 설정할 수 있기에 **ThreadName** 만으로 확인할 수 있게 된다.

<br/>

```
// Custom 설정 X
2022-09-06 22:08:55.924  INFO 24824 --- [         task-1] c.i.b.api.member.service.SecondService   : amazonS3Client
2022-09-06 22:08:55.924  INFO 24824 --- [         task-1] c.i.b.api.member.service.SecondService   : org.springframework.security.config.annotation.configuration.ObjectPostProcessorConfiguration

// Custom 설정 O 및 빈확인
2022-09-06 22:22:42.177  INFO 31176 --- [lTaskExecutor-1] c.i.b.api.member.service.SecondService   : amazonS3Client
2022-09-06 22:22:42.179  INFO 31176 --- [lTaskExecutor-1] c.i.b.api.member.service.SecondService   : threadPoolTaskExecutor
2022-09-06 22:22:42.179  INFO 31176 --- [lTaskExecutor-1] c.i.b.api.member.service.SecondService   : org.springframework.security.config.annotation.configuration.ObjectPostProcessorConfiguration
```

<br/>

이렇게 해서 `@Async` 의 구현체와 실제 동작하는 것을 알아보았고, 마지막에서 다뤘던 **CustomExecutor** 는 어떻게 설정하는지 알아보고 가자.

<br/>

## 추가 - CustomExecutor 설정

`@Async` 가 어떻게 돌아가는지 감을 잡았다. 이젠 `@Async` 를 한 번 내맘대로 설정해볼 차례이다. 구현체는 맘에 드는 **Executor**로 가져오면 되고, 여기선 **ThreadPoolTaskExecutor**를 골랐다. 밑은 예제이고, 자주 쓰이는 4가지 설정을 가져왔다.

* `setThreadNamePrefix` - threadName에 prefix를 붙인다. **... [           Tag1] c.i...** 이런 식으로 표시된다.
* `setCorePoolSize` - coreSize를 정한다. 이 size는 처음 생성되는 스레드 갯수와 유지되는 스레드 갯수를 의미한다. coreThread를 없애버리는 **setAllowCoreThreadTimeOut** 설정도 있으니 상황에 맞게 잘 사용하면 된다.
* `setMaxPoolSize` - **maxSize**를 정한다. 이 size는 스레드가 생성될 수 있는 최대 갯수를 의미한다. 해당 갯수를 넘어가면 **Exception**이 난다.
* `setQueueCapacity` - **queueCapacity**를 정한다. 이 capacity는 대기하는 열의 최대 갯수를 의미한다. 해당 **capacity**를 넘어가면 **maxSize**만큼 스레드가 계속 생성된다.

<br/>

```java
  @Bean
  public Executor threadPoolTaskExecutor() {
    ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
    threadPoolTaskExecutor.setThreadNamePrefix("Tag");
    threadPoolTaskExecutor.setCorePoolSize(5);
    threadPoolTaskExecutor.setMaxPoolSize(1000);
    threadPoolTaskExecutor.setQueueCapacity(100);
    threadPoolTaskExecutor.initialize();

    return threadPoolTaskExecutor;
  }
```

<br/>

위와 같이 **CustomerExecutor** 를 만들어 Bean으로 등록하면 **CustomerExecutor** 로 `@Async` 를 사용할 수 있게 된다. 이로써 `@Async` 에 대해서 좀 더 확실하게 알게 되었으니 비동기 적재에 잘 써먹을 수 있을 것 같다.

<br/>

<div style={{"text-align": "right"}}> 최종 업데이트: 2023년 10월 12일 </div>
