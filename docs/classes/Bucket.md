[@miniplex/core](../README.md) / [Exports](../modules.md) / Bucket

# Class: Bucket<E\>

A class wrapping an array of entities of a specific type, providing
performance-optimized methods for adding, looking up and removing entities, and events
for when entities are added or removed.

## Type parameters

| Name |
| :------ |
| `E` |

## Hierarchy

- **`Bucket`**

  ↳ [`EntityBucket`](EntityBucket.md)

## Implements

- `Iterable`<`E`\>

## Table of contents

### Constructors

- [constructor](Bucket.md#constructor)

### Properties

- [entities](Bucket.md#entities)
- [entityPositions](Bucket.md#entitypositions)
- [onEntityAdded](Bucket.md#onentityadded)
- [onEntityRemoved](Bucket.md#onentityremoved)

### Accessors

- [first](Bucket.md#first)
- [size](Bucket.md#size)

### Methods

- [[iterator]](Bucket.md#[iterator])
- [add](Bucket.md#add)
- [clear](Bucket.md#clear)
- [has](Bucket.md#has)
- [remove](Bucket.md#remove)

## Constructors

### constructor

• **new Bucket**<`E`\>(`entities?`)

#### Type parameters

| Name |
| :------ |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entities?` | `E`[] |

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:15

## Properties

### entities

• **entities**: `E`[]

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:8

___

### entityPositions

• `Private` **entityPositions**: `any`

A map of entity positions, used for fast lookups.

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:27

___

### onEntityAdded

• **onEntityAdded**: `Event`<`E`\>

Fired when an entity has been added to the bucket.

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:19

___

### onEntityRemoved

• **onEntityRemoved**: `Event`<`E`\>

Fired when an entity is about to be removed from the bucket.

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:23

## Accessors

### first

• `get` **first**(): `undefined` \| `E`

Returns the first entity in the bucket, or `undefined` if the bucket is empty.

#### Returns

`undefined` \| `E`

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:35

___

### size

• `get` **size**(): `number`

Returns the total size of the bucket, i.e. the number of entities it contains.

#### Returns

`number`

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:31

## Methods

### [iterator]

▸ **[iterator]**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `next` | () => { `done`: `boolean` ; `value`: `E`  } |

#### Implementation of

Iterable.\_\_@iterator@83

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:9

___

### add

▸ **add**<`D`\>(`entity`): `D` & `E`

Adds the given entity to the bucket. If the entity is already in the bucket, it is
not added again.

#### Type parameters

| Name |
| :------ |
| `D` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entity` | `D` | The entity to add to the bucket. |

#### Returns

`D` & `E`

The entity passed into this function (regardless of whether it was added or not).

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:50

___

### clear

▸ **clear**(): `void`

Removes all entities from the bucket. Will cause the `onEntityRemoved` event to be
fired for each entity.

#### Returns

`void`

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:63

___

### has

▸ **has**(`entity`): entity is E

Returns true if the bucket contains the given entity.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entity` | `any` | The entity to check for. |

#### Returns

entity is E

`true` if the specificed entity is in this bucket, `false` otherwise.

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:42

___

### remove

▸ **remove**(`entity`): `E`

Removes the given entity from the bucket. If the entity is not in the bucket, nothing
happens.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entity` | `E` | The entity to remove from the bucket. |

#### Returns

`E`

The entity passed into this function (regardless of whether it was removed or not).

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:58
