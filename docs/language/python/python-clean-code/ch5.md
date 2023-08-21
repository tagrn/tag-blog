---
sidebar_position: 5
description: 파이썬 클린코드 챕터 5 요약
---

# Ch.05 데코레이터를 사용한 코드 개선

:::note
함수를 다시 호출하는 것은 보통 작은 함수를 만들고 해당 함수에 어떤 변환을 거쳐 수정된 새로운 형태의 함수를 반환하는 순서로 이뤄진다. 수학에서 g(f(x))처럼 합성함수의 동작 방식과 유사하다. 이와 같은 방식의 함수 사용을 쉽게 만들어 주는 것이 데코레이터이며, 함수 위에 `@example`같이 작성하여서 사용할 수 있다. 클래스 데코레이터에서는 `@dataclass`가 대표적인 클래스 데코레이터라고 볼 수 있다.
:::

<br/>

## 데코레이터 생성

데코레이터는 밑과 같은 형식으로 생성할 수 있다.

_**클래스 형식으로 선언**_

``` python
from functools import wraps


class Retry:
    def __init__(self, retry_count: int = 3) -> None:
        self.retry_count = retry_count

    def __call__(self, operation):
        @wraps(operation)
        def wrapped(*args, **kwargs):
            last_raised = None
            for _ in range(self.retry_count):
                try:
                    return operation(*args, **kwargs)
                except Exception as e:
                    print(f"Error: {e}")
                    last_raised = e

            raise last_raised

        return wrapped


# @Retry(retry_count=5) 로 retry 횟수 설정가능
@Retry()
def example():
    print("raise error")
    raise Exception("Decorator Test")


example()
```

_**함수형식으로 선언**_

``` python
from functools import wraps


def retry(retry_count: int = 3):
    def retry_operation(operation):
        @wraps(operation)
        def wrapped(*args, **kwargs):
            last_raised = None
            for _ in range(retry_count):
                try:
                    return operation(*args, **kwargs)
                except Exception as e:
                    print(f"Error: {e}")
                    last_raised = e

            raise last_raised

        return wrapped

    return retry_operation


@retry()
def example():
    print("raise error")
    raise Exception("Decorator Test")


example()
```


추가로 데코레이터를 생성하면서 알게 된 부분이 있는데, `assert`는 `raise`와 다르다는 것이다. `assert` 로 에러를 낼 시, 에러가 위로 타고 올라가는 것이 아니라 그 자리에서 즉시 실행되어 버린다. 그리고 하나 더 중요한 점은 `assert`는 에러 스택트레이스를 찍지않는다는 것이다. 에러 스택트레이스를 찍기 위해서는 `__debug__` 상수를 `True`로 만들어야 한다고 한다.

``` python
@Retry()
def example():
    print("raise error")
    raise Exception("Decorator Test")

# 응답
Traceback (most recent call last):
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 30, in <module>
    example()
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 19, in wrapped
    raise last_raised
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 14, in wrapped
    return operation(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 27, in example
    raise Exception("Decorator Test")
Exception: Decorator Test
raise error
Error: Decorator Test
raise error
Error: Decorator Test
raise error
Error: Decorator Test

# -----------------------------------------------------------
@Retry()
def example():
    print("assert error")
    assert Exception("Decorator Test")
    
# 응답
assert error
```

<br/>

## 코루틴에서 데코레이터 작성

밑과 같은 식으로 `async` 로 작성해 주어야 데코레이터가 작동한다.

```python
import asyncio
from functools import wraps


def retry(retry_count: int = 3):
    def retry_operation(operation):
        @wraps(operation)
        async def wrapped(*args, **kwargs):
            last_raised = None
            for _ in range(retry_count):
                try:
                    return await operation(*args, **kwargs)
                except Exception as e:
                    print(f"Error: {e}")
                    last_raised = e

            raise last_raised

        return wrapped

    return retry_operation


@retry()
async def example():
    print("raise error")
    raise Exception("Decorator Test")


asyncio.run(example())
```



이와 다른 예로 기존의 동기 `@retry()`를 사용할 경우, 밑과 같은 예상치 못한 에러를 마주할 수 있다.

``` python
import asyncio
from functools import wraps


def retry(retry_count: int = 3):
    def retry_operation(operation):
        @wraps(operation)
        def wrapped(*args, **kwargs):
            last_raised = None
            for _ in range(retry_count):
                try:
                    return operation(*args, **kwargs)
                except Exception as e:
                    print(f"Error: {e}")
                    last_raised = e

            raise last_raised

        return wrapped

    return retry_operation


@retry()
async def example():
    print("raise error")
    raise Exception("Decorator Test")


asyncio.run(example())


# 응답
Traceback (most recent call last):
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 29, in <module>
    asyncio.run(example())
  File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/asyncio/runners.py", line 190, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/asyncio/runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Library/Frameworks/Python.framework/Versions/3.11/lib/python3.11/asyncio/base_events.py", line 653, in run_until_complete
    return future.result()
           ^^^^^^^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/challengers/main.py", line 26, in example
    raise Exception("Decorator Test")
Exception: Decorator Test
raise error
```

<br/>

## 데코레이터 확장 구문

데코레이터를 확장할 수 있는 방식이 파이썬 3.9 이상부터 지원된다. 사용 예는 밑과 같고, `lambda` 를 사용하여 여러 방식으로 사용해 볼 수 있을 것 같다. 하지만 이렇게 작성하면 가독성이 떨어지는 것도 사실이라서 상황에 맞게 고려하여 사용하는 것이 필수이다.

``` python
def _log(f, *args, **kwargs):
    print(f"logging {f.__qualname__!r}, params: {args=}")
    return f(*args, **kwargs)


@(lambda f: lambda *args, **kwargs: _log(f, *args, **kwargs))
def fun(x):
    return x


print(fun(1))

# 응답
logging 'fun', params: args=(1,)
1
```

<br/>

## 데코레이터 활용 사례

* 파라미터 변환
* 코드 추적(로깅)
* 파라미터 유효성 검사
* 재시도 로직 구현
* 일부 반복 로직에 대한 중복 코드 제거

<br/>

## 주의사항

* 부작용 없는 데코레이터를 만들어야 한다.
  * ex. 전역에 데이터 설정을 해두고 객체가 해당 데이터 설정을 계속 사용하게 하는 것 - 의도치 않은 동작을 만들 수 있다. 이는 밑의 "어느 곳에서나 동작하는 데코레이터를 만들어야 한다" 의 예도 된다.
* 어느 곳에서나 동작하는 데코레이터를 만들어야 한다.
* 상속보다는 다른 클래스를 가져와서 수정한 새로운 객체를 반환하는 컴포지션을 이용하는 것을 권장한다.
* 캡슐화, 관심사의 분리, DRY 원칙, 독립성, 재사용성을 고려하여 데코레이터를 만들어야 한다.

<br/>
