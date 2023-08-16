---
sidebar_position: 14
description: AWS 엑세스 제어(인증) 시스템
---

# IAM

:::note
Identity and Access Management의 약자로써, 모든 AWS에 대해 세분화된 액세스 제어를 제공한다. 지금은 **모든 AWS에 대해 세분화된 액세스 제어를 제공**이라는 말에 매우 공감하지만, 배우기 전에는 이해할 수 없었다.

그렇기 때문에 비유가 중요하다고 본다. IAM는 Linux(다른 OS도 마찬가지)의 유저를 생각하면 쉽다. AWS에서는 Linux처럼 유저를 설정할 수 있고, 해당 유저들은 각 서비스에 지정된 권한으로만 접근할 수 있다는 것이다. 그리고 Linux에는 권한을 그룹화할 수 있는데, AWS도 마찬가지로 권한 그룹을 만들어서 유저를 그 그룹으로 참여시키고 해당 그룹 권한을 가지는 게 가능하다.

이처럼 IAM는 AWS상의 유저시스템이라고 보면 된다.

참고 - https://docs.aws.amazon.com/ko_kr/IAM/latest/UserGuide/introduction.html
:::

<br/>

## 그룹

여러 유저에게 같은 권한들을 부여해주기 위해 생겼다. 여러 권한을 그룹에 매핑시켜놓고 그 그룹에 유저들을 포함시키면 포함시킨 유저들의 권한을 지정하지 않아도 그룹이 가지고 있는 권한을 부여해준다. 위에서 말했듯이 Linux의 group과 같다고 보면 된다.

### 하나의 유저, 여러 그룹

하나의 유저는 여러 그룹을 가질 수 있다. 여기 쉬운 설명이 있다. **동글이(유저)**라는 한 대학생 새내기가 **동아리(그룹)**를 들어가려고 한다. 그런데 동아리를 탐색하다보니 댄스 동아리와 축구 동아리 그리고 프로그래밍 동아리를 들고 싶었고, 고심하던 끝에 3개 모두 가입하기로 했다. 그러면 그 동아리원으로서 동아리방 권한이 생긴다. 하지만 각각의 동아리 방은 다르고, 동글이는 3개의 동아리 방에 출입할 수 있는 권한을 가지게 된다. 즉, 한 유저는 여러 그룹을 가질 수 있고 그 권한들을 모두 가질 수 있다는 말이다.

<br/>

## 정책

정책이란 실제로 이 유저나 그룹에게 어떤 권한을 줄지 설정하는 것이다.

여러 설정 방법이 있는데, 정책을 생성하고 유저나 그룹에게 주입하는 방법이 있다. 유저나 그룹을 생성할 때도 정책 설정이 가능하고, 생성 후에도 정책 설정이 가능하다. 그리고 Inline 정책이라는게 있는데, 얘는 유저에게만 사용 가능하다. inline이라는 말은 css에서 inline style을 설정하는 것과 유사하다고 보면 된다. 즉, 해당 유저에게만 정책을 적용한다. 그리고 여러 기본 정책들이 있는데, 이는 AWS 정책 설정할 때, 확인 가능하다. 한 가지 예를 들자면, AdministorAccess 권한은 모든 서비스와 리소스에 접근하는 권한이다.

policy 설정 방법은 밑의 예시를 보면서 주석을 달아보았다.

```
{
	// 언어 정책 버전
  "Version": "2012-10-17",

  // 해당 정책의 원하는 id(어떠한 정책인지 알아볼 수 있는 각자의 Key) 설정
  "Id": "My-Name-is-Tag",

  // 정책 상태 설정 - 이 안의 내용이 정책을 결정한다 볼 수 있다.
  "Statement": {

  	// 해당 정책 상태의 원하는 id(어떠한 정책인지 알아볼 수 있는 각자의 Key) 설정
      "Sid": "AllowRemoveMfaOnlyIfRecentMfa",

      // 이 상태를 Allow 할 것인지 Deny 할 것인지.
      "Effect": "Allow",

       // 어떤 액션에 대해서 설정할 것인지 - 해당 설정이 거의 다 결정한다고 보면 된다.
      "Action": [
          "iam:ChangePassword", // IAM 패스워드 변경 권한
          "s3:GetObject", // S3 객체 가져올 권한
          "iam:DeactivateMFADevice", // MFA 설정 무시하게 끔하는 권한 1
          "iam:DeleteVirtualMFADevice" // MFA 설정 무시하게 끔하는 권한 2
      ],

      // 어떤 리소스에 대해서 결정할 것인지, S3, EC2 같은 서비스들
      // "Resource": "*", 이렇게 하면 모든 리소스를 뜻한다.
      "Resource": "arn:aws:iam::*:user/${aws:username}",

      // 이 정책상태에 어떤 조건을 줄 것인지.
      "Condition": {

      	// MFA 설정 1시간이내는 로그인 가능하게 끔.
          "NumericLessThanEquals": {
          	"aws:MultiFactorAuthAge": "3600"
          },

          // 유저이름이 "johndoe" 일 때는 무시
          "StringEqualsIgnoreCase" : {
          	"aws:username" : "johndoe"
          }
      }
  }
}
```

이렇게 JSON으로 설정해도 되지만, Visual Editor도 있으니 정책 설정은 자신이 편한 것으로 가능하다.

<br/>

## 보안

AWS에서는 여러 보안 방법을 제공해 주는데, 이는 밑과 같다.

- 비밀번호 정책을 커스텀하게 설정할 수 있다.
- IAM 유저들의 패스워드를 변경 불가하게도 만들 수 있다.
- 이전에 사용했던 비밀번호를 사용하지 못 하게 설정 가능하다.
- 지정한 일수마다 변경하게 가능하다.
- MFA 설정 가능하다.
  - Virtual MFA device(Google Authenticator, Authy)
  - Universal 2nd Factor (U2F) Security Key (YubiKey)
  - Hirdware
    - Hardware Key Fob MFA Device (Gemalto)
    - Hardware Key Fob MFA Device for AWS GovCloud(SurePassID) - US

<br/>

## 접근방법

접근방법에는 대표적으로 3가지가 있다. SDK, CLI, Console 이다. 우리가 코딩하면서 사용하는 것은 SDK이고, bash나 cmd로 사용하는 것은 CLI이다. 마지막으로 웹으로 들어가서 조정하는 것은 Console이다.

SDK, CLI는 Access Key를 통해서 사용한다. Access Key는 2가지로 나뉘는데 Access Key Id는 Username이라고 보면 되고, Secret Access Key는 Password라고 보면 쉽게 이해할 수 있다. 이는 AWS Console에서 발급가능하다.

- Access Key의 구조
  - Access Key Id = username
  - SecretAccess Key = password

CLI 설치하는 법은 밑과 같다.

- cli 설치 방법

  1. 밑의 사이트에서 CLI 설치
     - https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html
  2. aws --version 확인
  3. aws configure
  4. accessKey SecretKey 설정
  5. region 설정

그리고 Console 상에서 터미널을 사용하는 방법(CloudShell)도 있는데, 이는 모든 Region에서 지원하진 않는다.

<br/>

## 역할

서비스에 연결하여 해당 서비스가 AWS의 다른 서비스에 접근할 수 있도록 한다. 즉, [iam + ec2]로 AWS와 연결한다는 것이다. 역할 또한 정책을 설정할 수 있고, 이를 통해 서비스 간의 액세스 제어를 한다.

<br/>

## 모니터링

IAM 주요한 2가지 모니터링 방법이 있다. 자격 증명 보고서와 Access Advisor이다.

### IAM > 자격 증명 보고서

- 계정레벨의 다양한 자격증명 상태 포함한다.
- 유저들의 비밀번호 변경주기, MFA 설정, 비밀번호 사용 시간, Access Key에 대한 정보 등을 알 수 있다.
- Credential Report에서 csv 파일로 다운 가능하다.

### IAM > Users > Access Advisor

- 유저레벨의 다양한 자격증명 상태 포함한다.
- 해당 유저가 마지막으로 서비스에 접근한 것을 볼 수 있고, 권한을 볼 수 있고, 해당 부분으로 권한 조정을 위한 정보를 참고할 수 있다.
- 설정한 Tracking Period에 확인 못하면 데이터를 볼 수 없고, Access가 안되어 필요없는 권한을 확인 및 제거할 수 있도록 도와준다.

<br/>

## Advanced IAM

IAM 정책에서 no Permission과 explicit Deny랑 Allow는 다르다. explicit Deny가 제일 우선순위가 높다. 동적 폴리시를 통해서 aws:username 같은 것으로 변수를 통해 어떤 리소스에 동적으로 권한 부여를 할 수 있다.

### inline & Managed Policy

AWS Managed Policy은 이미 있는 정책을 뜻한다. Customer Managed Policy는 우리가 커스텀해서 쓰는 정책이다. inline 정책은 각각에 권한을 주는데, 해당 정책이 사라지면 같이 사라진다. inline 정책의 템플릿은 2KB까지 사용 가능하다.

<br/>

:::caution
**AWS의 액세스 제어 방침**

AWS에서는 최소한의 권한만을 지정할 것을 권하고 있다. 이는 권한에 따른 여러 보안을 지키기 위함이며, 잘못된 접근으로 큰 코스트가 부과되는 것을 막기 위함이기도 하다.
:::

<br/>
