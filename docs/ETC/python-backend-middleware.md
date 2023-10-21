---
description: 파이썬의 WSGI와 ASGI를 알아보자
---

# WSGI & ASGI

파이썬 백엔드를 설계하기 위해서 필요한 미들웨어

## 목표

* FastAPI를 제대로 설계하기 위한 기초지식 쌓기


## WSGI & ASGI

 파이썬 웹 서비스는 WSGI를 통해 서비스를 제공했다. 파이썬 어플리케이션이 기존의 Web Server와 호환이 안 되지만 서버 게이트웨이 인터페이스를 미들웨어로 두어 해결했다. 하지만 이는 여러 가지 문제점이 있었고 ASGI가 나오게 되었다.

### WSGI 문제점

* 단일 동기 호출 인터페이스
* 웹소켓 어려움
* 비동기 미지원 - 현재는 지원

이 세 가지는 거의 하나의 문제라고 봐도 된다. 현대의 대량 트래픽에 맞지 않는 스펙이기 때문이다. 단일 동기 호출 인터페이스는 여러 패스를 가져야하는 요청을 처리하지 못 하고, 웹 소켓을 어떻게 지원한다고 하긴 하는데 비공식적인 방법이라고 한다. 비동기는 미지원이라고 나오지만, 현재 WSGI 미들웨어들이 비동기를 지원한다. 계속 발전을 하고 있으면서 ASGI와 공존하고 있다.



### ASGI

 위의 문제점을 확실하게 해결한 것이 ASGI이다. 단일 비동기 호출 인터페이스를 가지고 웹소켓과 비동기를 지원하여, 현대의 대량 트래픽을 견디고 빠르게 요청을 처리할 수 있게 한다. WSGI의 상위집합이기 때문에 ASGI에 WSGI를 추가하는 것은 쉽다. `asgiref` 이 라이브러리를 참고하면 된다고 한다.



> 참고: https://asgi.readthedocs.io/en/latest/introduction.html <br/>
> 참고2: https://www.python.org/dev/peps/pep-3333/


<br/>

## Uvicorn & Gunicorn

둘 다 파이썬으로 만들어진 미들웨어이다.

### Gunicorn

 파이썬 3.5 버전 이상에서 설치 가능하며, WSGI기반이다. 비동기 작업도 가능하지만 Uvicorn보다 느리다.

 `workers = multiprocessing.cpu_count() * 2 + 1` 워커지정도 가능하며 여러 설정들을 공식문서에서 확인할 수 있다.

 사용하게 된다면 공식문서를 참고하여 Uvicorn과 함께 주요 옵션들을 사용해볼만 할 것 같다.

> 참고: https://docs.gunicorn.org/en/latest/install.html



### Uvicorn

 Uvicorn은 ASGI로써, Asyncio를 통해 비동기 데이터를 주고 받아 비동기를 지원하는데, Cython으로 만들어진 Uvloop를 사용하여 Asyncio의 내장 이벤트 루프를 대체하여 nodejs보다도 빠른 비동기를 지원한다. 이 성능은 거의 Golang에 필적한다고 한다.

:::info
혹시 비동기를 잘 모르겠다면 https://www.youtube.com/watch?v=m0icCqHY39U를 참고하면 빠르게 이해 가능하다.
:::


#### 알아둘 점

* 현재 `HTTP/2`에 대한 지원되지 않는다.
* 환경에 맞게 추가옵션이 있는 `uvicorn`을 설치하는 방법: `pip install uvicorn[standard]`
  * 그냥 `pip install uvicorn`를 하게되면 `uvloop`는 설치되지 않는다고 한다.
* `httptools` 라이브러리를 통해 `http` 프로토콜을 처리한다.
* `--reload`옵션을 통해 개발모드로 사용할 수 있다.
* 프로덕션 배포의 경우 `gunicorn`과 함께 사용하는 것을 권장한다.
  * 그래도 오래되고 완전한 기능을 갖춘 것이 `gunicorn`이기 때문이다.
  * 예) `gunicorn example:app -w 4 -k uvicorn.workers.UvicornWorker`
* `receive` , `send`를 통해 여러 메세지를 보내 스트리밍할 수 있다.
* `daphne`, `hypercorn` 이라는 다른 ASGI 미들웨어도 있다.
  * `daphne`는 원래 장고를 위한 미들웨어로 만들어졌었다.
* 사용되는 프레임워크
  * `starlette`
  * `django`
  * `quart`
  * `fastAPI`
  * `BlackSheep`

> 참고: https://www.uvicorn.org/

<br/>
