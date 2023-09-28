---
description: 다용도로 사용할 수 있는 경량 웹 서버
---

# Nginx

:::info
**NGINX** is open source software for web serving, reverse proxying, caching, load balancing, media streaming, and more. It started out as a web server designed for maximum performance and stability. In addition to its HTTP server capabilities, NGINX can also function as a proxy server for email (IMAP, POP3, and SMTP) and a reverse proxy and load balancer for HTTP, TCP, and UDP servers.
:::

<br/>

**요약**: Nginx는 경량형 웹서버이며, 여러 프록시 서버, 로드밸런서 역할 등을 할 수 있는 오픈소스 소프트웨어이다.

해당 글에서는 백엔드 개발자가 Nginx에서 주로 사용하는 기능들을 알아본다.

---

## HTTPS

Nginx를 통해서 SSL 키를 인증하고 80, 443의 모든 요청들을 443의 HTTPS요청으로 바꿀 수 있다. SSL 키를 받는 방법은 다양하며, 그 중 하나는 letsencrypt를 이용하는 것이다. 밑의 명령을 통해 무료로 3개월짜리 openSSL키를 얻을 수 있다.

```bash
sudo apt-get install letsencrypt
# 인증서 발급
sudo letsencrypt certonly --standalone -d {도메인}
# 이메일 쓰고 Agree
# 뉴스레터 no
# 이제 인증서가 발급된다. 이 인증서를 잘보관하자
# 2가지 키가 발급되는데 이 두가지를 써야한다. 밑의 경로에 각각 하나씩 있다.
 /etc/letsencrypt/live/{도메인}/fullchain.pem;
 /etc/letsencrypt/live/{도메인}/privkey.pem;
```

하지만 3개월짜리를 받게 되면 3개월마다 갱신을 해주어야 하기 때문에 다른 방법을 찾아보거나 자동갱신하는 스크립트를 작성해야 한다. 다른 기업의 SSL 인증서는 무료가 아닐 뿐더러 보안 등급별로 가격차이가 심하게 나기 때문에 고민이 필요할 듯하다.

<br/>

### 인증서 자동 갱신

linux의 crontab을 사용하여 자동갱신을 할 수 있다. 먼저 crontab을 수정하는 창을 연다.

```
crontab -e
```

수정 창을 열어 밑의 명령어를 작성하고 저장해주면 된다. 주석으로 해당 명령들에 대해 설명해놓았다. 추가 설명으로는 자동 갱신할 일자는 원하는대로 설정하고, 로그의 경우 원하는 루트에 설정해놓으면 된다. 밑의 자동갱신으로는 매달 1일 1시 0분에 SSL 인증서가 갱신된다는 말이다. 갱신은 가상으로 해보는 `--dry-run`이라는 옵션도 있으니 활용해보면 좋다.

```bash
# 분 시간 일 * * ssl 인증서 갱신 >> 로그 남기기
0 1 1 * * sudo certbot renew >> /home/ubuntu/ssl-renew.log
```

:::warning
crontab의 시간은 UTC를 기준으로 한다. 서버의 시간을 Asia/Seoul 인 UTC+9으로 바꿔놓아도 UTC 기준으로 하니 명심하자.
:::

<br/>

### 유료 SSL 사용

- SSL 사이트
  - https://www.enterprisessl.com/
  - https://sslhosting.gabia.com/service
  - https://cert.crosscert.com/ssl-%EC%A0%95%EC%9D%98/
- SSL 보안 등급
  - DV: 도메인 소유권한 확인 후, 발급 심사 확인
  - OV: 회사 정보 서류까지 발급 심사 확인
  - EV: 회사 정보외 추가적인 확약 서류 제출 심사 확인
  - 참고: https://sslhosting.gabia.com/service/sslprocess

<br/>

### Nginx SSL 키 설정

SSL 키를 받으면 nginx에 설정시켜준다. 해당 키의 위치는 개발자가 알고 있어야 한다.

```nginx
server {
  ...

  ssl_certificate /etc/letsencrypt/live/{도메인}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{도메인}/privkey.pem;

  ...
}
```
:::note
Ubuntu 20.04 버전에서 letsencrypt로 SSL 키를 받게 되면 위와 같은 위치에 SSL 키를 받으니 참고하자.
:::

<br/>

## Load Balancer

로드 밸런서란 서버에 가해지는 부하를 분산하기 위한 장치이다. 하드웨어, 소프트웨어적으로 분산하며, 여러 방식의 분산 방법이 존재한다. nginx에서는 upstream을 통해 여러 서버로 분산가능하며 이에 대한 여러 옵션을 제공한다.

### 사용방법

Nginx 서버로 들어오는 요청들을 지정된 여러 서버로 분산한다.

```nginx
upstream backend {
  server order-1:8000;
  server order-2:8000;
  server order-3:8000;
  server order-4:8000;
}
```

### 로드밸런싱 알고리즘

1. Round Robin: nginx의 기본 설정 (설정할 필요가 없다.)
2. Least Connections: 활성화된 연결이 제일 작은 서버부터 부하시킨다.
  ```nginx
  upstream backend {
    least_conn;
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
  }
  ```

3. IP Hash: IP 값을 해시 값으로 바꾸어 해당 해시값을 통해 서버로 부하를 분산시킨다. 해시값들은 각각 어떤 서버로 갈지 지정된다.

  ```nginx
  upstream backend {
    ip_hash;
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
  }
  ```

4. Generic Hash: key 값을 해시 값으로 바꾸어 해당 해시값을 통해 서버로 부하를 분산시킨다. key 값의 소스는 IP, port, URI 등의 데이터로 이루어진다. 해시값들은 각각 어떤 서버로 갈지 지정된다.
  ```nginx
  upstream backend {
    hash $request_uri consistent;
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
  }
  ```

---

밑의 옵션들은 유료 서비스인 <u>**Nginx Plus**</u>에서만 사용가능하다.

5. Least Time: 평균 지연율과 현재 연결된 요청의 수를 고려하여 적합한 서버에 요청을 보낸다. 3가지 옵션이 있으며, `header` 는 데이터가 도착하자 말자 지연율을 측정하고 `last_byte`는 모든 데이터가 도착해야 지연율을 측정하며, `last_byte inflight` 는 불완전한 요청도 포함한 모든 데이터가 도착한 시간을 측정한다.

  ```nginx
  upstream backend {
    least_time header;
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
  }
  ```

6. Random: 랜덤한 서버를 선택하여 보낸다. 하지만 좀 더 랜덤의 방식을 향상시킬 수 있는데, 뒤에 옵션으로 `two` 를 붙이면 랜덤으로 2개가 선택되고 그 선택된 두 개중에서 앞서 배운 메소드들을 기준으로 요청할 수 있다. 시간과 횟수 기준으로 메소드를 지정하고 해당 메소드들은 `least_conn`, `least_time=last_byte`, `least_time=header;` 이렇게 3가지가 있다.

  ```nginx
  upstream backend {
    random two least_conn;
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
  }
  ```

> 참고 문서
> * https://www.nginx.com/resources/glossary/load-balancing/
> * https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/

### 옵션

1. weight

  ```nginx
  upstream backend {
    server order-1:8000 weight=5;
    server order-2:8000 weight=2;
  }
  ```

  서버마다 스펙이 다르므로 좋은 서버에는 큰 가중치를 두어 많은 트래픽이 가게 한다. 위 설정 기준으로 7개의 요청이 있다면 1서버에는 5개의 요청이 가고 2서버에는 2개의 요청이 간다.

2. keepalive

  ```nginx
  upstream backend {
    server order-1:8000;
    server order-2:8000;
    keepalive 100;
  }
  ```

  http는 원래 데이터 전송을 위해 접속한다음 데이터를 주고 바로 커넥션을 끊는데 keepalive를 이용하면 일정시간동안 예외적으로 커넥션을 유지한다. 한 클라이언트에서 접속이 빠르게 여러번 일어날때 좋은 옵션이다. 하지만 서버의 스펙을 생각해서 사용해야 한다.

---

밑의 옵션들은 유료 서비스인 <u>**Nginx Plus**</u>에서만 사용가능하다.

3. enabling session persistence

  ```nginx
  upstream backend {
    server order-1:8000;
    server order-2:8000;
    server order-3:8000;
    server order-4:8000;
    sticky cookie srv_id expires=1h domain=.example.com path=/;
    # sticky cookie name [expires=time] [domain=domain] [httponly] [samesite=strict|lax|none] [secure] [path=path];
  }
  ```

  세션이 필요한 서버가 있다. 예를 들면, session을 통해 로그인된 사용자를 확인하거나 session 데이터를 통해서 각 연결된 클라이언트들에 여러 데이터를 저장할 때가 있다. 그렇다면, 여러 서버가 세션을 공유해야되는데, 모든 서버가 같은 세션을 공유하는 것이 말이 안 된다. 그러므로 각 클라이언트마다 서버에 연결할 때, 어떤 세션을 연결해야 할지 고민을 해야하는데, 이 옵션이 해당 고민을 해결해준다. 옵션으로는 밑과 같은 옵션들이 있다.

     - **sticky cookie** - 각 클라이언트에 쿠키를 저장해주고, 그 쿠키 값을 통해 세션이 생성된 서버에만 연결시키게 된다. 예를 들면, 처음 로그인할 때, order-1서버로 로그인이 되었고, 해당 서버에 세션이 생성되었다. 그렇다면 order-1의 서버에만 해당 클라이언트의 요청을 주게 만드는 것이다.
     - **sticky route** - 경로를 파악하여 해당 경로는 한 서버에 지정되는 형식이다. 위와 비슷한 예시지만 경로를 통해 서버를 지정해준다가 다르다.
     - **sticky learn** - 쿠키가 생겨서 해당 클라이언트를 판단하고 그 판단 값을 가지고 `create`, `lookup` 매개변수를 통해 어떤 영역이 생기는데, 이를 `client_sessions`라고 한다. 이 영역은 1M의 크기를 가지고 약 4000개의 세션을 저장할 수 있다고 한다.

1. Limiting the Number of Connections

  ```nginx
  upstream backend {
    server order-1:8000 max_conns=3;
    server order-2:8000;
    queue 100 timeout=70;
  }
  ```

  최대 연결 갯수들을 지정하고 더 많은 요청이 오면 queue에 저장한다.

5. slow_start

  ```nginx
  upstream backend {
    server order-1:8000 slow_start=30s;
    server order-2:8000;
  }
  ```

  장애로 서버가 다운되어 새로 올릴 때, 해당 서버는 몇 초 뒤에 시작해서 첫 부하를 줄여준다.

<br/>

## 자주 사용하는 설정 템플릿

### 기본 설정

```nginx
# http로 받은 요청을 https 요청으로 바꾸는 작업
server {
  # 80번 포트로 요청을 받는다.
  listen 80 default_server;
  listen [::]:80 default_server;

  # 도메인을 설정한다.
 	server_name {도메인};

  # 301(redirect) 443으로
  return 301 https://$server_name$request_uri;
}

server {
  # 443번 포트로 요청을 받는다.
  listen 443 ssl;
  listen [::]:443 ssl;

  # 도메인을 설정한다.
  server_name {도메인};
  # 클라이언트가 최대로 body에 보낼 수 있는 사이즈를 설정한다. 기본 1Mbyte로 설정되어 있다.
  client_max_body_size 10M;

  # ssl key가 있는 위치를 설정해서 ssl보안 설정할 수 있도록 한다.
  ssl_certificate {fullchain key 위치}
  ssl_certificate_key {private key 위치}

  # 기본 baseURL이 있다. 해당 URL을 지정해야 한다.
  location /api {
    # 프록시로 패스 받을 곳을 설정한다.
    # 이곳에 넣을 곳을 upstream으로 설정하여 생성해야 한다.
    proxy_pass http://order-1:8000;
    # 프록시에는 http2를 지원하지 않는다.
    proxy_http_version 1.1;
  }
}
```

### 업스트림 설정

```nginx
upstream order {
  server 3.37.91.254:8001;
  server 3.37.91.254:8002;
  server 3.37.91.254:8003;
}

server {
  listen 80 default_server;
  listen [::]:80 default_server;
  root /var/www/html;

  index index.html index.htm index.nginx-debian.html;

  server_name _;

  location / {
    proxy_pass http://order;
    proxy_http_version 1.1;
    proxy_set_header Connection "";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
  }
}
```

### http2 설정

http 버전을 명시할 수 있다. 2가 더 좋은데 안 쓰는 이유는 호환성 때문이었는데, 이제는 시간이 좀 지나서 상관없다. 쓰는게 좋다. nginx에서는 프록시로는 http2를 지원하지 않는데, 프록시로 돌리는 것은 http1.1만 써도 좋은 성능을 낸다는 것을 nginx 측에서 근거를 내었다.

- 익스플로러는 11이상, 윈도우 10환경에서만 지원
- 맥은 X10.11이상, 사파리는 9이상부터 지원
- 안드로이드는 누가, ios는 8이상 부터 지원
- 아파치 HTTP 서버는 2.4.17버전 이상 + mod_http2 모듈 추가
- Nginx는 1.13.9버전 이상 + ngx_http_v2_module 추가
- 톰캣에서는 server.xml 수정(모듈추가)

```nginx
server {
  listen 443 ssl htttp2;
  listen [::]:443 ssl http2;
}
```

> 참고 문서: https://www.cloudflare.com/learning/performance/http2-vs-http1.1/

### 추가적인 설정 설명

1. Connection Header

  해당값을 제거하기 위해 해놓는 설정이다. close시 업스트림이 안 되는데, 현재 nginx를 설치하고 바로 사용해보면 keep-alive설정이 되어 있다. 그래서 그냥 Nginx를 기본설정으로 쓴다면 필요없다.

  하지만! 업스트림 프록시를 거치면서 http 1.0을 쓰게 되기 때문에 이 헤더 설정이 필요한 것이다. http2에서는 connection 설정이 기본적으로 keep-alive에 Connection 설정을 못 하도록 막혀있다. 하지만 http1.1에서는 기본적으로 keep-alive더라도 설정을 할 수 있기 때문에 업스트림을 위해서는 해당 설정을 꼭 넣도록 한다.

  ```nginx
  proxy_http_version 1.1;
  proxy_set_header Connection "";
  ```

  > 참고 문서: https://seungtaek-overflow.tistory.com/10

2. Host

  호스트 설정은 주로 proxy_host와 host를 쓰는데, 로드밸런서의 주소를 보여주면서 실제 서버의 주소를 안 보여주고 싶을 때 host를 쓰고, 실제 서버의 주소를 보여줄 때 proxy_host를 쓴다. proxy_host는 기본 설정이다.

  ```nginx
  proxy_set_header Host $host;
  ```

  > Host 설정
  >
  > - `$proxy_host`: This sets the “Host” header to the domain name or IP address and port combo taken from the `proxy_pass` definition. This is the default and “safe” from Nginx’s perspective, but not usually what is needed by the proxied server to correctly handle the request.
  > - `$http_host`: Sets the “Host” header to the “Host” header from the client request. The headers sent by the client are always available in Nginx as variables. The variables will start with an `$http_` prefix, followed by the header name in lowercase, with any dashes replaced by underscores. Although the `$http_host` variable works most of the time, when the client request does not have a valid “Host” header, this can cause the pass to fail.
  > - `$host`: This variable is set, in order of preference to: the host name from the request line itself, the “Host” header from the client request, or the server name matching the request.

<br/>

3. ETC

  ```nginx
  # 여러 헤더 세팅들
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $server_port;
  ```

<br/>

## 자주 사용하는 명령어

```bash
# 설치 - 기본적으로 /etc/nginx 에 설치 됨.
sudo apt update
sudo apt install nginx

# 버전확인
nginx -v

# 기동
sudo systemctl start nginx
sudo service nginx start

# 중지
sudo systemctl stop nginx
sudo service nginx stop

# 재기동
sudo systemctl restart nginx
sudo service nginx restart

# 설정 검사
sudo nginx -t

# 상태 확인
sudo systemctl status nginx
```

<br/>
