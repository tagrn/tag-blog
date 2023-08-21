---
sidebar_position: 2
description: 파이썬에서 병렬 실행을 하는 방법
---

# GIL과 멀티 스레딩/프로세싱

## GIL

파이썬에는 GIL 이라는게 존재한다. 얘는 Global Interpreter Lock 이라고 하는데, 일종의 Mutex 역할을 한다. 이런 Mutex가 필요한 이유는 레퍼런스 카운팅을 통해서 GC를 하는 CPython이 GC 과정 중에 race condition을 발생시킬 수 있다. 이 때문에 의도하지 않은 object가 삭제되거나 메모리 유실이 생길 수 있어서 스레드 실행을 독립적으로 시켜, race condition이 발생하지 않도록 제어한다.

이 때문에 GIL이 생기긴 했는데, 다른 멀티스레딩에 비해 좋지 않은 방법이긴 하다. 하지만 역사적으로 GIL이 생길 당시, thread의 개념이 제대로 없었고 파이썬에 대한 여러 C extension을 메모리 관리 방법에 의해 모두 바꾸는 것이 힘들었다고 한다. 그래서 GIL을 택했고, 현재까지 이어지고 있다.

:::info
좀 더 자세한 내용을 보고 싶다면 해당 글이 제일 잘 쓴 것 같아서 레퍼런스로 남겨놓는다.

https://dgkim5360.tistory.com/entry/understanding-the-global-interpreter-lock-of-cpython
:::

<br/>

## GIL 경험하기

GIL을 경험하려면 멀티 스레딩 코딩을 한 번 해보면 바로 알 수 있다.

```
import threading
import time


def work():
    n = 0
    for i in range(10000000):
        n += 1


# 싱글 스레드
start_time = time.time()
for i in range(20):
    work()

print(f"싱글 스레드: {time.time() - start_time}")


# 멀티 스레드
start_time = time.time()
threads = []
for i in range(20):
    threads.append(threading.Thread(target=work))
    threads[-1].start()

while threads:
    threads.pop().join()

print(f"멀티 스레드: {time.time() - start_time}")
```

<br/>

threading 이라는 라이브러리를 통해 멀티 스레딩을 구현할 수 있고, 싱글 스레드와 멀티 스레드의 실행 시간을 비교하였다. 밑의 결과를 통해 멀티 스레드와 싱글 스레드의 시간 차이가 별로 없는 것을 확인할 수 있고, GIL 존재 또한 확인할 수 있었다.

```
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 7.9026689529418945
멀티 스레드: 7.426951885223389
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 7.6546337604522705
멀티 스레드: 7.3887059688568115
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 7.724365234375
멀티 스레드: 7.309466123580933
```

<br/>

## 멀티 스레드

이렇게 GIL의 존재를 확인할 수 있는데, 그렇다면 멀티스레드는 왜 존재하는 것일까? 그냥 싱글 스레드에 멀티 프로세싱만 파이썬에 존재하면 안 되는 것일까?

그에 대한 해답을 줄 것이 다음 코드이다.


```
import threading
import time


def work():
    n = 0
    for i in range(10000000):
        n += 1
    time.sleep(0.1)


# 싱글 스레드
start_time = time.time()
for i in range(20):
    work()

print(f"싱글 스레드: {time.time() - start_time}")


# 멀티 스레드
start_time = time.time()
threads = []
for i in range(20):
    threads.append(threading.Thread(target=work))
    threads[-1].start()

while threads:
    threads.pop().join()

print(f"멀티 스레드: {time.time() - start_time}")
```

<br/>

work 라는 함수에 sleep 시간을 준다. 그러면 싱글 스레드는 sleep 시간 동안 작업을 쉬지만, 멀티 스레드는 sleep 시간동안 다른 스레드가 돌게 된다. 이는 sleep 작업은 공유 메모리에 아무런 영향을 주지 않기 때문이다.

```
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 9.98878002166748
멀티 스레드: 7.455132961273193
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 9.932666063308716
멀티 스레드: 7.329209089279175
(venv) taewangu@Taewanui-MacBookAir pokr-server % python3 main.py
싱글 스레드: 10.234058380126953
멀티 스레드: 7.617471933364868
```

<br/>

위의 결과를 보면 싱글 스레드가 훨씬 느린 것을 확인할 수 있고, 이렇게 멀티 스레딩의 필요 존재도 확인 할 수 있다. 그래도 병렬 프로그래밍을 하기 위해서는 멀티 스레딩은 좀 부족하다.

<br/>

## 멀티 프로세싱

파이썬에서 멀티 스레드로 병렬작업을 하겠다는 것은 GIL 때문에 힘들다고 볼 수 있다. 그래서 멀티 프로세싱을 사용하여 병렬작업을 주로 하게 된다. 멀티 프로세싱을 실제로 진행하기 위해 밑과 같이 코드를 짜보았다.
```
from multiprocessing import Process, Queue
import time


def work():
    n = 0
    for i in range(10000000):
        n += 1
    time.sleep(0.1)


if __name__ == '__main__':
    # 싱글 프로세스
    start_time = time.time()
    for i in range(20):
        work()

    print(f"싱글 프로세스: {time.time() - start_time}")

    # 멀티 프로세스
    result = Queue()
    processes = []
    start_time = time.time()
    for i in range(20):
        processes.append(Process(target=work))
        processes[-1].start()

    while processes:
        processes.pop().join()

    print(f"멀티 프로세스: {time.time() - start_time}")
```

<br/>

그리고 결과를 확인해보면 작업이 싱글 프로세스에 비해 빠르게 끝났다는 걸 한 눈에 알 수 있다.

```
(venv) taewangu@TaewanucBookAir pythonProject1 % python3 main.py
싱글 프로세스: 9.83880615234375
멀티 프로세스: 2.11391019821167
(venv) taewangu@TaewanucBookAir pythonProject1 % python3 main.py
싱글 프로세스: 9.89809513092041
멀티 프로세스: 2.1120851039886475
(venv) taewangu@TaewanucBookAir pythonProject1 % python3 main.py
싱글 프로세스: 10.177831888198853
멀티 프로세스: 1.961460828781128
```

<br/>

그러니 파이썬으로 병렬 작업을 할 경우에는 멀티 프로세싱으로 하면 된다는 걸 알 수 있고, 메모리와 CPU 사용률이 높아지기 때문에 자신의 컴퓨터의 성능에 맞춰서 프로세싱을 돌려주면 된다. CPU 코어 수 및 메모리사이즈는 터미널에서 밑의 명령어로 확인할 수 있다.

```
taewangu@Taewanui-MacBookAir pokr-server % sysctl hw.physicalcpu
hw.physicalcpu: 8
taewangu@Taewanui-MacBookAir pokr-server % sysctl hw.logicalcpu 
hw.logicalcpu: 8
taewangu@Taewanui-MacBookAir pokr-server % sysctl hw.memsize
hw.memsize: 17179869184
```

<br/>
