---
sidebar_position: 6
description: 파이썬 클린코드 챕터 6 요약
---

# Ch.06 디스크립터로 더 멋진 객체 만들기

:::note
`__get__`, `__set__`, `__delete__`, `__set_name__` 중 하나라도 포함하는 클래스를 모두 디스크립터라고 부른다.


**장점**

* Properties 는 해당 클래스에 get, set 로직을 작성해야하지만, 새로운 디스크립터 클래스를 만들면 디스크립터 클래스에서 해당 로직 구현이 가능하다.
* 몇몇 클래스가 Properties 로직이 같다면 재사용성이 높아진다.

**단점**

* get, set, delete 를 변경하는 것이다 보니 새로운 팀원이 왔을 때, 자기 생각대로 동작하지 않는 코드를 볼 수도 있다.
  * 내 관점으로는 빌트인 메소드는 굳이 건들지 않는게 좋아보인다.
  * `@dataclasses` 만을 사용하는 이유가 이런거라고 생각한다.
* 하나의 클래스만 만들 경우에는 Properties 보다 많은 코드를 짜야할 수도 있다.
* 전역에 설정된 디스크립터는 의도치 않게 덮어씌워질 수 있다.
:::

<br/>


## 디스크립터 작성해보기

밑의 예시처럼 작성하고 get, set, delete 를 커스텀 할 수 있다.

```python
class Descriptor:
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__[self._name]

    def __set_name__(self, owner, name):
        self._name = name

    def __set__(self, instance, value):
        instance.__dict__[self._name] = value

    def __delete__(self, instance):
        instance.__dict__[self._name] = None


class Student:
    grade = Descriptor()

    def __init__(self):
        self.grade = 30


student = Student()
print(student.grade)
student.grade = 20
print(student.grade)
del student.grade
print(student.grade)

# 응답
30
20
None
```



완전 쉬운 커스텀 예 하나를 보여주자면 밑과 같은데, 원래 값에 -1을 해서 보여준다.

```python
class Descriptor:
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__[self._name] - 1

    def __set_name__(self, owner, name):
        self._name = name

    def __set__(self, instance, value):
        instance.__dict__[self._name] = value

    def __delete__(self, instance):
        instance.__dict__[self._name] = None


class Student:
    grade = Descriptor()

    def __init__(self):
        self.grade = 30


student = Student()
print(student.grade)

# 응답
29
```



하지만 이런 코드는 부적절하다. 왜 일까?

잘 생각해보자. 이 코드에서 에러가 날 수 있는 코드는 - 1 이 부분이다. Grade 의 값이 None 이 되어버리면 -1 연산을 할 수 있을까? 바로 에러가 나게 될 것이다. 그렇기 때문에 커스텀하는 것은 주의해서 해야 한다.

```python
# 에러 날 상황
del student.grade
print(student.grade)
```



Descriptor는 전역으로 설정되어 있다. 이러면 또 어떤 문제가 일어날까? 밑의 코드를 보면 확실하게 알 수 있다. 밑의 코드에서 Descriptor는 선언되었지만 `Student.grade = 1` 코드에 의해 덮어 씌워졌다. 그러면 이제 이 코드는 디스크립터를 아무리 고치더라도 의도치 않은 동작만 하게 되는 것이다.

```python
class Descriptor:
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__[self._name] - 1

    def __set_name__(self, owner, name):
        self._name = name

    def __set__(self, instance, value):
        instance.__dict__[self._name] = value

    def __delete__(self, instance):
        instance.__dict__[self._name] = None


class Student:
    grade = Descriptor()

    def __init__(self):
        self.grade = 30


Student.grade = 1
student = Student()
print(student.grade)

# 응답
30
```



마지막으로 주의할 점은 Desciptor는 하나이기 때문에 `__set_name__` 메서드가 없고 `__dict__` 메서드를 같이 사용하지 않으면 예상치 못한 동작을 볼 수 있으니 조심하자. 한 가지 예시는 밑과 같다. 

```python
class Descriptor:
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.grade

    def __set__(self, instance, value):
        instance.grade = value


class Student:
    grade = Descriptor()

    def __init__(self):
        self.grade = 30

student = Student()
print(student.grade)

# 응답
Traceback (most recent call last):
  File "/Users/taewangu/PycharmProjects/xxx/main.py", line 17, in <module>
    student = Student()
              ^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/xxx/main.py", line 15, in __init__
    self.grade = 30
    ^^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/xxx/main.py", line 8, in __set__
    instance.grade = value
    ^^^^^^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/xxx/main.py", line 8, in __set__
    instance.grade = value
    ^^^^^^^^^^^^^^
  File "/Users/taewangu/PycharmProjects/xxx/main.py", line 8, in __set__
    instance.grade = value
    ^^^^^^^^^^^^^^
  [Previous line repeated 994 more times]
RecursionError: maximum recursion depth exceeded
```

<br/>

## 추가 지식

* 비데이터 디스크립터는 `__get__` 메서드만 가지는 것을 뜻한다.
* 데이터 디스크립터는 `__set__`, `__delete__` 메서드를 가지는 것을 뜻한다.
* 슬롯 `__slots__` 메서드를 통해서 `__dict__` 대신 데이터를 저장할 수 있게 한다.
  * 하지만 동적으로 데이터를 추가하는 등의 작업을 할 수 없고, 동적으로 변하지 않는대신 메모리를 적게 사용한다.

<br/>

:::info
_**참고사항**_
https://wikidocs.net/168363
https://docs.python.org/ko/3/howto/descriptor.html
:::

<br/>