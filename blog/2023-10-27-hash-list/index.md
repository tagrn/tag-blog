---
slug: hash-list-a
title: 해시 리스트(Hash List) 구현
authors: [tagrn]
---

# 해시 리스트(Hash List) 구현

:::success 📌 읽기 전에 보고 가세요!!
- 글 내용에 대한 오류 및 의견은 언제나 환영합니다.
- 해시 리스트는 공식적인 자료구조가 아닌 개인적으로 만들어 본 자료구조입니다.
:::

## 해시 리스트(Hash List)란?

---

링크드 리스트는 삽입 및 삭제가 빠른 대신 조회가 느리고, 배열은 조회가 빠른 대신 삽입 및 삭제가 느립니다. 이를 보완해볼 방법이 없을까 하여 구현하게 되었습니다. 해시 리스트는 2가지 버전으로 존재합니다. 조회, 삽입, 삭제 모두 개선된 버전과 조회와 삽입이 빠른 버전으로 나뉘게 됩니다.

<!--truncate-->

### 버전 1: 조회, 삽입, 삭제 모두 개선된 버전

리스트의 요소 삭제, 삽입, 조회 모두 평균적으로 빠르게 동작할 수 있도록 만든 자료구조입니다. 해시 테이블에 데이터를 저장하며 자료구조 내에서 자체적으로 인덱스 계산을 진행하며 리스트의 성능은 현재 삭제한 요소의 수에 따라 변화합니다. 또한, 임계값을 설정하여 성능 개선이 필요할 때가 오면 리스트 재정렬 로직을 실행합니다.

**N = 리스트의 길이, R = 현재까지 삭제된 요소 수(재정렬 시 초기화)**

- 공간복잡도: **O(N+R)**
- 조회 시간복잡도: **O(R)** / 재정렬 로직 실행 시: **O(N+R)**
- 삽입 시간복잡도: **O(R)** / 재정렬 로직 실행 시: **O(N+R)**
- 삭제 시간복잡도: **O(R)** / 재정렬 로직 실행 시: **O(N+R)**


### 버전 2: 조회, 삽입이 빠른 버전

리스트의 요소 조회, 삽입을 빠르게 동작할 수 있도록 만든 자료구조입니다. 해시 테이블에 데이터를 저장하며 자료구조 내에서 자체적으로 인덱스를 만들고 활용하며, 삭제할 때 인덱스 조정을 통해 해시 테이블을 리스트처럼 사용할 수 있게 만듭니다.

- 공간복잡도: **O(N)**
- 조회 시간복잡도: **O(1)**
- 삽입 시간복잡도: **O(1)**
- 삭제 시간복잡도: **O(N)**

<br/>

## 사전 학습

---

해시 리스트를 구현하기 위해서는 배열, 링크드리스트, 해시테이블 3가지 자료구조를 알아야 합니다.

### Array

배열은 동일한 데이터 형식의 요소들을 일렬로 나열한 선형 자료구조입니다. 각 요소는 고유한 인덱스(또는 위치)를 가지며, 이 인덱스를 사용하여 요소에 접근할 수 있습니다.

#### 특징

- **고정된 크기** - 배열은 일반적으로 생성할 때 크기가 정해지며, 크기를 변경하기 어렵습니다.
- **인덱스** - 각 요소는 고유한 순서를 가지며, 이를 사용하여 요소에 접근합니다.
- **데이터 타입** - 배열은 동일한 데이터 타입의 요소만 포함할 수 있습니다.
- **빠른 조회** - 인덱스를 사용하므로 특정 요소에 빠르게 접근할 수 있습니다.
- **메모리 공간** - 연속적인 메모리 공간에 요소들이 저장되므로 메모리 관리 측면에서 효율적입니다.
- **느린 삭제/삽입** - 배열 중간에 요소 삭제/삽입 시, 해당 인덱스 이후 모든 요소를 메모리 공간에서 옮겨야 합니다.

### Linked List

연결리스트는 데이터 요소들을 순서대로 저장하는 선형 자료구조입니다. 연결리스트의 각 노드는 데이터와 다음 요소를 가리키는 링크(포인터)로 연결된 구조로 이루어져 있습니다.

#### 특징

- **동적 크기**: 연결 리스트의 크기는 동적으로 조절할 수 있으므로 필요할 때 요소를 추가하거나 삭제할 수 있습니다.
- **빠른 삽입 및 삭제**: 연결 리스트는 삽입 및 삭제 작업이 배열처럼 메모리 공간 이동이 일어나지 않습니다.
- **메모리 공간**: 연결리스트의 각 노드는 연속적으로 메모리 할당하지 않기에 메모리를 미리 할당하지 않습니다.
- **느린 조회**: 배열과 다르게 임의 값 조회가 순서대로 노드를 탐색하며 움직이기에 느립니다.
- **종류**: 단일 연결 리스트(Singly Linked List), 이중 연결 리스트(Doubly Linked List), 원형 연결 리스트(Circular Linked List) 등이 존재합니다.

#### 배열과 리스트 특징 비교

|                | Array | Linked List |
| -------------- | ----- | ----------- |
| 동적 크기 변경 | X     | O           |
| 중간 요소 삽입 | 느림  | 빠름        |
| 중간 요소 삭제 | 느림  | 빠름        |
| 중간 요소 조회 | 빠름  | 느림        |
| 메모리 공간    | 지정  | 가변        |

### Hash Table

해시 테이블(Hash Table)은 키-값(key-value)을 통해 데이터를 저장하는 자료구조입니다. 해시 테이블의 키는 해시함수를 통해 인덱스가 결정되며 이 인덱스 자리에 값을 넣어 상수시간 내로 조회할 수 있게 합니다. 여러 언어에서 딕셔너리(Dictionary), 오브젝트(Object), 해시맵(HashMap) 등의 이름으로 불립니다.

#### 특징

- **동적 크기**: 해시 테이블은 동적으로 크기를 조정할 수 있으므로 요소를 추가하거나 제거할 때 자동으로 크기를 조절할 수 있습니다.
- **키(Key)**: 배열의 모든 데이터의 인덱스가 서로 다른 것처럼 해시 테이블의 키도 고유한 값이어야 합니다.
- **해시함수**: 고유한 키를 바탕으로 해시 함수를 실행하고 인덱스를 만들어 사용합니다.
- **빠른 조회**: 키 값을 바탕으로 상수 시간의 접근을 가능하게 합니다.
- **충돌 제어**: 해시 함수를 통해 만든 인덱스는 제한된 메모리공간에서 진행되기 때문에 인덱스 충돌이 날 수 있습니다. 이 때, 선형, 참조, 공간 확장을 통해 충돌된 인덱스를 제어하고 그러한 값들이 많아지는 임계값 설정을 통해 해시 테이블의 성능을 개선합니다.

<br/>

## 버전 1 구현

---

### 구현 아이디어 및 설명

이 버전의 주요 로직은 **삭제한 인덱스를 저장**해 두고 리스트에 접근할 때 **접근 인덱스를 조정**시키는 것입니다. 수도코드로 예를 들어보겠습니다. 밑과 같이 삭제된 인덱스를 저장할 리스트를 두고 해시테이블을 생성합니다. 

```
revmovedIndices = []
hashTable = {
  0: 10,
  1: 20,
  2: 30,
  3: 40
}
```

그후, 인덱스 2인 요소를 삭제합니다. 그러면 밑과 같이 삭제된 요소와 해시테이블이 존재하게 됩니다.

```
revmovedIndices = [2]
hashTable = {
  0: 10,
  1: 20,
  3: 40
}
```

원래 리스트에선 현재 상태에 인덱스 2를 요청하면 40이 나와야합니다. 왜냐하면 앞의 데이터가 삭제되었기 때문이죠. 그런데 해시테이블에서는 인덱스 2를 요청해도 없는 값이 나오게 됩니다. 키 값이 삭제되어도 그 빈자리를 채우지 않는 자료구조이기 때문입니다. 그렇기 때문에 이 자료구조를 리스트 형식으로 바꾸기 위해서는 **인덱스 조정작업**을 거쳐야 합니다. 밑과 같이 현재 삭제된 인덱스를 돌며, 현재 가져오려는 인덱스 이하인 삭제된 인덱스마다 1씩 증가를 시켜주면 해시테이블에 제대로 접근할 수 있게 됩니다.

```
func adjustIndex(idx) {
  for (removedIdx in revmovedIndices) {
    if (idx >= removedIdx) idx++
  }
    
  return idx
}
```

<br/>

인덱스 조정작업에는 리스크가 있습니다. **삭제된 요소가 많아질수록 인덱스 조정작업의 비용이 커진다는 것**입니다. 이런 오버헤드를 줄이기 위해 해시리스트에는 **재정렬 임계값**이 존재하고 해당 임계값을 넘어서면 삭제된 인덱스들을 모두 지우고 해시테이블을 재정렬하게 됩니다. 재정렬은 비용이 크기 때문에 적절한 임계 값을 부여하는 것이 좋습니다. 밑의 로직은 임계 값을 기반으로 실행된 횟수와 삭제된 요소 수를 확인하여 재정렬하는 로직입니다. 해시테이블을 새로 생성하고 삭제된 값만큼 앞으로 옮겨오는 것을 볼 수 있습니다.

```
executedCount = {명령 실행 수}
threshold = {임계 값}

func rearrangeIndices() {
  if (executedCount < threshold && revmovedIndices.length < threshold / 10) {
    return
  }
  
  newHashTable = {}
  removedIndicesIdx = 0
  for (i in range(hashTable.size + removedIndices.length)) {
    if (removedIndices[removedIndicesIdx] == i) {
        removedIndicesIdx++
        continue
      }
      newHashTable[i - removedIndicesIdx] = hashTable[i]
  }

  //------ 값 지정 --------
  hashTable = newHashTable
  executedCount = 0
  revmovedIndices = []
}
```

위의 로직민 보면 조금 의문점이 들 수 있습니다. 저 코드에서 `removedIndices`이 정렬된 상태가 아니라면 제대로 동작하지 않기 때문입니다. 그렇기 때문에 재정렬 로직이 정상적으로 작동하기 위한 전제조건인 **`removedIndices`이 정렬된 상태 보장**을 삭제 시점에서 잘 정리해줘야 합니다. 삭제로직에서는 `removedIndices`에 인덱스를 그냥 넣는 것이 아닌 해당된 위치를 찾고 넣어주는 작업을 합니다.(여기서 이진탐색을 사용한다면 시간을 유의미하게 줄일 수 있습니다.) 밑은 삭제 로직 코드입니다.

```
func remove(index) {
  adjustedIndex = adjustIndex(index)
  delete hashTable[adjustedIndex]
  location = bisect(adjustedIndex, removedIndices)
  for (i in range(removedIndices.length, location, -1)) {
    removedIndices[i] = removedIndices[i-1]
  }
  removedIndices[location] = adjustedIndex
}
```

지금까지 주요 로직을 살펴보았고, 위와 같은 아이디어를 통해 해시리스트 버전 1을 구현하게 됩니다. 이제 실제 코드로 확인해보겠습니다. 밑의 [실제 구현 및 테스트 코드](#실제-구현-및-테스트-코드)를 보시면 실제 구현한 해시 리스트를 확인할 수 있고, 실행해보면 모든 테스트를 통과함을 확인할 수 있습니다.


### 실제 구현 및 테스트 코드

해당 코드는 타입스크립트로 작성하였습니다.

```ts
type Indices<T> = {
  [key: number]: T;
};

const bisect = (target: number, arr: number[]): number => {
  let [s, e] = [0, arr.length];
  while (s < e) {
    const mid = Math.floor((s + e) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] > target) {
      e = mid;
    } else {
      s = mid + 1;
    }
  }
  return s;
};

class HashList<T> {
  private indices: Indices<T>;
  private removedIndices: number[];
  private getCount: number;
  private threshold: number;
  public size: number;

  constructor(threshold: number = 200) {
    this.indices = {};
    this.removedIndices = [];
    this.getCount = 0;
    this.threshold = threshold;
    this.size = 0;
  }

  private isValidIndex(index: number, rangeMore: number = 0): boolean {
    if (index > this.size - 1 + rangeMore || index < 0) {
      return false;
    }
    return true;
  }

  private adjustTargetIndex(index: number): number {
    for (const x of this.removedIndices) {
      if (index >= x) {
        index++;
      }
    }
    return index;
  }

  private rearrangeIndices(): void {
    if (
      this.getCount < this.threshold &&
      this.removedIndices.length < this.threshold / 50
    ) {
      return;
    }
    const newIndices: Indices<T> = {};
    const oldLength =
      Object.keys(this.indices).length + this.removedIndices.length;
    let removedIndicesIdx = 0;
    for (let i = 0; i < oldLength; i++) {
      if (this.removedIndices[removedIndicesIdx] == i) {
        removedIndicesIdx++;
        continue;
      }
      newIndices[i - removedIndicesIdx] = this.indices[i];
    }

    this.indices = newIndices;
    this.getCount = 0;
    this.removedIndices = [];
  }

  add(value: T, index: number = this.size): void {
    this.rearrangeIndices();
    if (!this.isValidIndex(index, 1)) {
      throw new Error('out of index');
    }
    const adjustedIndex = this.adjustTargetIndex(index);
    this.indices[adjustedIndex] = value;
    if (index == this.size) {
      this.size++;
    }
  }

  get(index: number): T {
    this.rearrangeIndices();
    this.getCount++;

    if (!this.isValidIndex(index)) {
      throw new Error('out of index');
    }
    const adjustedIndex = this.adjustTargetIndex(index);
    return this.indices[adjustedIndex];
  }

  remove(index: number): void {
    this.rearrangeIndices();
    if (!this.isValidIndex(index)) {
      throw new Error('out of index');
    }

    const adjustedIndex = this.adjustTargetIndex(index);
    delete this.indices[adjustedIndex];
    const location = bisect(adjustedIndex, this.removedIndices);
    const curLength = this.removedIndices.length;
    for (let i = curLength; i > location; i--) {
      this.removedIndices[i] = this.removedIndices[i-1];
    }
    this.removedIndices[location] = adjustedIndex;
    this.size--;
  }
}

// ---------- Test -----------
const hashList = new HashList<number>();
console.log(hashList.size === 0);
hashList.add(1);
console.log(hashList.get(0) === 1);
hashList.add(2);
hashList.add(3);
hashList.add(1);
hashList.add(1);
console.log(hashList.size === 5);
console.log(hashList.get(1) === 2);
console.log(hashList.get(2) === 3);
hashList.remove(1);
hashList.remove(1);
hashList.remove(0);
hashList.add(5);
hashList.add(16, 1);
hashList.add(5);
hashList.add(55, 2);
hashList.add(66);
console.log(hashList.size === 5);
console.log(hashList.get(0) === 1);
console.log(hashList.get(1) === 16);
console.log(hashList.get(2) === 55);
hashList.remove(2);
hashList.remove(1); // execute rearrange logic
hashList.remove(0);
console.log(hashList.size === 2);
console.log(hashList.get(1) === 66);
console.log(hashList.get(0) === 5);
```

<br/>

## 버전 2 구현

---

### 구현 아이디어 및 설명

이 버전의 주요 로직은 **삭제할 때 인덱스 재정렬**을 해준다는 점입니다. 버전 1과 같이 수도코드로 예를 들어보겠습니다. 밑과 같이 삭제된 인덱스를 저장할 리스트를 두고 해시테이블을 생성합니다.



```
hashTable = {
  0: 10,
  1: 20,
  2: 30,
  3: 40
}
```

그후, 인덱스 2인 요소를 삭제합니다. 그러면 밑과 같이 삭제된 요소 때문에 인덱스가 선형으로 이어지지 않게 됩니다.

```
hashTable = {
  0: 10,
  1: 20,
  3: 40
}
```

하지만 버전 2 해시 리스트에서는 밑과 같이 해시테이블이 남게 됩니다. 인덱스 재정렬 작업을 삭제할 때 바로 실행하여 조회와 삽입에 이상이 없도록 만드는 게 버전 2의 주요 아이디어라고 볼 수 있습니다.

```
hashTable = {
  0: 10,
  1: 20,
  2: 40
}
```

해당 아이디어가 되기 위해서는 삭제 시 재정렬하는 밑과 같은 로직이 필요합니다. 버전 1을 보고 왔다면 크게 어려움이 없는 코드라 생각합니다.

```
func rearrangeIndices(index) {
  for (i in range(index, hashTable.length, 1)) {
    hashTable[i] = hashTable[i+1];
  }
}

func remove(index) {
  delete hashTable[index];
  rearrangeIndices(index);
}
```

위 아이디어를 종합해서 보면 사실 배열 삭제방식과 같다고 볼 수 있습니다. 하지만 **해시 테이블의 삽입속도를 그대로 가져와 리스트에 사용할 수 있다는 것** 때문에 개선되었다고 볼 수 있습니다. 밑의 표를 보면 확실하게 알 수 있습니다.

|                | Array | Linked List | Hash List 1 | Hash List 2 |
| -------------- | ----- | ----------- |  ----------- |  ----------- |
| 동적 크기 변경 | X     | O           | O           | O           |
| 중간 요소 삽입 | 느림  | 빠름        | (조건부)빠름    | 빠름        |
| 중간 요소 삭제 | 느림  | 빠름        | (조건부)빠름    | 느림        |
| 중간 요소 조회 | 빠름  | 느림        | (조건부)빠름    | 빠름        |
| 메모리 공간    | 지정  | 가변        | 가변        | 가변        |

이렇게 버전 2의 아이디어와 기존 배열, 리스트와의 비교점도 확인해보았습니다. 이제 실제 코드를 구현해보겠습니다. 밑의 [실제 구현 및 테스트 코드](#실제-구현-및-테스트-코드)를 보시면 실제 구현한 해시 리스트를 확인할 수 있고, 실행해보면 모든 테스트를 통과함을 확인할 수 있습니다.

### 실제 구현 및 테스트 코드

해당 코드는 타입스크립트로 작성하였습니다.

```ts
type Indices<T> = {
  [key: number]: T;
};

class HashList<T> {
  private indices: Indices<T>;
  private removedIndices: number[];
  public size: number;

  constructor() {
    this.indices = {};
    this.removedIndices = [];
    this.size = 0;
  }

  private isValidIndex(index: number, rangeMore: number = 0): boolean {
    if (index > this.size - 1 + rangeMore || index < 0) {
      return false;
    }
    return true;
  }

  private rearrangeIndices(index: number): void {
    const curLength = Object.keys(this.indices).length;
    for (let i = index; i < curLength; i++) {
      this.indices[i] = this.indices[i+1];
    }
  }

  add(value: T, index: number = this.size): void {
    if (!this.isValidIndex(index, 1)) {
      throw new Error('out of index');
    }
    this.indices[index] = value;
    if (index == this.size) {
      this.size++;
    }
  }

  get(index: number): T {
    if (!this.isValidIndex(index)) {
      throw new Error('out of index');
    }
    return this.indices[index];
  }

  remove(index: number): void {
    if (!this.isValidIndex(index)) {
      throw new Error('out of index');
    }

    delete this.indices[index];
    this.rearrangeIndices(index);
    this.size--;
  }
}

// ---------- Test -----------
const hashList = new HashList<number>();
console.log(hashList.size === 0);
hashList.add(1);
console.log(hashList.get(0) === 1);
hashList.add(2);
hashList.add(3);
hashList.add(1);
hashList.add(1);
console.log(hashList.size === 5);
console.log(hashList.get(1) === 2);
console.log(hashList.get(2) === 3);
hashList.remove(1);
hashList.remove(1);
hashList.remove(0);
hashList.add(5);
hashList.add(16, 1);
hashList.add(5);
hashList.add(55, 2);
hashList.add(66);
console.log(hashList.size === 5);
console.log(hashList.get(0) === 1);
console.log(hashList.get(1) === 16);
console.log(hashList.get(2) === 55);
hashList.remove(2);
hashList.remove(1);
hashList.remove(0);
console.log(hashList.size === 2);
console.log(hashList.get(1) === 66);
console.log(hashList.get(0) === 5);
```

<br/>

## 끝으로

---

지금까지 조회 및 삽입이 빠른 자료구조(해시 리스트 버전 1)와 조회, 삭제 및 삽입을 모두 개선한 자료구조(해시 리스트 버전 2)에 대해 소개해드렸습니다. 실제로 사용하려면 많은 개선을 거쳐야겠지만 언젠간 해당 코드가 베이스가 되어 해시 리스트가 실제로 사용되는 날이 있었으면 좋겠습니다.

<br/>

<div style={{"text-align": "right"}}> 최종 업데이트: 2023년 10월 27일 </div>
