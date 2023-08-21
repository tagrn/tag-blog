---
sidebar_position: 2
description: 파이썬 클린코드 챕터 2 요약
---

# Ch.02 Pythonic Code

## 인덱스와 슬라이스

Sequence 인터페이스를 통해 인덱스와 슬라이스를 구현할 수 있다. 밑과 같이 `__len__`, `__getitem__` Magic Method를 구현해주면 밑의 `ch2` 라는 클래스가 시퀀셜한 객체로 생성될 수 있다는 것이다.

``` python
from collections.abc import Sequence


class ch2(Sequence):
    def __init__(self, *values):
        self._values = list(values)

    def __len__(self):
        return len(self._values)

    def __getitem__(self, item):
        return self._values.__getitem__(item)


print(ch2(1, 2, 3)[:2])
print(ch2(1, 2, 3)[1])

# 응답
[1, 2]
2
```

### 범위 슬라이싱의 특징

Iterable 객체를 범위 슬라이싱하면 해당 Iterable 타입의 객체가 나온다. 리스트를 슬라이싱하면 리스트가 나오고, 튜플을 슬라이싱하면 튜플이 나온다는 이야기이다. 물론 range도 슬라이싱하면 range가 나온다.

ex. `range(1, 10)[:-1] -> range(1, 9)`

<br/>

## 컨텍스트 관리자

컨텍스트 관리자는 사전 조건과 사후 조건이 있는 작업에 매우 유용한 기능이다. 일반적으로 try - finally / with 구문을 쓸 수 있는데, with 구문이 깔끔하고 close를 명시하지 않아도 실행되기 때문에 사용하면 좋다. 밑의 예시는 sqlalchemy 에서 자주 사용하는 db session 가져오는 구문이다. 이런 형식을 쓸 수 있게 된다.

```python
# with
def get_db():
    with (SessionLocal()) as db:
        yield db

# try - finally
def get_db():
    db = db_session()
    try:
        yield db
    finally:
        db.close()
```

<br/>

### 필수 매직메서드

컨텍스트 관리자 클래스를 변경할 때, `__enter__`과 `__exit__`을 커스텀하면 되는데, 이는 진입과 종료를 나타내는 매직 매서드이기 때문이다. 그렇다면 컨텍스트 관리자의 `__exit__` 메서드를 변형시켜보자. 

먼저 기본적으로 WOW라는 클래스를 하나 만들어서 실행시켜 본다. 그러면 value는 5 -> 6 -> 0 순으로 생성되게 된다. 

```python
class WOW:
    def __init__(self):
        self.value = 5

    def __enter__(self):
        self.value += 1
        return self

    def __exit__(self, exc_type, ex_value, ex_traceback):
        self.value -= 6

with WOW() as num:
    print(num.value)
print(num.value)

# 응답
6
0
```



여기서 `__exit__`을 - 1로만 변형시키게 되면 그대로 첫 숫자 5가 나오게 된다.

```python
class WOW:
    def __init__(self):
        self.value = 5

    def __enter__(self):
        self.value += 1
        return self

    def __exit__(self, exc_type, ex_value, ex_traceback):
        self.value -= 1

with WOW() as num:
    print(num.value)
print(num.value)

# 응답
6
5
```

<br/>

### contextlib contextmanager

contextlib 라이브러리를 사용하여 만들 수도 있는데, yield 를 기준으로 앞단은 `__enter__`, 뒷단은 `__exit__`이 구현된다고 보면 된다. 이는 간결하게 쓰일 수 있어서 좋다. 컨텍스트 관리자를 밑과 같이 구현해 볼 수 있다.

```python
from io import FileIO
import contextlib


@contextlib.contextmanager
def open(path, *args, **kwargs):
    file = FileIO(path, *args, **kwargs)
    try:
        yield file
    finally:
        file.close()

with open("/Users/taewangu/Downloads/image.png") as fd:
    print(fd.closed)
print(fd.closed)

# 응답
False
True
```



그렇다면 close를 시키지 않아보면서 어떻게 실행되는지 확인해보자. 응답은 False, False가 나오게 되고 file은 계속 open 상태가 유지된다. 이처럼 메서드형식으로 컨텍스트 관리자를 구현할 수 있다.

```python
from io import FileIO
import contextlib


@contextlib.contextmanager
def open(path, *args, **kwargs):
    file = FileIO(path, *args, **kwargs)
    try:
        yield file
    finally:
        pass

with open("/Users/taewangu/Downloads/image.png") as fd:
    print(fd.closed)
print(fd.closed)

# 응답
False
False
```



사실 이 open은 빌트인 메서드로 이렇게 원래 사용되지만 위와 같이 오버라이딩하여서 테스트해 보았다.

```python
with open("/Users/taewangu/Downloads/image.png") as fd:
    print(fd.closed)
print(fd.closed)

# 응답
False
True
```

<br/>

### contextlib suppress

suppress는 Exception을 무시할 때 사용한다. try - except + pass 구문을 사용할 수 있겠지만, 이런 것은 파이썬의 기능을 잘 활용하고 있다고 볼 수 없다. 예를 들어보자. 밑과 같은 구문이 있다면 우리는 Exception을 무시하는구나 생각할 수 있다. 

```python
try:
    print("pass")
    raise Exception
except(Exception):
	pass
print("pass")
```



하지만 contextlib suppress에는 더 좋은 방법을 제시한다. 밑의 구문을 보면 위와 같은 역할을 하게 해주는 구문이다. 위의 구문보다 훨씬 파이써닉한 구문이지 않은가? 개인적으로 이 구문이 더 깔끔하다고 생각한다. 

```python
with contextlib.suppress(Exception):
    print("pass")
    raise Exception
print("pass")
```

<br/>

## 컴프리헨션과 할당표현식

파이썬에는 컴프리헨션이라는 기능이 있었고 이는 코드량이 줄어들 뿐만 아니라 실행속도도 일반 for문보다 빠르다. 거기에 3.8 파이썬에는 할당 표현식이 추가되었다. 이는 if문, while문 등에 새로운 패러다임을 제공한다.



먼저 정규표현식을 따라 account_name을 찾는 함수가 있다고 치자. 그럼 밑과 같이 작성할 수 있을 것이다.

```python
accounts = ["lee", "hong", "kim", "hwang"]

def find_name(regex):
    ans = []

    for acc in accounts:
        matched = re.match(regex, acc)
        if matched is not None:
            ans.append((acc, matched))

    return ans

print(find_name(r"h[a-z]+"))
```



근데 컴프리헨션과 할당표현식을 쓴다면 밑과 같이 변경하는 것이 가능하다.

```python
accounts = ["lee", "hong", "kim", "hwang"] * (10**5)

def find_name(regex):
    return [
        (acc, matched) for acc in accounts
        if (matched := re.match(regex, acc)) is not None
    ]
    
print(find_name(r"h[a-z]+"))
```



이렇게 파이썬에는 코드를 간결하게 쓰는 기능인 컴프리헨션은 간결하기도 하고 일반 for문보다 성능이 좋다고 알려져 있기 때문에 유용하게 쓸 수 있다. 하지만 코드는 유지보수 측면에서는 심플하게 짜는게 좋기 때문에 간결함을 추구한다고 너무 보기 힘든 컴프리헨션은 지양해야 한다.

<br/>

## 프로퍼티, 속성과 객체 메서드의 다른 타입들

### 파이썬의 밑줄

파이썬의 밑줄은 특별한 의미를 가진다. 예를 들어 `_`가 하나 붙여진 메서드는 private 메서드라는 성격을 가지는 것이다. 그렇다고 해서 Java 처럼 밖에서 접근이 아예 안되는 것은 아니다. 그냥 그런의미를 가지고 있고, 개발자 스스로 그런 메서드의 연결성을 인지하고 리팩토링하라는 것이다.

```python
class Student:
    def __init__(self) -> None:
        self.grade = None

    def __init__(self, grade: str) -> None:
        self.grade = grade

    def _get_grade(self) -> Union[str, None]:
        return self.grade


student = Student("A")
# 밑과 같이 _로 시작하는 메서드는 클래스 밖에서 호출할 수 있지만 호출하지 말자.
print(student._get_grade())

# 응답
A
```



그리고 `__`처럼 언더스코어바를 2개를 붙인 경우에는 이름 맹글링이 된다. 예상과는 다른 메서드로 생겨나고 이는 개발자가 의도하지 않은 방향을 의미한다. 밑의 예제를 보면 다른 클래스이름이 붙은 다른 메서드 호출을 통해 `__`가 붙은 메서드가 실행되는 것을 확인할 수 있다.

```python
class Student:
    def __init__(self) -> None:
        self.grade = None

    def __init__(self, grade: str) -> None:
        self.grade = grade

    def __get_grade(self) -> Union[str, None]:
        return self.grade


student = Student("A")
## __get_grade 라고 메서드를 지었지만 실제로 만들어지는 메서드는 밑과 같다.
print(student._Student__get_grade())

# 응답
A
```

<br/>

### 프로퍼티

프로퍼티는 private 변수에 지정된 값에 대한 getter, setter 를 만드는 것과 같다. 밑과 같이 사용하여서 setting 시에 value validation을 진행할 수 있으니 잘 사용해보면 좋을 듯 하다.

```python
class Student:
    def __init__(self) -> None:
        self._grade = None

    @property
    def grade(self) -> Union[str, None]:
        return self._grade

    @grade.setter
    def grade(self, current_grade: str) -> None:
        if current_grade not in ["A", "B", "C", "D", "F"]:
            raise ValueError("Invalid Grade")
        self._grade = current_grade

student = Student()
# student.grade = "E" 로하면 ValueError가 일어난다.
student.grade = "B"
print(student.grade)

# 응답
B
```

<br/>

### dataclasses 모듈

위의 코드에서 `__init__`을 통해 변수를 지정하지만 파이썬에는 dataclasses 모듈이 있다. 그래서 밑과 같이 작성가능하다. majors가 field로 선언된 이유는 선언을 해버리면 참조하는 주소값이 들어가버리니까 객체가 서로 공유하게 되어버린다. 그러므로 파이썬에서는 아예 리스트 초기화를 선언하지 못하도록 막았고, 저렇게 field라는 것을 통해 객체가 생성될 때마다 초기화를 할 수 있게 한다.

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class Student:
    grade: str = None
    majors: List[str] = field(default_factory=list)


student = Student()
print(student.grade)
print(student.majors)

# 응답
None
[]
```



여기서 생성 당시에도 grade에 대한 validation을 할 수 있다. 이런 식으로 코드를 더 간결하게 짤 수 있지만, 어노테이션만으로 불가능한 복잡한 코드의 경우에는 `__init__` 사용을 권장하고 있다.

```python
@dataclass
class Student:
    grade: str = None
    majors: List[str] = field(default_factory=list)

    def __post_init__(self):
        if self.grade not in ["A", "B", "C", "D", "F"]:
            raise ValueError("Invalid Grade")


# student = Student(grade="E") 에러 남.
student = Student(grade="A")
print(student.grade)
print(student.majors)


# 응답
A
[]
```

<br/>

## 파이썬에서 유의할 점

**1. Mutable 파라미터 기본값을 쓰면 안된다.**

Mutable 한 파라미터 기본값을 쓰게 되면 해당 값이 처음 할당될 때는 잘 동작할지 몰라도, 해당 함수에서 처음 할당된 데이터를 손실시키면 그 손실은 다음 함수 실행까지 이어지게 된다.

**2. Built-in 타입은 확장시키면 안된다.**

Built-in 타입을 상속시켜서 사용할 경우, CPython 코드가 내부에서 연관된 부분을 모두 찾아서 업데이트 해주지 않는다. 예를 들어 매직메서드를 재정의했을 경우, 해당 재정의가 동작하지 않는 현상이 생기게 된다. 그러므로 collections 라이브러리 안에 있는 사용자 정의 타입을 상속받아 구현하자.

<br/>
