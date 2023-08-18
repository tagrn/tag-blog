---
slug: improve-redis-speed
title: Spring에서 Redis 속도 10배 올리기
authors: [tagrn]
---

## 캐싱을 위한 라이브러리는 따로 있다.

JPA를 사용하며 Spring을 구성한 경우, Redis를 쓸 때, 굳이 다른 라이브러리를 쓰지 않고 문법이 비슷한 CrudRepository를 쓰게 된다. 하지만 이 Redis를 캐시용도로 쓸 것이었다면 이것은 큰 기술부채가 될 수 있다.

<!--truncate-->

### 왜 그런가요?

Spring에서 Redis를 사용하는데는 크게 두 가지 라이브러리(RedisTemplate, CrudRepository)가 있다. TPS가 적다면 별다른 걱정없이 아무 라이브러리를 사용하면 되겠지만, TPS가 높아 캐싱용도로 사용하는 거라면 RedisTemplate을 사용해야 한다. 서로 로직이 달라 CrudRepository를 사용하는 것보다 약 10배정도의 성능향상을 꾀할 수 있기 때문이다.

<br/>

## RedisTemplate 로직

RedisTemplate 사용 시에는 Operation 을 반환하여 해당 Operation을 통해 데이터를 redis에 저장할 수 있게 된다. 예를 들어 Hash 객체를 사용하는 경우, `HashOperations`를 반환하여 해당 Operation 의 메서드를 사용하게 되는데, 이는 Redis에 저장하는 로직 밖에 없어 간단하다.

**RedisTemplate 코드**

```java
	@Override
	public void put(K key, HK hashKey, HV value) {

		byte[] rawKey = rawKey(key);
		byte[] rawHashKey = rawHashKey(hashKey);
		byte[] rawHashValue = rawHashValue(value);

		execute(connection -> {
			connection.hSet(rawKey, rawHashKey, rawHashValue);
			return null;
		});
	}
```

<br/>

## CrudRepository 로직

해당 라이브러리는 캐시용도로 쓰기엔 추상화가 매우 많이 되어있고 옵션도 많다. 따라서 진행되는 과정도 단순하지 않다.

처음 save 메서드를 호출하면 insert와 update 분기를 나누는 작업이 있는데, Redis 객체의 경우엔 `@RedisHash` 어노테이션으로 이미 객체의 `id`가 있어 update 로 판단되어 진행된다. 그리고 update 에서는 adapter에 put 메서드를 요청하게 되며, **KeySpace 조정작업**을 거치게 된다.

<br/>

> KeySpace 는 단순 조회, 저장용도가 아닌 SecondIndex 처럼 옵션 기능을 위한 Index Set 이다.

<br/>

**CrudRepository 코드 1**

```java
	@Override
	public <T> T update(Object id, T objectToUpdate) {

		Assert.notNull(id, "Id for object to be inserted must not be null");
		Assert.notNull(objectToUpdate, "Object to be updated must not be null");

		String keyspace = resolveKeySpace(objectToUpdate.getClass());

		potentiallyPublishEvent(KeyValueEvent.beforeUpdate(id, keyspace, objectToUpdate.getClass(), objectToUpdate));

		Object existing = execute(adapter -> adapter.put(id, objectToUpdate, keyspace));

		potentiallyPublishEvent(
				KeyValueEvent.afterUpdate(id, keyspace, objectToUpdate.getClass(), objectToUpdate, existing));

		return objectToUpdate;
	}
```

<br/>

그리고 중간의 `adapter` 라는 녀석이 put 메서드를 호출하는 것을 확인할 수 있는데, 해당 put은 RedisTemplate 의 put 과 다르다. 밑에 실제코드가 존재하고 이런 코드를 통해서 여러가지 작업을 많이 하게 된다. 이렇게 명령어가 전달되는 수 자체가 put 하나를 위해 딸려오게 된다.

<br/>

**CrudRepository 코드 2**

```java
	@Override
	public Object put(Object id, Object item, String keyspace) {

		RedisData rdo = item instanceof RedisData ? (RedisData) item : new RedisData();
		if (!(item instanceof RedisData)) {
			converter.write(item, rdo);
		}

		if (ObjectUtils.nullSafeEquals(EnableKeyspaceEvents.ON_DEMAND, enableKeyspaceEvents)
				&& this.expirationListener.get() == null) {

			if (rdo.getTimeToLive() != null && rdo.getTimeToLive() > 0) {
				initKeyExpirationListener();
			}
		}

		if (rdo.getId() == null) {
			rdo.setId(converter.getConversionService().convert(id, String.class));
		}

		redisOps.execute((RedisCallback<Object>) connection -> {

			byte[] key = toBytes(rdo.getId());
			byte[] objectKey = createKey(rdo.getKeyspace(), rdo.getId());

			boolean isNew = connection.del(objectKey) == 0;

			connection.hMSet(objectKey, rdo.getBucket().rawMap());

			if (isNew) {
				connection.sAdd(toBytes(rdo.getKeyspace()), key);
			}

			if (expires(rdo)) {
				connection.expire(objectKey, rdo.getTimeToLive());
			}

			if (keepShadowCopy()) { // add phantom key so values can be restored

				byte[] phantomKey = ByteUtils.concat(objectKey, BinaryKeyspaceIdentifier.PHANTOM_SUFFIX);

				if (expires(rdo)) {

					connection.del(phantomKey);
					connection.hMSet(phantomKey, rdo.getBucket().rawMap());
					connection.expire(phantomKey, rdo.getTimeToLive() + PHANTOM_KEY_TTL);
				} else if (!isNew) {
					connection.del(phantomKey);
				}
			}

			IndexWriter indexWriter = new IndexWriter(connection, converter);
			if (isNew) {
				indexWriter.createIndexes(key, rdo.getIndexedData());
			} else {
				indexWriter.deleteAndUpdateIndexes(key, rdo.getIndexedData());
			}
			return null;
		});

		return item;
	}
```


<br/>


## 실제 속도 비교

같은 환경으로 Redis 속도 비교를 해보았다. 평균적인 속도를 기준으로 나타내었고, RedisTemplate의 속도가 훨씬 빠름을 알 수 있었다.

|                | 저장 | 조회(데이터 없을 경우) | 조회(데이터 있을 경우) |
| -------------- | ---- | ---------------------- | ---------------------- |
| RedisTemplate  | 5ms    | 3ms                      | 3ms                      |
| CrudRepository | 45ms   | 3ms                      | 13ms                     |


<br/>

## 요약

:::note
**CrudRepository가 RedisTemplate보다 느린 이유**

1. KeySpace의 존재
   * 단순 캐시용으로 SencondIndex 같은 옵션을 사용하지 않을 경우엔 KeySpace가 필요없지만 CrudRepository는 사용함.
   * KeySpace의 크기가 커질수록 속도가 더 느려지며 BigKey가 될 수 있음.
2. 사용하지 않아도 될 명령어를 전달
   * ex. TTL 을 확인하는 명령어도 사용하지 않아도 될 타이밍에 사용하는 경우가 있음.
3. 명령어 중에 O(n) 의 속도 가진 명령어가 존재
   * ex. hget을 써도 될 것을 hgetall 을 씀.
:::

<br/>
