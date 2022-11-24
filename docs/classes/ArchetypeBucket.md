[@miniplex/core](../README.md) / [Exports](../modules.md) / ArchetypeBucket

# Class: ArchetypeBucket<E\>

A bucket representing a subset of entities that have a
specific set of components.

## Type parameters

| Name |
| :------ |
| `E` |

## Hierarchy

- [`DerivedEntityBucket`](DerivedEntityBucket.md)<`E`\>

  ↳ **`ArchetypeBucket`**

## Table of contents

### Constructors

- [constructor](ArchetypeBucket.md#constructor)

### Properties

- [buckets](ArchetypeBucket.md#buckets)
- [entities](ArchetypeBucket.md#entities)
- [onEntityAdded](ArchetypeBucket.md#onentityadded)
- [onEntityRemoved](ArchetypeBucket.md#onentityremoved)
- [query](ArchetypeBucket.md#query)
- [source](ArchetypeBucket.md#source)

### Accessors

- [first](ArchetypeBucket.md#first)
- [size](ArchetypeBucket.md#size)

### Methods

- [[iterator]](ArchetypeBucket.md#[iterator])
- [add](ArchetypeBucket.md#add)
- [archetype](ArchetypeBucket.md#archetype)
- [clear](ArchetypeBucket.md#clear)
- [evaluate](ArchetypeBucket.md#evaluate)
- [has](ArchetypeBucket.md#has)
- [remove](ArchetypeBucket.md#remove)
- [startUpdating](ArchetypeBucket.md#startupdating)
- [update](ArchetypeBucket.md#update)
- [wants](ArchetypeBucket.md#wants)
- [where](ArchetypeBucket.md#where)
- [with](ArchetypeBucket.md#with)
- [without](ArchetypeBucket.md#without)

## Constructors

### constructor

• **new ArchetypeBucket**<`E`\>(`source`, `query`)

#### Type parameters

| Name |
| :------ |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`Bucket`](Bucket.md)<`any`\> |
| `query` | `Partial`<[`ArchetypeWithQuery`](../modules.md#archetypewithquery)<`E`, keyof `E`\> & [`ArchetypeWithoutQuery`](../modules.md#archetypewithoutquery)<`E`, keyof `E`\>\> |

#### Overrides

[DerivedEntityBucket](DerivedEntityBucket.md).[constructor](DerivedEntityBucket.md#constructor)

#### Defined in

[miniplex-core/src/buckets.ts:214](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L214)

## Properties

### buckets

• **buckets**: `Set`<[`EntityBucket`](EntityBucket.md)<`any`\>\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[buckets](DerivedEntityBucket.md#buckets)

#### Defined in

[miniplex-core/src/buckets.ts:17](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L17)

___

### entities

• **entities**: `E`[]

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[entities](DerivedEntityBucket.md#entities)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:8

___

### onEntityAdded

• **onEntityAdded**: `Event`<`E`\>

Fired when an entity has been added to the bucket.

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[onEntityAdded](DerivedEntityBucket.md#onentityadded)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:19

___

### onEntityRemoved

• **onEntityRemoved**: `Event`<`E`\>

Fired when an entity is about to be removed from the bucket.

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[onEntityRemoved](DerivedEntityBucket.md#onentityremoved)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:23

___

### query

• **query**: `Partial`<[`ArchetypeWithQuery`](../modules.md#archetypewithquery)<`E`, keyof `E`\> & [`ArchetypeWithoutQuery`](../modules.md#archetypewithoutquery)<`E`, keyof `E`\>\>

#### Defined in

[miniplex-core/src/buckets.ts:216](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L216)

___

### source

• **source**: [`Bucket`](Bucket.md)<`any`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[source](DerivedEntityBucket.md#source)

#### Defined in

[miniplex-core/src/buckets.ts:215](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L215)

## Accessors

### first

• `get` **first**(): `undefined` \| `E`

Returns the first entity in the bucket, or `undefined` if the bucket is empty.

#### Returns

`undefined` \| `E`

#### Inherited from

DerivedEntityBucket.first

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:35

___

### size

• `get` **size**(): `number`

Returns the total size of the bucket, i.e. the number of entities it contains.

#### Returns

`number`

#### Inherited from

DerivedEntityBucket.size

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

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[[iterator]](DerivedEntityBucket.md#[iterator])

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

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[add](DerivedEntityBucket.md#add)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:50

___

### archetype

▸ **archetype**<`D`\>(`predicate`): [`PredicateBucket`](PredicateBucket.md)<`D`\>

#### Type parameters

| Name |
| :------ |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../modules.md#predicate)<`E`, `D`\> |

#### Returns

[`PredicateBucket`](PredicateBucket.md)<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:97](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L97)

▸ **archetype**<`P`\>(`query`): [`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`ArchetypeWithQuery`](../modules.md#archetypewithquery)<`E`, `P`\> |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:101](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L101)

▸ **archetype**<`P`\>(`query`): [`ArchetypeBucket`](ArchetypeBucket.md)<`E`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`ArchetypeWithoutQuery`](../modules.md#archetypewithoutquery)<`E`, keyof `E`\> |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`E`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:105](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L105)

▸ **archetype**<`P`\>(`query`): [`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `Partial`<[`ArchetypeWithQuery`](../modules.md#archetypewithquery)<`E`, `P`\> & [`ArchetypeWithoutQuery`](../modules.md#archetypewithoutquery)<`E`, keyof `E`\>\> |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:109](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L109)

▸ **archetype**<`D`\>(`query`): [`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Required`<`Pick`<`E`, `any`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `Partial`<[`ArchetypeWithQuery`](../modules.md#archetypewithquery)<`E`, `any`\> & [`ArchetypeWithoutQuery`](../modules.md#archetypewithoutquery)<`E`, keyof `E`\>\> |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:113](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L113)

▸ **archetype**<`P`\>(...`components`): [`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...components` | `P`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:119](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L119)

▸ **archetype**<`D`\>(...`components`): [`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Required`<`Pick`<`E`, `any`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...components` | keyof `D`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[archetype](DerivedEntityBucket.md#archetype)

#### Defined in

[miniplex-core/src/buckets.ts:121](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L121)

___

### clear

▸ **clear**(): `void`

Removes all entities from the bucket. Will cause the `onEntityRemoved` event to be
fired for each entity.

#### Returns

`void`

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[clear](DerivedEntityBucket.md#clear)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:63

___

### evaluate

▸ **evaluate**(`entity`, `future?`): `void`

Evaluates the given entity (`entity`) to check if it should be in this bucket or not.
The entity will be added or removed from this bucket as necessary.

If you pass a second argument (`future`) into this function, it will be used
for these checks instead of the entity itself. This is useful in sutations
where you're about to make a destructive change to the entity, and want to
give archetype callbacks a chance to run with the entity intact before actually
making the change.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `entity` | `E` | `undefined` | The entity that is being evaluated. |
| `future` | `E` | `entity` | An optional future version of the entity that is used in the check. |

#### Returns

`void`

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[evaluate](DerivedEntityBucket.md#evaluate)

#### Defined in

[miniplex-core/src/buckets.ts:43](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L43)

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

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[has](DerivedEntityBucket.md#has)

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

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[remove](DerivedEntityBucket.md#remove)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:58

___

### startUpdating

▸ `Protected` **startUpdating**(): `void`

#### Returns

`void`

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[startUpdating](DerivedEntityBucket.md#startupdating)

#### Defined in

[miniplex-core/src/buckets.ts:170](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L170)

___

### update

▸ **update**(): `void`

Updates the contents of this bucket by iterating over the entities
in its source bucket, re-checking each one to see if it should be
in this bucket or not.

#### Returns

`void`

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[update](DerivedEntityBucket.md#update)

#### Defined in

[miniplex-core/src/buckets.ts:187](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L187)

___

### wants

▸ **wants**(`entity`): entity is E

Returns `true` if the given entity should be in this bucket. Child classes
should override this method to implement custom bucket logic.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entity` | `any` | The entity to check for. |

#### Returns

entity is E

`true` if this bucket wants the specified entity, `false` otherwise.

#### Overrides

[DerivedEntityBucket](DerivedEntityBucket.md).[wants](DerivedEntityBucket.md#wants)

#### Defined in

[miniplex-core/src/buckets.ts:222](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L222)

___

### where

▸ **where**<`D`\>(`predicate`): `Iterable`<`D`\>

#### Type parameters

| Name |
| :------ |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../modules.md#predicate)<`E`, `D`\> |

#### Returns

`Iterable`<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[where](DerivedEntityBucket.md#where)

#### Defined in

[miniplex-core/src/buckets.ts:59](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L59)

___

### with

▸ **with**<`P`\>(...`props`): [`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...props` | `P`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<[`With`](../modules.md#with)<`E`, `P`\>\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[with](DerivedEntityBucket.md#with)

#### Defined in

[miniplex-core/src/buckets.ts:81](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L81)

▸ **with**<`D`\>(...`props`): [`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Required`<`Pick`<`E`, `any`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...props` | keyof `D`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[with](DerivedEntityBucket.md#with)

#### Defined in

[miniplex-core/src/buckets.ts:82](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L82)

___

### without

▸ **without**<`P`\>(...`props`): [`ArchetypeBucket`](ArchetypeBucket.md)<`E`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...props` | `P`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`E`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[without](DerivedEntityBucket.md#without)

#### Defined in

[miniplex-core/src/buckets.ts:89](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L89)

▸ **without**<`D`\>(...`props`): [`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Type parameters

| Name |
| :------ |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...props` | keyof `D`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Inherited from

[DerivedEntityBucket](DerivedEntityBucket.md).[without](DerivedEntityBucket.md#without)

#### Defined in

[miniplex-core/src/buckets.ts:90](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L90)
