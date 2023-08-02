---
sidebar_position: 4
description: 123
---

# Cloud Formation

:::note

코드형 인프라를 제공한다. 예를 들어, yaml이나 json 파일을 통해서 AWS의 여러 리소스가 들어간 인프라를 순서대로 지정하여 한 번에 기동시킬 수 있다. [공식문서](https://docs.aws.amazon.com/cloudformation/index.html)도 있어서 어떻게 쓰는지 확인가능한데, 다른 서비스들보다 내용이 방대하다.

---

* 버저닝 작업을 한다.
  * 이전 버전은 수정할 수 없다.
  * 새로운 버전을 업데이트해야하고 업데이트 시에, 이전 버전과 비교한다.
* 원클릭으로 모든 리소스를 한번에 삭제 가능하다.
* 수동으로 생성되는 리소스가 없어서 관리하기 편하고, 코드 검토를 통해 서비스들을 검토할 수 있다.
* 비용 측면에서는 무료지만, 올라가는 서비스들은 시세에 따른다.
* 해당 서비스로 비용 측정이 가능해서 비용 절감 전략을 세울 수 있다.

:::

<br />


## Template Building Group

### Resources

해당 부분은 무조건 있어야 하는 부분이다. 리소스가 선언되면 리소스끼리 연결가능하고 200개 이상의 리소스 타입이 있다. 밑에서 찾기 가능하고 원하는 타입을 선택하면 sample 설정 컨텐츠가 나온다.

```
Type: AWS::EC2::EIP
Properties: 
  Domain: String
  InstanceId: String
  NetworkBorderGroup: String
  PublicIpv4Pool: String
  Tags: 
    - Tag
```

설정 컨텐츠의 옵션들도 해당 [공식문서](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)에 다 설명되어 있기 때문에 보면서 사용가능하다.

### Parameters

재사용가능하고, 코드 오류를 줄여준다. 여러 곳에 사용하는 변수인 경우, 맨 위에 파라미터로 선언하여 해당 파라미터만 바꾸는 것으로 모두 적용시킬 수 있다. `!Ref` 로 파라미터 지정한 것을 데려올 수 있다. `!Ref`로 파라미터만이 아닌 리소스도 연결시킬 수 있으니 조심하자.

Pseudo Parametor들이 있는데, 이들은 원래부터 넣어져 있는 파라미터이다.

* AWS::AcountId
* AWS::NotificationARNs
* AWS::NoValue
* AWS::Region
* AWS::StackId
* AWS::StackName


### Mapping

템플릿에서 고정된 변수는 하드코딩으로 넣어주어야 한다. 파라미터와 비슷한데, 사전에 알 수 있는 변수냐 아니냐의 차이이다. 즉, Const, Final 형식의 상수라고 생각하면 된다.

`!FindInMap [MapName, TopLevelKey, SecondLevelKey]` 형식으로 Mapping을 가져올 수 있다.

```
Mappings:
  RegionMap:
    us-east-1:
      AMI: "ami-0ff8a91507f77f867"
    us-west-1:
      AMI: "ami-0bdb828fd58c52235"
    us-west-2:
      AMI: "ami-a0cfeed8"
      
 ...
      
 Resources:
  EC2Instance:
    Type: "AWS::EC2::Instance"
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", AMI]
      InstanceType: !If [CreateProdResources, c1.xlarge, !If [CreateDevResources, m1.large, m1.small]] 
 
 ...
 
```

위의 예제는 [Condtion sample template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-sample-templates.html)에서 가져왔다.

### Outputs

출력을 내보내면 다른 스택에서 해당 출력을 가져올 수 있다. 즉, Export.Name을 통해 출력하고 !ImportValue를 통해서 다른 스택에서 name에 해당하는 값들을 가져올 수 있다.

Export 예제

```
Outputs:
  PublicSubnet:
    Description: The subnet ID to use for public web servers
    Value:
      Ref: PublicSubnet
    Export:
      Name:
        'Fn::Sub': '${AWS::StackName}-SubnetID'
  WebServerSecurityGroup:
    Description: The security group ID to use for public web servers
    Value:
      'Fn::GetAtt':
        - WebServerSecurityGroup
        - GroupId
    Export:
      Name:
        'Fn::Sub': '${AWS::StackName}-SecurityGroupID'
```

Import 예제

```
Resources:
  WebServerInstance:
    Type: 'AWS::EC2::Instance'
    Properties:
      InstanceType: t2.micro
      ImageId: ami-a1b23456
      NetworkInterfaces:
        - GroupSet:
            - !ImportValue 
              'Fn::Sub': '${NetworkStackNameParameter}-SecurityGroupID'
          AssociatePublicIpAddress: 'true'
          DeviceIndex: '0'
          DeleteOnTermination: 'true'
          SubnetId: !ImportValue 
            'Fn::Sub': '${NetworkStackNameParameter}-SubnetID'
```

:::caution
여기서 `!ImportValue`와 함께 쓰는 Sub 함수는 `Fn::Sub`로 써야하고, `!Sub` 처럼 Short Method를 쓰지 못 한다.

[공식문서](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html) 참고
:::
### Condition

리소스의 어떤 서비스에 `Condtions.{조건식이름}: {조건식}` 을 적어서 조건 분기가 가능하다.

* `!Equals`
* `!If`
* `!Or`
* `!Not`
* `!And [a, b]`

```
Conditions:
  CreateProdResources: !Equals [!Ref EnvType, prod]
  CreateDevResources: !Equals [!Ref EnvType, "dev"]

...

Resources: 
  MountPoint:
    Type: "AWS::EC2::VolumeAttachment"
    Condition: CreateProdResources
    Properties:
      InstanceId: !Ref EC2Instance
      VolumeId: !Ref NewVolume
      Device: /dev/sdh
 
 ...
 
```

> [공식문서](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-sample-templates.html) 참고



### 내장함수

* `Fn::Ref` or `!Ref`: Parameter, Resources 표현
* `Fn::Attr` or `!Attr`: 리소스의 속성을 가져올 때 쓰임. ex. `!Attr EC2Instance.AvailabilityZone`
* `Fn::FindInMap` or `!FindInMap`: Mapping의 값들을 가져올 때 쓰임
* `Fn::ImportValue` or `!ImportValue`: export한 값을 가져올 수 있음
* `Fn::Join` or `!Join [delimiter, [a, b, c]]`: 코딩의 조인과 같음
* `Fn::Sub`: 지정한 변수(key)로 value 값을 가져옴

밑의 [공식 문서](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html)에는 6개 말고도 몇 개 더 설명해준다.

<br />


## 롤백

Update 시에 Failure가 발생하면 이전 버전으로 롤백된다. Create 시, 기동 시에 Failure가 발생에 대한 설정을 할 수 있다.

<br />

## 스택

* 중첩스택은 먼저 상위 스택을 업데이트해야 하위 스택이 업데이트 가능하다.
* 크로스 스택은 서로 다른 수명주기를 가질 때 쓰이고, VPC 스택간에 공유를 한다.
* 스택 셋은 여러 계정과 리전에 스택을 적용시킨다. 스택 셋을 업데이트하면 연결된 모든 계정, 모든 리전의 스택 인스턴스가 업데이트 된다.

<br />

## 드리프트

CloudFormation에서 설정한 정보와 다른 서비스의 정보가 달라지는 것이다. 각 서비스에서 직접 설정을 바꾸면 그렇게 되는데, 이는 서비스 운영에 중요하다. view drift detail에서 누가 바꿨는지 확인할 수 있고, CloudTrail를 통해 세부적으로 확인가능하다. 현재 드리프트가 발생했는지 확인하기 위해, detect Drift는 자주 실행해보는 것이 좋다.

<br />
