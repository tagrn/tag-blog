---
sidebar_position: 2
description: Docker를 활용한 Mysql 기본 설정
---

# MySQL 설정(with Docker)

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

이후, 재접속하면 일반유저로 도커를 사용할 수 있다. 권한 부여가 제대로 동작하지 않는다면 다음 MySQL 설치로 넘어가서 모든 명령어에 `sudo`를 붙여도 무방하다. 그래도 왠만하면 권한부여를 하는걸로.

<br />

## MySQL 설치

```bash
# Mysql 이미지 불러오기
docker pull mysql
# 도커 이미지 확인
docker images
# 도커 이름은 --name 뒤에 넣고, password는 root 패스워드(사용자 지정), 포트도 커스텀 가능
docker run -p 13306:3306 --name {name} -e MYSQL_ROOT_PASSWORD={password} -d mysql
# 잘 실행되었는지 확인
docker ps
```

<br />

## MySQL 설정

### 접속

```bash
# 도커 컨테이너 bash 접속
docker exec -it {name} bash
# Mysql 접속 - 명령어 입력 후, 패스워드 입력
mysql -u root -p
```

<br />

### 데이터베이스 생성 및 유저 추가

```sql
-- 사용할 데이터 베이스 생성
create database {database name};
-- 유저 생성
create user '{user name}'@'%' identified by '{password}';
-- 유저에게 사용할 데이터 베이스 권한 부여
grant all privileges on {database name}.* to '{user name}'@'%';
-- 권한 적용
flush privileges;
```

<br />

### 타임존 설정

```sql
-- 시간대 확인
select now(), @@system_time_zone as TimeZone;
-- 글로벌 타임존 설정
set global time_zone = '+9:00';
-- 타임존 설정(시간)
set time_zone = '+9:00';
-- 타임존 설정(이름)
set time_zone = 'asia/seoul';
```

<br />

이렇게 한 후, `exit` 명령어를 통해 컨테이너 밖을 나가서 `docker restart {container name or id}`를 입력해서 컨테이너를 재실행 시켜주면 된다.

하지만 이렇게 해도 설정이 안되는 경우에는 컨테이너 자체의 시간대를 변경해야 한다. 컨테이너에서 시간대를 바꿔주는 명령어인 `ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime` 를 입력하면 해결된다. 컨테이너에서 시간대 변경 후, 도커를 다시 시작했는데도 안 된다면 인스턴스의 시간을 변경해야 한다. 인스턴스에서도 똑같은 명령어를 써주면 된다.

<br />

**예시**
```bash
# mysql or container 나가는 명령어
exit
# 도커 컨테이너 재시작 명령어
docker restart mysql
# container or instance 시간대 변경 명령어
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
# container or instance 시간대 확인 명령어
date
```

<br />