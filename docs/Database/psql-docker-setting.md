---
sidebar_position: 3
description: Docker를 활용한 PostgreSQL 기본 설정
---

# PostgreSQL 설정(with Docker)

## 도커설치

```bash
# 필수 패키지 설치
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
# GPG Key 인증
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
# docker repository 등록
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
# 도커 설치
sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io
# 시스템 부팅시 도커 시작
sudo systemctl enable docker && sudo service docker start
# 도커 확인
sudo service docker status
```

### 도커 권한 부여

``` bash
# 그룹 추가
sudo usermod -aG docker $USER 
# 도커 재시작
sudo service docker restart
```

이후, 재접속하면 일반유저로 도커를 사용할 수 있다. 권한 부여가 제대로 동작하지 않는다면 다음 PostgreSQL 설치로 넘어가서 모든 명령어에 `sudo`를 붙여도 무방하다. 그래도 왠만하면 권한부여를 하는걸로.

<br />

## PostgreSQL 설치

```bash
# Postgres 이미지 불러오기
sudo docker pull postgres
# 도커 이미지 확인
sudo docker images
# 도커 이름은 --name 뒤에 넣고, password는 root 패스워드(사용자 지정), 포트도 커스텀 가능
docker run -p 15432:5432 --name {name} -e POSTGRES_PASSWORD={password} -d postgres
```

<br />

## PostgreSQL 설정

### 접속

```bash
# 도커 컨테이너 bash 접속
sudo docker exec -it {name} bash
# postgres 접속
psql -U postgres
```

<br />

### 데이터베이스 생성 및 유저 추가

```sql
-- postgres 계정 비밀번호 설정
ALTER USER postgres WITH PASSWORD 'password';
-- 유저 생성
CREATE USER developer PASSWORD 'pasword';
-- 권한 부여할 때는 밑과 같이 할 수 있다.
ALTER USER developer WITH CREATEROLE SUPERUSER CREATEDB;
-- 유저 확인 밑의 방법 2개 중 하나로 확인
SELECT * FROM PG_USER;
\du
-- 데이터 베이스 생성
CREATE DATABASE develop OWNER developer;
-- 데이터 베이스 확인, 방법 2개 중 하나로 확인
SELECT * FROM pg_database;
-- DB 나가기 (MySQL과 다르다)
\q
```

<br />

### 타임존 설정

```sql
-- 시간 확인, 시간이 다르다면 타임존 변경
SELECT CURRENT_SETTING('TIMEZONE'), NOW(), CURRENT_TIMESTAMP, clock_timestamp();
-- 타임 존 변경
SET TIME ZONE 'Asia/Seoul';
-- 타임 존 확인
SHOW timezone;
```

:::caution
위처럼 변경하면 MySQL과 달라서 세션스코프에서만 타임존이 변경된다. 그러므로 접속을 끊으면 다시 UTC+0으로 돌아오게 된다.

해결방법은 docker container 안의 **`postgresql.conf`파일을 찾아서**(var/lib/postgresql/data 폴더에 있음 - 클라우드 서비스마다 다름) 설정에 **`timezone`과 `log_timezone`를 "Asia/Seoul"로 변경**하고 도커 컨테이너를 재실행시킨다.
:::

<br />

이렇게 한 후, `exit` 명령어를 통해 컨테이너 밖을 나가서 `docker restart {container name or id}`를 입력해서 컨테이너를 재실행 시켜주면 된다.

하지만 이렇게 해도 설정이 안되는 경우에는 컨테이너 자체의 시간대를 변경해야 한다. 컨테이너에서 시간대를 바꿔주는 명령어인 `ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime` 를 입력하면 해결된다. 컨테이너에서 시간대 변경 후, 도커를 다시 시작했는데도 안 된다면 인스턴스의 시간을 변경해야 한다. 인스턴스에서도 똑같은 명령어를 써주면 된다.

<br />

**예시**
```bash
# postgreql 나가는 명령어
\q
# container 나가는 명령어
exit
# 도커 컨테이너 재시작 명령어
docker restart psql
# container or instance 시간대 변경 명령어
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
# container or instance 시간대 확인 명령어
date
```

<br />