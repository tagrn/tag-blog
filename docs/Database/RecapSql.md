---
sidebar_position: 1
description: 개발자에겐 필수! SQL 기본문법에 대해 알아본다.
---

# SQL 가본문법

## SELECT

:::info
데이터를 조회할 때 쓰는 문법
:::

<br/>

data라는 테이블의 모든 데이터를 출력할 때, 밑과 같이 쓴다. `*`는 모든 컬럼을 뜻한다.

```sql
SELECT *
FROM data;
```

<br />

하지만 이렇게 기본적으로만 쓰지 않는다. SELECT는 거의 필연적으로 WHERE이라는 구문이 따라온다. 예를 들어, data라는 테이블에 밑과 같이 데이터가 있다고 치자.

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|

name이 "taewan"이라는 로우를 뽑을 때는 밑과 같이 WHERE 절을 쓸 수 있다.

```sql
SELECT *
FROM data
WHERE name="taewan";
```
**결과**

|id|human|name|
|---|---|---|
|1|	True|	taewan|

<br />

여기서 name만 보고싶다면 밑과 같이 지정해 줄 수 있다.

```sql
SELECT name
FROM data
WHERE name="taewan";
```
**결과**

|id|
|---|
|1|

<br />

## INSERT
:::info
데이터를 삽입(추가)할 때 쓰는 문법
:::

<br />


|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|

위 테이블에서 새로운 로우를 추가해 보자. 대표적으로 두가지 방법이 있다.

```sql
INSERT INTO data(id, human, name)
VALUES (3, True, Gutae);
```
```sql
INSERT INTO data
VALUES (3, True, Gutae);
```

**결과**

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | Gutae|

첫 번째처럼 컬럼을 명시해서 넣을 때는 필요없는 것은 안 넣을 수도 있다. 테이블 자체에 nullable이 명시되어있다면 해당 값이 `null`로 들어갈 수 있기 때문이다. 하지만 data라고 테이블만 쓸 때는 모든 것을 다 넣어주어야 한다. 그리고 id는 default autoincrease 설정이 되어 있다면 INSERT시 넣지 않아도 된다.

<br />

## UPDATE

:::info
데이터를 수정할 때 쓰는 문법
:::

<br />

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | Gutae|

위 테이블에서 데이터 수정을 해보자. 3번 데이터의 name이 다른 데이터와 다르게 첫 문자가 대문자이다. 다른 데이터와 같게 소문자로 만들어보자.

```sql
UPDATE data
SET name = "gutae"
WHERE id = 3;
```
**결과**

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | gutae|

여기 쿼리문을 보면 UPDATE 뒤에는 테이블이 존재하고 SET 뒤에는 바꿀 컬럼을 지정한다. 근데 컬럼만 지정하면 어떤 데이터를 바꿀지 모르니 WHERE문이 따라와 지정해준 로우만 바뀌도록 해준다.

<br /> 

## DELETE

:::info
데이터를 삭제할 때 쓰는 문법
:::

<br />

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | gutae|

위의 테이블에서 3번 데이터를 지워보자.

```sql
DELETE FROM data
WHERE id = 3;
```

**결과**

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|


여기서 보면 DELETE는 FROM과 함께 온다. 왜냐하면 DELETE를 하려는데 어느 테이블에서 삭제를 할지 알아야하기 때문이다. 하지만 저렇게만 쓰면 어떤 행을 삭제시켜야 할지 모르기 때문에 WHERE절을 통해 제한시켜 준다.

<br />

## 논리 연산, 비교 연산
:::info
WHERE절에서 데이터를 논리, 비교 연산하는 방법
:::

부등호로 표현할 수 있는 연산은 `=`, `>`, `<`, `>=`, `<=`, `<>` `!=`가 있다. 여기서 제일 신기한 부등호가 보이는데, 바로 `<>`이다. 이 부등호는 `!=`와 같은 역할을 한다. (즉, "다르다"라는 비교연산) 또한, 부등호는 문자열도 연산가능 하다.

밑에 쓰는 예시가 있다.

**5보다 큰 id 값을 가진 데이터 찾기**
```sql
SELECT *
FROM data
WHERE 5 > id;
```

**name의 첫 글자 "D"보다 큰 것을 찾기**
```
SELECT *
FROM data
WHERE "D" < name;
```
**결과 - "D"보다 큰, 즉 "A", "B", "C", "D"로 시작하는 이름빼고 모두 불러오게 된다.**

<br />

논리연산은 OR와 AND를 지원한다. 밑과 같이 기본적인 논리연산을 따라 쓰면 된다.
```
SELECT *
FROM data
WHERE id < 3 AND "D" < name;
```

<br />

## JOIN

:::info
다른 테이블과 합쳐서 결과를 보여줄 때 쓰는 문법
:::

<br />

JOIN은 크게 INNER JOIN, OUTER JOIN으로 나뉘고, OUTER JOIN에서도 RIGHT, LEFT, FULL 로 나뉜다.

### INNER JOIN

둘 사이에 서로 조건이 맞는 결과만 보여준다.

```sql
SELECT *
FROM TableA A
INNER JOIN TableB B
ON A.key = B.key;
```

### RIGHT OUTER JOIN

JOIN 뒤에 쓴 테이블의 로우에 우선적으로 맞춘 결과를 보여준다. 즉, 밑의 쿼리에서는 테이블 B는 무조건 다 나오게 된다는 말이다.

``` sql
SELECT *
FROM TableA A
RIGHT JOIN TableB B
ON A.key = B.key;
```

### LEFT OUTER JOIN

FROM 뒤에 쓴 테이블의 로우에 우선적으로 맞춘 결과를 보여준다. 즉, 밑의 쿼리에서는 테이블 A는 무조건 다 나오게 된다는 말이다.

```sql
SELECT *
FROM TableA A
LEFT JOIN TableB B
ON A.key = B.key;
```

### FULL OUTER JOIN

두 테이블의 모든 로우에 맞춰 결과를 보여주게 된다.

```sql
SELECT *
FROM TableA A
FULL OUTER JOIN TableB B
ON A.key = B.key;
```

<br />

[SQL Joins Visualizer](https://sql-joins.leopard.in.ua/)에서는 시각적으로 JOIN을 쉽게 설명해준다. JOIN을 처음 배운다면 이걸로 공부하면 쉽게 이해할 수 있다.

<br />

## UINON

:::info
쿼리의 결과를 합쳐주는 문법
:::

<br />

밑과 같이 둘의 결과를 합치면 위의 쿼리 결과와 밑의 쿼리 결과가 합쳐져서 결과가 생성된다.

```sql
SELECT *
FROM data
WHERE id < 3 AND "D" < name

UNION

SELECT *
FROM data
WHERE id >= 3 AND "D" >= name;
```
**원래 테이블**

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | gutae|

**유니온 쿼리 결과**

|id|human|name|
|---|---|---|
|3| True | gutae|


:::caution
해당 쿼리의 결과는 data 테이블 전체 조회한 결과와 다르다. AND의 성질을 잘 생각하고 쿼리를 보면 알 수 있고 헷갈리지 말자.
:::

<br />

## ORDER BY

:::info
쿼리 결과의 순서와 개수 제한을 하는 문법
:::

<br />

오름차순과 내림차순을 ASC, DESC 라고 꼭 외우는게 필요하다. 해당 두 가지만 외우고 원하는 컬럼으로 정렬하면 된다.

```
SELECT *
FROM data
ORDER BY name DESC;
```

위의 쿼리 결과는 이렇게 하면 "name" 컬럼을 기준으로 data의 전체 조회결과가 생기게 된다.

**원래 테이블**

|id|human|name|
|---|---|---|
|1|	True|	taewan|
|2|	False|	wantae|
|3| True | gutae|

**정렬 쿼리 결과**

|id|human|name|
|---|---|---|
|2|	False|	wantae|
|1|	True|	taewan|
|3| True | gutae|

<br />

## LIMIT

:::info
쿼리 결과의 개수 제한을 하는 문법
:::

밑의 쿼리를 보면 LIMIT 1이라고 되어있다. 이는 결과가 한개만 나오도록 하는 것이다.

```
SELECT *
FROM data
ORDER BY name DESC
LIMIT 1;
```

**결과**

|id|human|name|
|---|---|---|
|2|	False|	wantae|

<br />

##  집계함수

:::info
다용도로 활용되는 집계함수들
:::

집계함수는 대표적으로 COUNT, SUM, AVG, MAX, MIN이 있다. 함수가 영어 뜻대로 따온거라 쉽게 짐작이 가능하다.

* COUNT는 지정한 컬럼에서 해당 조건의 로우 수를 출력한다.
* SUM은 지정한 컬럼에서 해당 조건의 로우 데이터의 합을 출력한다.
* AVG는 지정한 컬럼에서 해당 조건의 로우 데이터의 평균을 출력한다.
* MAX는 지정한 컬럼에서 해당 조건의 로우 데이터의 최댓값을 출력한다.
* MIN는 지정한 컬럼에서 해당 조건의 로우 데이터의 최솟값을 출력한다.

집계함수는 GROUP과 많이 활용되며, 이중 셀렉트문을 사용하여 쓰여지기도 한다.

```sql
SELECT MAX(id)
FROM data;
```

**결과**

|MAX(id)|
|---|
|3|

컬럼이 MAX(id)처럼 나오기 때문에 as 구문으로 원하는 이름의 컬럼으로 바꾸어 주어도 되고 해당 쿼리를 그냥 조건으로 쓰는 경우도 많다.

<br />

## GROUP 

:::info
집계함수에서 쓰는 컬럼별로 그룹을 지정해주는 문법
:::

<br />

GROUP을 지정해서 집계함수로 SUM, COUNT 등을 할 수 있다.

```
SELECT name, COUNT(*) as count
FROM data
GROUP BY name
HAVING count >= 2;
```

쿼리 결과로는 같은 이름을 가진 사람이 2명이상 있는 사람들만 나오게 된다. HAVING은 GROUP뒤에 나오는 명령어인데, WHERE과 비슷하다고 생각하면 편하다. WHERE이 FROM에 있는 테이블의 전체에서 조건을 걸어준다면, HAVING은 GROUP안에서 조건을 걸어주는 역할이다.

:::tip
프로그래머스 "동명 동물 수 찾기" 문제를 풀어보시면 쉽게 이해 가능
:::

<br />

## DISTINCT

:::info
중복 결과를 없애주는 문법
:::

<br />

|id|human|name|
|---|---|---|
|1| True | gutae|
|2| False | gutae|

위의 테이블에서 밑과 같이 쿼리를 치게 되면 name이 중복되는 결과는 결과에서 지워서 출력하게 된다.

```sql 
SELECT DISTINCT name
FROM data;
```

**결과**

|name|
|---|
| gutae|


<br />

## NULL

:::info
데이터가 없다는 걸 표현할 때 쓰는 문법
:::

NULL은 해당 로우, 컬럼의 데이터에 값이 없는 경우를 뜻합니다. 기본적으로 프로그래밍을 하면 `null`, `undefined`, `nil`, `None` 등을 접할 수 있는데, 여기서 새로 다루는 이유는 SQL에서 NULL 연산이 조금 다르게 작동하기 때문이다.

밑처럼 `=` 연산으로 조건을 구분하는 것이 아니라 `is`와 `is not`으로 구분한다.

```sql
SELECT *
FROM data
WHERE name is null;
```

```sql
SELECT *
FROM data
WHERE name is not null;
```

헷갈릴 수 있는 부분이니 조심하면 좋을 듯 하다.

<br />