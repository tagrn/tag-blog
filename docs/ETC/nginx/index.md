---
description: 다용도로 사용할 수 있는 경량 웹 서버
---

# Nginx

> **NGINX** is open source software for web serving, reverse proxying, caching, load balancing, media streaming, and more. It started out as a web server designed for maximum performance and stability. In addition to its HTTP server capabilities, NGINX can also function as a proxy server for email (IMAP, POP3, and SMTP) and a reverse proxy and load balancer for HTTP, TCP, and UDP servers.

<br/>

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

하지만 3개월짜리를 받게 되면 3개월마다 갱신을 해주어야 하기 때문에 기업의 다른 방법을 찾아봐야 한다. 보안 등급별로 가격차이가 심하게 나기 때문에 고민이 필요할 듯하다.

* ssl 사이트
  * https://www.enterprisessl.com/
  * https://sslhosting.gabia.com/service
  * https://cert.crosscert.com/ssl-%EC%A0%95%EC%9D%98/
* ssl 보안 등급
  * DV: 도메인 소유권한 확인 후, 발급 심사 확인
  * OV: 회사 정보 서류까지 발급 심사 확인
  * EV: 회사 정보외 추가적인 확약 서류 제출 심사 확인
  * 참고: https://sslhosting.gabia.com/service/sslprocess

* Nginx 설정법

  ssl 키를 받으면 nginx에 설정시켜준다. 

  letsencrypt 기준 예시)

  ```nginx
  server {
    ...
      
  	ssl_certificate /etc/letsencrypt/live/{도메인}/fullchain.pem;
  	ssl_certificate_key /etc/letsencrypt/live/{도메인}/privkey.pem;
    
    ...
  }
  ```

<br/>

## Load Balancer

로드 밸런서란 서버에 가해지는 부하를 분산하기 위한 장치이다. 하드웨어, 소프트웨어적으로 분산하며, 여러 방식의 분산 방법이 존재한다. nginx에서는 upstream을 통해 여러 서버로 분산가능하며 이에 대한 여러 옵션을 제공한다.

> 참고 문서: https://www.nginx.com/resources/glossary/load-balancing/

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

* Round Robin: nginx의 기본 설정

* Least Connections: 활성화된 연결이 제일 작은 서버부터 부하시킨다.

  ```nginx
  upstream backend {
  	least_conn;
  	server order-1:8000;
  	server order-2:8000;
    server order-3:8000;
  	server order-4:8000;
  }
  ```

* IP Hash: IP 값을 해시 값으로 바꾸어 해당 해시값을 통해 서버로 부하를 분산시킨다. 해시값들은 각각 어떤 서버로 갈지 지정된다.

  ```nginx
  upstream backend {
  	ip_hash;
  	server order-1:8000;
  	server order-2:8000;
    server order-3:8000;
  	server order-4:8000;
  }
  ```

* Generic Hash: key 값을 해시 값으로 바꾸어 해당 해시값을 통해 서버로 부하를 분산시킨다. key 값의 소스는 IP, port, URI 등의 데이터로 이루어진다. 해시값들은 각각 어떤 서버로 갈지 지정된다.

  ```nginx
  upstream backend {
  	hash $request_uri consistent;
  	server order-1:8000;
  	server order-2:8000;
    server order-3:8000;
  	server order-4:8000;
  }
  ```

* Least Time: 해당 옵션은 nginx Plus에서만 사용가능하다. 평균 지연율과 현재 연결된 요청의 수를 고려하여 적합한 서버에 요청을 보낸다. 3가지 옵션이 있으며, `header` 는 데이터가 도착하자 말자 지연율을 측정하고 `last_byte`는 모든 데이터가 도착해야 지연율을 측정하며, `last_byte inflight` 는 불완전한 요청도 포함한 모든 데이터가 도착한 시간을 측정한다.

  ```nginx
  upstream backend {
  	least_time header;
  	server order-1:8000;
  	server order-2:8000;
    server order-3:8000;
  	server order-4:8000;
  }
  ```

* Random: 랜덤한 서버를 선택하여 보낸다. 하지만 좀 더 랜덤의 방식을 향상시킬 수 있는데, 뒤에 옵션으로 `two` 를 붙이면 랜덤으로 2개가 선택되고 그 선택된 두 개중에서 앞서 배운 메소드들을 기준으로 요청할 수 있다. 시간과 횟수 기준으로 메소드를 지정하고 해당 메소드들은 `least_conn`, `least_time=last_byte`, `least_time=header;` 이렇게 3가지가 있다. 또한 least_time은 Nginx Plus에만 쓸 수 있으므로 해당 옵션 또한 똑같이 Nginx Plus에서만 된다.

  ```nginx
  upstream backend {
  	random two least_conn;
  	server order-1:8000;
  	server order-2:8000;
    server order-3:8000;
  	server order-4:8000;
  }
  ```

* 참고: https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/



### 옵션

* slow_start 옵션 - Nginx Plus 에서 사용가능.
  * 사용하는 이유: 장애로 서버가 다운되어 새로 올릴 때, 해당 서버는 몇초 뒤에 시작해서 첫 부하를 줄여준다.

  * 예시)

    ```nginx
    upstream backend {
    	server order-1:8000 slow_start=30s;
    	server order-2:8000;
    }
    ```

* weight 옵션

  * 사용하는 이유: 서버마다 스펙이 다르므로 좋은 서버에는 큰 가중치를 두어 많은 트래픽이 가게 한다. 밑의 설정 기준으로 7개의 요청이 있다면 1서버에는 5개의 요청이 가고 2서버에는 2개의 요청이 간다.

  * 예시)

    ```nginx
    upstream backend {
    	server order-1:8000 weight=5;
    	server order-2:8000 weight=2;
    }
    ```

* enabling session persistence 옵션 - Nginx Plus 에서 사용가능.

  * 사용하는 이유: 세션이 필요한 서버가 있다. 예를 들면, session을 통해 로그인된 사용자를 확인하거나 session 데이터를 통해서 각 연결된 클라이언트들에 여러 데이터를 저장할 때가 있다. 그렇다면, 여러 서버가 세션을 공유해야되는데, 모든 서버가 같은 세션을 공유하는 것이 말이 안 된다. 그러므로 각 클라이언트마다 서버에 연결할 때, 어떤 세션을 연결해야 할지 고민을 해야하는데, 이 옵션이 해당 고민을 해결해준다.

  * 종류

    * sticky cookie - 각 클라이언트에 쿠키를 저장해주고, 그 쿠키 값을 통해 세션이 생성된 서버에만 연결시키게 된다. 예를 들면, 처음 로그인할 때, order-1서버로 로그인이 되었고, 해당 서버에 세션이 생성되었다. 그렇다면 order-1의 서버에만 해당 클라이언트의 요청을 주게 만드는 것이다.
    * sticky route - 경로를 파악하여 해당 경로는 한 서버에 지정되는 형식이다. 위와 비슷한 예시지만 경로를 통해 서버를 지정해준다가 다르다.
    * sticky learn - 쿠키가 생겨서 해당 클라이언트를 판단하고 그 판단 값을 가지고 `create`, `lookup` 매개변수를 통해 어떤 영역이 생기는데, 이를 `client_sessions`라고 한다. 이 영역은 1M의 크기를 가지고 약 4000개의 세션을 저장할 수 있다고 한다. 

  * 예시)

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

* Limiting the Number of Connections 옵션 - NGINX Plus에서 사용가능

  * 최대 연결 갯수들을 지정하고 더 많은 요청이 오면 queue에 저장한다.

  * 예시)

    ```nginx
    upstream backend {
    	server order-1:8000 max_conns=3;
    	server order-2:8000;
    	queue 100 timeout=70;
    }
    ```

* Keepalive 옵션

  * http는 원래 데이터 전송을 위해 접속한다음 데이터를 주고 바로 커넥션을 끊는데 keepalive를 이용하면 일정시간동안 예외적으로 커넥션을 유지한다. 한 클라이언트에서 접속이 빠르게 여러번 일어날때 좋은 옵션이다. 하지만 서버의 스펙을 생각해서 사용해야 한다.

  * 예시)

    ```nginx
    upstream backend {
    	server order-1:8000;
    	server order-2:8000;
    	keepalive 100;
    }
    ```

<br/>

## 자주 사용하는 설정

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
    # http 버전을 명시할 수 있습니다.
    # 참고: https://www.cloudflare.com/learning/performance/http2-vs-http1.1/
    # 2가 더 좋은데 안 쓰는 이유는 호환성때문
    # 익스플로러는 11이상, 윈도우 10환경에서만 지원
    # 맥은 X10.11이상, 사파리는 9이상부터 지원
    # 안드로이드는 누가, ios는 8이상 부터 지원
    # 아파치 HTTP 서버는 2.4.17버전 이상 + mod_http2 모듈 추가
    # Nginx는 1.13.9버전 이상 + ngx_http_v2_module 추가
    # 톰캣에서는 server.xml 수정(모듈추가)
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

```nginx
server {
  listen 443 ssl htttp2;
  listen [::]:443 ssl http2;
}
```

### 추가 설정

```nginx
# 추가설정 부분들 모두 실험해봤는데, 적용되지 않는다... 안 써도 문제는 없기 때문에, 써야 될 경우 다시 한번 더 알아봐야겠다.

# 기본 커넥션의 값은 close 해당값을 제거하기 위해 해놓는 설정. close시 업스트림이 안된다고 한다.
# 현재 nginx를 설치하고 바로 사용해보면 keep-alive설정이 되어 있다. 디폴트가 왜 다른지 모르겠다.
proxy_set_header Connection "";
# 호스트 설정은 주로 proxy_host와 host를 쓰는데, 로드밸런서의 주소를 보여주면서 실제 서버의 주소를 안 보여주고 싶을 때 host를 쓰고, 실제 서버의 주소를 보여줄 때 proxy_host를 쓴다. proxy_host는 기본 설정이다.
proxy_set_header Host $host;

# 여러 헤더 세팅들
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
```

> Host 설정
>
> - `$proxy_host`: This sets the “Host” header to the domain name or IP address and port combo taken from the `proxy_pass` definition. This is the default and “safe” from Nginx’s perspective, but not usually what is needed by the proxied server to correctly handle the request.
> - `$http_host`: Sets the “Host” header to the “Host” header from the client request. The headers sent by the client are always available in Nginx as variables. The variables will start with an `$http_` prefix, followed by the header name in lowercase, with any dashes replaced by underscores. Although the `$http_host` variable works most of the time, when the client request does not have a valid “Host” header, this can cause the pass to fail.
> - `$host`: This variable is set, in order of preference to: the host name from the request line itself, the “Host” header from the client request, or the server name matching the request.

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

## 추가: 서버가 커지면 무조건 생각해야 되는 것들

* Redis
  * 사용자의 세션관리
  * 빈번한 I/O의 캐싱 처리
    * 일정한 주기에 따라 RDS에 업데이트
  * 메세지 큐잉
  * 참고: https://brunch.co.kr/@skykamja24/575
* MOM
  * 메세지 큐잉을 통해 서버의 성능을 저하시키지 않고 순차적으로 처리하도록 만드는 것이 목표
  * 아마도 메세지 손실을 최소화시키는 방향으로 잡아야 할 듯하다. 메세지가 손실이 된다고 해도 메세지가 도착하지 않았다는 것도 표기를 하고.
  * kafka, rabbitMQ, ActiveMQ, Redis
  * 참고: https://gwonbookcase.tistory.com/49
  * 참고2: https://hhlab.tistory.com/145
* Kubernetes
  * 서버를 로드밸런싱해서 쓰는 건 비용적으로 너무 손실이 크기 때문에 시간별, 요청별로 서버의 스케일을 변경해야 한다.
  * 쿠버네티스는 오토스케일링, 오토힐링 등의 기능을 제공하기 때문에 관리하기 쉽고, 서버별로 비용 손실을 줄일 수 있다.

<br/>