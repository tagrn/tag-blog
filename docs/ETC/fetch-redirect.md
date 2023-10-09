---
description: fetch를 사용할 때, 페이지 리다이렉트를 시켜보자
---

# Fetch Redirect

### 크롬 변경사항

fetch를 사용할 경우 크롬 예전 버전에는 `{ redirect: 'follow'}` 옵션을 통해 리다이렉트가 되었는데, Chrome 버전 61.0.3163.100(공식 빌드)부터 **리다이렉트된 플래그와 URL 및 200 상태를 반환하고 자체 리다이렉트되지 않으며 사용에서는 window.location에 필요**하다라고 한다.

> **참고 url**
>
> https://velog.io/@adam2/2019-12-25-1512-%EC%9E%91%EC%84%B1%EB%90%A8 <br/>
> https://stackoverflow.com/questions/39735496/redirect-after-a-fetch-post-call

<br/>

### 해결방법

그러므로 밑의 형식으로 프론트에서 리다이렉트 요청을 받아 리다이렉트해야 한다.

```js
fetch(url)
  .then(response => {
      // HTTP 301 response
      // HOW CAN I FOLLOW THE HTTP REDIRECT RESPONSE?
      if (response.redirected) {
          window.location.href = response.url;
      }
  })
  .catch(function(err) {
      console.info(err + " url: " + url);
  });
```

:::info
**스택 오버플로우 답변 내용 중 발췌**: In SPA apps, redirect responses are unlikely, maybe this is the reason why ajax vendors apply little attention to this functionality.

즉, _'SPA 어플리케이션들은 굳이 redirect를 쓰지 않기 때문에 지원이 끊긴 것 같다'_ 라고 한다.
:::

<br/>
