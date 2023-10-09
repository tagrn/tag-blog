---
description: setTimeOut, setInterval 비교
---

# setTimeOut vs setInterval

### 역할

* setTimeout - 일정 시간 후 한번 실행
* setInterval - 일정 시간마다 반복 실행

### 사용법

```js
var timeoutID = setTimeout(function[, delay, arg1, arg2, ...]);
var intervalID = setInterval(func, [delay, arg1, arg2, ...]);
```

### 예제

```js
// setInterval
function myCallback(a)
{
  alert(a);
}

setInterval(myCallback, 500, 'Parameter 1');

// setTimeout
function myCallback(a)
{
  alert(a);
}

setTimeout(myCallback, 500, 'Parameter 1');
```

### 주의 점

자바스크립트는 싱글 스레드이면서 비동기이다. 그럼 밑의 코드를 실행 시키면 어떻게 될까?

```js
function myCallback(a)
{
  alert(a);
}

fetch("http://127.0.0.1:8080")
    .then(res => {
        alert("실행");
    })
    .catch(e => {
        alert("에러")
    })

setTimeout(myCallback, 5000, 'Parameter 1');
```

서버를 만들어도 되고 아니면 그냥 에러만 봐도 된다. 해당 코드를 실행시키면 fetch의 결과 데이터부터 먼저 나오게 된다. 이는 setTimeout 시, 스레드가 비동기로 진행 된다는 것을 뜻한다.

즉, 콜백에 먼저 들어가 있지 않다는 것이므로 setTimeout도 나름의 WebAPI 개념으로 생각하고 쓰는 것이 좋다. fetch의 결과 데이터와 setTimeout의 결과 데이터 중 먼저 끝나는 것을 먼저 콜백큐로 들고 오게 된다.

> **참고 블로그**
> * https://wdevp.tistory.com/67
>
> **공식 문서**
> * https://developer.mozilla.org/ko/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
> * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval

<br/>
