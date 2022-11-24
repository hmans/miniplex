[@miniplex/core](../README.md) / [Exports](../modules.md) / World

# Class: World<E\>

An entity-aware bucket providing methods for creating
derived buckets, and tracking the buckets derived from it.

## Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `Object` = `any` |

## Hierarchy

- [`EntityBucket`](EntityBucket.md)<`E`\>

  ↳ **`World`**

## Table of contents

### Constructors

- [constructor](World.md#constructor)

### Properties

- [buckets](World.md#buckets)
- [entities](World.md#entities)
- [entityToId](World.md#entitytoid)
- [idToEntity](World.md#idtoentity)
- [nextId](World.md#nextid)
- [onEntityAdded](World.md#onentityadded)
- [onEntityRemoved](World.md#onentityremoved)

### Accessors

- [first](World.md#first)
- [size](World.md#size)

### Methods

- [[iterator]](World.md#[iterator])
- [add](World.md#add)
- [addComponent](World.md#addcomponent)
- [archetype](World.md#archetype)
- [clear](World.md#clear)
- [entity](World.md#entity)
- [evaluate](World.md#evaluate)
- [has](World.md#has)
- [id](World.md#id)
- [remove](World.md#remove)
- [removeComponent](World.md#removecomponent)
- [update](World.md#update)
- [wants](World.md#wants)
- [where](World.md#where)
- [with](World.md#with)
- [without](World.md#without)

## Constructors

### constructor

• **new World**<`E`\>(`entities?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | extends `Object` = `any` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `entities` | `E`[] | `[]` |

#### Overrides

[EntityBucket](EntityBucket.md).[constructor](EntityBucket.md#constructor)

#### Defined in

[miniplex-core/src/World.ts:4](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L4)

## Properties

### buckets

• **buckets**: `Set`<[`EntityBucket`](EntityBucket.md)<`any`\>\>

#### Inherited from

[EntityBucket](EntityBucket.md).[buckets](EntityBucket.md#buckets)

#### Defined in

[miniplex-core/src/buckets.ts:17](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L17)

___

### entities

• **entities**: `E`[]

#### Inherited from

[EntityBucket](EntityBucket.md).[entities](EntityBucket.md#entities)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:8

___

### entityToId

• `Private` **entityToId**: `Map`<`E`, `number`\>

#### Defined in

[miniplex-core/src/World.ts:77](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L77)

___

### idToEntity

• `Private` **idToEntity**: `Map`<`number`, `E`\>

#### Defined in

[miniplex-core/src/World.ts:78](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L78)

___

### nextId

• `Private` **nextId**: `number` = `0`

#### Defined in

[miniplex-core/src/World.ts:79](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L79)

___

### onEntityAdded

• **onEntityAdded**: `Event`<`E`\>

Fired when an entity has been added to the bucket.

#### Inherited from

[EntityBucket](EntityBucket.md).[onEntityAdded](EntityBucket.md#onentityadded)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:19

___

### onEntityRemoved

• **onEntityRemoved**: `Event`<`E`\>

Fired when an entity is about to be removed from the bucket.

#### Inherited from

[EntityBucket](EntityBucket.md).[onEntityRemoved](EntityBucket.md#onentityremoved)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:23

## Accessors

### first

• `get` **first**(): `undefined` \| `E`

Returns the first entity in the bucket, or `undefined` if the bucket is empty.

#### Returns

`undefined` \| `E`

#### Inherited from

EntityBucket.first

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:35

___

### size

• `get` **size**(): `number`

Returns the total size of the bucket, i.e. the number of entities it contains.

#### Returns

`number`

#### Inherited from

EntityBucket.size

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

[EntityBucket](EntityBucket.md).[[iterator]](EntityBucket.md#[iterator])

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:9

___

### add

▸ **add**<`D`\>(`entity`): `D` & `E`

Adds the given entity to the bucket. If the entity is already in the bucket, it is
not added again.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entity` | `D` | The entity to add to the bucket. |

#### Returns

`D` & `E`

The entity passed into this function (regardless of whether it was added or not).

#### Inherited from

[EntityBucket](EntityBucket.md).[add](EntityBucket.md#add)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:50

___

### addComponent

▸ **addComponent**<`C`\>(`entity`, `component`, `value`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `component` | `C` |
| `value` | `E`[`C`] |

#### Returns

`void`

#### Defined in

[miniplex-core/src/World.ts:48](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L48)

___

### archetype

▸ **archetype**<`D`\>(`predicate`): [`PredicateBucket`](PredicateBucket.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../modules.md#predicate)<`E`, `D`\> |

#### Returns

[`PredicateBucket`](PredicateBucket.md)<`D`\>

#### Inherited from

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[archetype](EntityBucket.md#archetype)

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

[EntityBucket](EntityBucket.md).[clear](EntityBucket.md#clear)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:63

___

### entity

▸ **entity**(`id`): `undefined` \| `E`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `number` |

#### Returns

`undefined` \| `E`

#### Defined in

[miniplex-core/src/World.ts:95](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L95)

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

[EntityBucket](EntityBucket.md).[evaluate](EntityBucket.md#evaluate)

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

[EntityBucket](EntityBucket.md).[has](EntityBucket.md#has)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:42

___

### id

▸ **id**(`entity`): `undefined` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |

#### Returns

`undefined` \| `number`

#### Defined in

[miniplex-core/src/World.ts:81](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L81)

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

[EntityBucket](EntityBucket.md).[remove](EntityBucket.md#remove)

#### Defined in

miniplex-bucket/dist/declarations/src/Bucket.d.ts:58

___

### removeComponent

▸ **removeComponent**(`entity`, `component`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `component` | keyof `E` |

#### Returns

`void`

#### Defined in

[miniplex-core/src/World.ts:61](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L61)

___

### update

▸ **update**(`entity`): `E`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |

#### Returns

`E`

#### Defined in

[miniplex-core/src/World.ts:18](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L18)

▸ **update**<`C`\>(`entity`, `component`, `value`): `E`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `component` | `C` |
| `value` | `E`[`C`] |

#### Returns

`E`

#### Defined in

[miniplex-core/src/World.ts:20](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L20)

▸ **update**(`entity`, `update`): `E`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `update` | `Partial`<`E`\> |

#### Returns

`E`

#### Defined in

[miniplex-core/src/World.ts:22](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L22)

▸ **update**(`entity`, `fun`): `E`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `fun` | (`entity`: `E`) => `void` \| `Partial`<`E`\> |

#### Returns

`E`

#### Defined in

[miniplex-core/src/World.ts:24](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/World.ts#L24)

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

#### Inherited from

[EntityBucket](EntityBucket.md).[wants](EntityBucket.md#wants)

#### Defined in

[miniplex-core/src/buckets.ts:26](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L26)

___

### where

▸ **where**<`D`\>(`predicate`): `Iterable`<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](../modules.md#predicate)<`E`, `D`\> |

#### Returns

`Iterable`<`D`\>

#### Inherited from

[EntityBucket](EntityBucket.md).[where](EntityBucket.md#where)

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

[EntityBucket](EntityBucket.md).[with](EntityBucket.md#with)

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

[EntityBucket](EntityBucket.md).[with](EntityBucket.md#with)

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

[EntityBucket](EntityBucket.md).[without](EntityBucket.md#without)

#### Defined in

[miniplex-core/src/buckets.ts:89](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L89)

▸ **without**<`D`\>(...`props`): [`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...props` | keyof `D`[] |

#### Returns

[`ArchetypeBucket`](ArchetypeBucket.md)<`D`\>

#### Inherited from

[EntityBucket](EntityBucket.md).[without](EntityBucket.md#without)

#### Defined in

[miniplex-core/src/buckets.ts:90](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/buckets.ts#L90)
