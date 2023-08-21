---
sidebar_position: 4
description: 파이썬 클린코드 챕터 4 요약
---

# Ch.04 SOLID 원칙

:::note
SOLID는 객체 지향의 핵심 원칙들이다.
:::

<br/>

## 단일 책임 원칙

단일 책임 원칙(Single Responsibility Principle)은 컴포넌트가 단 하나의 책임을 져야한다는 것이다.

기본적으로 책임을 분산하지 않고 한 클래스에 여러 기능을 섞어서 작성하는 것을 말하며 이를 통해 쉬운 리팩토링과 재사용성을 높일 수 있으며, 추상화를 하기 쉽게 된다.

<br/>

## 개방/폐쇄 원칙

개방/폐쇄 원칙(Open/Close Principle)은 모듈이 수정에는 폐쇄되고 확장에는 개방되어야 한다는 것이다.

클래스를 작성했다면 안의 로직을 수정하지 않으면서 새로운 요구사항에 잘 적응할 수 있어야 한다. 이는 다형성의 효과적인 사용과 밀접한 관계를 가지며, 유지보수 측면에서 큰 장점이 될 수 있다.

<br/>

## 리스코프 치환 원칙

리스코프 치환 원칙(Liskov Substitution Principle)은 상위 타입 객체가 하위 타입 객체로 변환할 수 있어야 한다는 것이다.

타입이 자유로운 파이썬의 경우, 이런 부분을 잡기 어렵고 타입힌트를 사용한다 하더라도 모두 잡을 수 있진 않기 때문에 상황에 맞게 코드를 짜는 것이 중요하다. 그리고 이것 말고도 이런 두 가지 원칙은 지키는 것이 좋다.

* 하위 클래스는 부모 클래스에 정의된 것보다 사전조건을 엄격하게 만들면 안 된다.
* 하위 클래스는 부모 클래스에 정의된 것보다 약한 사후조건을 만들면 안 된다.

이 원칙을 통해 올바른 다형성을 지킬 수 있고, 계층 확장에 도움이 된다.

<br/>

## 인터페이스 분리 원칙

인터페이스 분리 원칙(Interface Segregation Principle)은 너무 큰 인터페이스를 가지지 않고 적당히 인터페이스를 짜라는 말이다.

정말 기능에 맞게 상황에 맞게 인터페이스를 구현하고 클래스를 끼워서 사용해야 한다. 이는 확장성에 도움을 주며, 단일 책임의 원칙에도 조금 포함되는 부분으로 보인다.

<br/>

## 의존성 역전

의존성 역전(Dependency Inversion Principle)은 개발자가 의존성을 관리하지 말고 시스템적으로 관리하자는 것이다.

강한 의존성은 언제나 문제가 되어왔고, 이를 없애기 위해서 프레임워크 단에서 의존성을 관리해주는 것이다. 그렇기 때문에 개발자는 의존성을 관리하지 않고, 시스템에서 가져와 주입시키면 되는 형태로 발전되었다. 대표적인 예가 Spring이다.

<br/>