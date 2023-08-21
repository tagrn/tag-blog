---
sidebar_position: 3
description: 파이썬의 GC와 메모리 관리 방법
---

# GC와 메모리 관리

:::note
파이썬에는 **Generational Garbage Collection**와 **Reference Count** 이렇게 두 가지 방식으로 Garbage 객체를 메모리에서 삭제시킨다.
:::

<br/>

## Reference Count

reference count는 타겟 데이터의 참조하는 수를 세어서 0이 되면 해당 객체를 메모리에서 삭제시켜버린다. `sys.getrefcount(obj)`를 통해서 reference count 확인을 할 수 있고 해당 부분이 0이 되면 삭제되는 것이다. 그런데 실제로 테스트해보면 두 가지 의문점이 생긴다.

### 첫 번째 의문점

첫 번째는 li는 Reference count 가 여기서 0이 되는데도 밖에서 해당 id를 부르면 리스트 객체가 나온다는 점이다. 리스트 안의 요소들은 삭제되었지만, 리스트 자체는 살아있다. 이것이 무엇을 뜻할까?

```python
def test() -> int:
    li = list()
    li.append("hsafdasdsadasdfsdfsdasdasi")
    print(sys.getrefcount(li))

    ref_id = id(li)
    print(ctypes.cast(ref_id, ctypes.py_object).value)
    return ref_id


print(ctypes.cast(test(), ctypes.py_object).value)

# 응답
2
['hsafdasdsadasdfsdfsdasdasi']
[<NULL>]
```



 설마 아무 주소값이나 부르면 리스트 객체로 나올지 확인해봤지만 그건 어림도 없었다. 아무런 데이터가 나오지 않는다.

```python
print(ctypes.cast(4440515136, ctypes.py_object).value)

# 응답 없음.

```

이에 대한 답은 [3가지 의문점 정리](#3가지-의문점-정리)에서 확인할 수 있다.

<br/>

### 두 번째 의문점

두 번째는 숫자와 문자열의 reference count 이다. 밑의 코드를 보자.

```python
def test() -> int:
    num = 1
    print(sys.getrefcount(num))
    s = "?"
    print(sys.getrefcount(s))

test()

# 응답
1000000237
1000000012
```



reference count 가 너무 크게 나온다. 이게 뜻하는 것은 시스템 상에서 무조건 참조 값을 가지게 쓴다는 것인데, 얘들만 이럴지 확인을 해봤다.

```python
def test() -> int:
    num = 1000
    print(sys.getrefcount(num))
    s = "왜이래"
    print(sys.getrefcount(s))

test()

# 응답
4
4
```



이렇게 확인해보니 엄청 낮게 나온다. 왜 그럴까? 생각하다가 파이썬에서는 자주 쓰이는 상수들을 미리 저장해놓아서 메모리 상에 할당한다는 말이 떠올랐다. 그래서 1000 이나 왜이래는 할당해놓지 않고, 다른 것들은 할당해놓기 때문에 이렇게 reference count가 나오는 것으로 확인된다.

하지만 한 가지 의문점이 더 남는다.  얘들의 참조값 3은 왜 남는걸까? 내가 이해하기론 얘들은 1이 나와야한다.

```python
def test() -> int:
    print(sys.getrefcount(1000))
    print(sys.getrefcount("왜이래"))

test()

# 응답
3
3
```



 추가로 숫자는 257이상부터 reference count가 3이 나오고, 다른 문자열은 단 문자열 중 영어나 숫자, 특문들이 아니어야 3이 나온다. 왜 그런걸까?

```python
def test() -> int:
    print(sys.getrefcount(256))
    print(sys.getrefcount(257))
    print(sys.getrefcount("?"))
    print(sys.getrefcount("5"))
    print(sys.getrefcount("A"))
    print(sys.getrefcount("a"))
    print(sys.getrefcount("ab"))
    print(sys.getrefcount("아"))
    print(sys.getrefcount("그러네"))

test()

# 응답
1000000022
3
1000000011
1000000005
1000000011
1000000017
5
3
3
```

이에 대한 답은 [3가지 의문점 정리](#3가지-의문점-정리)에서 확인할 수 있다.

<br/>


## Generational Garbage Collection

generational garbage collection는 해당 객체가 참조가 0 이상이더라도 순환참조같은 현상이 있을 수 있으므로 사용하고 있다. 이는 JAVA에서도 사용하는 Garbage Collection 이다. 얘는 Threshold와 Generation 기반으로 움직인다. 0, 1, 2 Generation 이 존재하고 Threshold는 해당 Generation의 객체 수의 임계값을 뜻한다. 밑과 같이 출력을 하면 현재 객체 수와 Threshold 값을 확인할 수 있다.

```python
print(gc.get_count())
print(gc.get_threshold())

# 응답
(254, 9, 1)
(700, 10, 10)
```


:::info
Generation을 이렇게 나눈 이유는 0세대에서 더 많은 gc가 일어난다는 통계적인 결과가 있기 때문이다. 밑의 링크를 통해 해당 근거를 확인할 수 있다.

https://plumbr.io/handbook/garbage-collection-in-java/generational-hypothesis
:::

<br/>

### 동작 방식

Generational Garbage Collection은 객체가 생성될 때 0 Generation count가 +1 이 되고 메모리 해제될 때 -1이 된다. 그리고 0 Generation count 가 0 Threshold에 도달했을 때, 객체는 1 Generation 으로 이동되고 1 Generation count 가 +1 된다. 그리고 1 Generation count도 마찬가지로 Threshold 이상이 되면 2 Generation 으로 객체가 이동되면서 2 Generation count 가 +1 된다. 말만해서는 모르기 때문에 실제로 확인해보았다.

```python
print(gc.get_threshold())

li = []
for i in range(2000):
    li.append([])
    print(gc.get_count())
    li.pop()
    
# 응답
(700, 10, 10)
(254, 9, 1)
(255, 9, 1)
...
(700, 9, 1)
(0, 10, 1)
(1, 10, 1)
...
(144, 0, 2)
(145, 0, 2)
```



응답이 2000개라서 줄여서 남겼다. 하지만 딱 이 응답으로만 봐도 이해가 된다. 객체가 쌓여서 0 Generation이 700개가 된 후 gc 트리거가 되고 2 Generation count +1 과 함께 0 Generation count가 0이 되어버리는 것이다.


:::caution
* 1, 2 Generation count는 Threshold가 10이라면 11까지 존재하게 되고 12가 되는 순간 트리거된다. 0 Generation의 Threshold 보다 +1 이라고 보면 된다.
* 객체 수는 Container 객체만이 다른 객체에 대한 참조를 보유할 수 있어, 순환참조를 할 수 있으므로 Container 객체만 센다.
:::

<br/>

### 순환참조 감지

순환참조를 감지하기 위해서 파이썬에서는 모든 컨테이너 객체를 추적한다. 객체 내부에 더블링크드리스트 링크를 구현해놓고 모든 객체를 이어버린다. 그렇게 모든 객체를 추적할 수 있는데, 추적하는 과정에서 각 컨테이너가 참조하고 있는 다른 컨테이너 객체를 찾고 참조되는 컨테이너에서 `Py_ssize_t gc_refs` 의 카운트를 줄인다. 이 카운트가 0이 되면 순환참조하고 있다는 것이 확인되기 때문이다. 그렇게 확인된 객체는 gc의 대상이 된다.

<br/>

## 더 나아가기 - 세 번째 의문점

밑의 코드에서 `new_object_count`의 숫자를 바꿔서 실행해보면 Reference count로 객체들이 사라지고, Generation 별로 객체들이 들어가서 메모리가 gc에 의해 해제되는 것 전체를 경험할 수 있다. 

```python
import gc

import psutil


new_object_count = 10 ** 5


def memory_test_second(i, b):
    a = [["df"] for i in range(new_object_count)]
    print(f"{i} - 2 Depth Variable Id: {id(a)}")
    print(f"{i} - 2 Depth Mem Size: {p.memory_info().rss}")
    print(gc.get_count())
    print(len(b))
    print()

    return id(a)


def memory_test_first():
    for i in range(10):
        a = [["dff"] for i in range(new_object_count)]
        print(gc.get_count())
        print(f"{i} - 1 Depth Variable Id: {id(a)}")
        print(f"{i} - 1 Depth Mem Size: {p.memory_info().rss}")
        memory_test_second(i, a)
        print()


p = psutil.Process()
print(f"Start Mem Size: {p.memory_info().rss}")
print()
memory_test_first()
print(f"End Mem Size: {p.memory_info().rss}")
```



그리고 위의 코드를 변형해서 실행시키면 이상한 점이 보인다. 똑같은 크기의 메모리를 써도 메모리가 증가되는 폭이 다르다는 것이다. 이는 파이썬 메모리 사용이 어떻게 되는가에 따라서 다를테지만, 메모리 관리를 어떻게 하는지 확실하게 알고 싶어지는 부분이다.

```python
import gc

import psutil


new_object_count = 10 ** 7


def memory_test_second(i, b):
    a = [str(i) for i in range(10)]
    print(f"{i} - 2 Depth Mem Size: {p.memory_info().rss + p.memory_info().vms}")
    print()

    return id(a)


def memory_test_first():
    a = []
    for i in range(10):
        a.append([str(i) for i in range(new_object_count)])
        print(f"{i} - 1 Depth Mem Size: {p.memory_info().rss + p.memory_info().vms}")
        memory_test_second(i, a[-1])
        print()


p = psutil.Process()
print(f"Start Mem Size: {p.memory_info().rss + p.memory_info().vms}")
print()
memory_test_first()
print(f"End Mem Size: {p.memory_info().rss + p.memory_info().vms}")
```

```python
# 의문의 로그, gc는 실행되지도 않았는데, 메모리가 상승률이 일정하지 않다.
Start Mem Size: 35493257216

0 - 1 Depth Mem Size: 36883374080
0 - 2 Depth Mem Size: 36883378176


1 - 1 Depth Mem Size: 38401445888
1 - 2 Depth Mem Size: 38401445888


2 - 1 Depth Mem Size: 39784177664
2 - 2 Depth Mem Size: 39784177664


3 - 1 Depth Mem Size: 41166675968
3 - 2 Depth Mem Size: 41166675968


4 - 1 Depth Mem Size: 42540818432
4 - 2 Depth Mem Size: 42540822528


5 - 1 Depth Mem Size: 43923517440
5 - 2 Depth Mem Size: 43923517440


6 - 1 Depth Mem Size: 44272222208
6 - 2 Depth Mem Size: 44272222208


7 - 1 Depth Mem Size: 44716597248
7 - 2 Depth Mem Size: 44716597248


8 - 1 Depth Mem Size: 45268131840
8 - 2 Depth Mem Size: 45268140032


9 - 1 Depth Mem Size: 45562396672
9 - 2 Depth Mem Size: 45562085376


End Mem Size: 35670532096
```

이에 대한 답은 [3가지 의문점 정리](#3가지-의문점-정리)에서 확인할 수 있다.

<br/>



## 3가지 의문점 정리

1. Reference count 가 0이 되면, 리스트 안의 요소들은 삭제되지만, 리스트 자체는 살아있다. 이것이 무엇을 뜻할까?
2. int나 str의 참조값은 1이 아닌 3으로 나오는 걸까?
3. Python 메모리 관리를 어떻게 하는지 확실하게 알 수 없었다.


---

**1. Reference count 가 0이 되면, 리스트 안의 요소들은 삭제되지만, 리스트 자체는 살아있다. 이것이 무엇을 뜻할까?**

파이썬은 reference count가 0이 되면 해당 데이터를 메모리에서 즉시 해제하는 것이 아니라, free 표시를 해놓고 나중에 해제한다. 이 때문에 잔존 데이터가 남아있을 수 있고, 해당 데이터를 id 값을 통해 접근할 수 있는 것이다. 하지만 실제로 사용할 순 없다. 그리고 사용하게 된다면 파이썬의 제대로된 메모리 사용법이 아니라서 오류가 날 수 있다. 밑은 이러한 오류의 예시이다.

``` python
import ctypes


def test() -> int:
    a = [1, 2, 3]
    return id(a)


tmp_id = test()
li = []
for i in range(2000):
    li.append("?")

print(ctypes.cast(tmp_id, ctypes.py_object).value)

# 응답
["?", "?", "?", "?", ...]
```

위의 코드는 test() 안의 리스트를 출력하려고 메모리 위치를 지정하여 데이터를 불러냈지만, 실상 데이터는 `li` 의 리스트값이 나오게 된다. 이렇게 사용하는 것을 권장하지 않는다는 내용도 있으니, free 표시를 하는 메모리 주소 값을 굳이 사용해서 파이썬을 혼란스럽게 하지 말자.

---

**2. int나 str의 참조값은 1이 아닌 3으로 나오는 걸까?**

이는 파이썬의 `sys.getrefcount()` 해당 함수 때문이다. 해당 함수를 쓸 때, Immutable 객체는 함수에서 참조 값이 2개 생기게 되고, 이를 통해 3이라는 결과가 나오는 것이다. 그러므로 `sys.getrefcount()` 를 통해서 생기는 사이드 이펙트를 조심하며 실제 운영코드에서 이러한 참조 값을 해당 함수로 확인하며 쓰는 것은 위험하다.


---

**3. Python 메모리 관리를 어떻게 하는지?**

파이썬 메모리 관리는 GC와 Reference Count 말고도 메모리 소모가 작은 객체들은 실제로 해제하지 않고 나중에 다시 사용하는 메모리 풀링 관리기법을 사용한다. 또한, 메모리 지연 로딩을 통해 큰 메모리를 효율적이고 최적화하며 쓸 수 있다. 지연 로딩은 우리가 흔히 아는 `range` 같은 것을 의미한다.

---

<br/>
