[@miniplex/core](README.md) / Exports

# @miniplex/core

## Table of contents

### Classes

- [ArchetypeBucket](classes/ArchetypeBucket.md)
- [Bucket](classes/Bucket.md)
- [DerivedEntityBucket](classes/DerivedEntityBucket.md)
- [EntityBucket](classes/EntityBucket.md)
- [PredicateBucket](classes/PredicateBucket.md)
- [World](classes/World.md)

### Type Aliases

- [ArchetypeQuery](modules.md#archetypequery)
- [ArchetypeWithQuery](modules.md#archetypewithquery)
- [ArchetypeWithoutQuery](modules.md#archetypewithoutquery)
- [Predicate](modules.md#predicate)
- [Strict](modules.md#strict)
- [With](modules.md#with)

### Functions

- [hasAnyComponents](modules.md#hasanycomponents)
- [hasComponents](modules.md#hascomponents)
- [hasNoComponents](modules.md#hasnocomponents)
- [isArchetype](modules.md#isarchetype)
- [memoizeQuery](modules.md#memoizequery)
- [normalizeComponents](modules.md#normalizecomponents)
- [normalizeQuery](modules.md#normalizequery)
- [not](modules.md#not)

## Type Aliases

### ArchetypeQuery

Ƭ **ArchetypeQuery**<`E`, `P`\>: `Partial`<[`ArchetypeWithQuery`](modules.md#archetypewithquery)<`E`, `P`\> & [`ArchetypeWithoutQuery`](modules.md#archetypewithoutquery)<`E`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `P` | extends keyof `E` |

#### Defined in

[miniplex-core/src/types.ts:13](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L13)

___

### ArchetypeWithQuery

Ƭ **ArchetypeWithQuery**<`E`, `P`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `P` | extends keyof `E` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `with` | `P`[] |

#### Defined in

[miniplex-core/src/types.ts:5](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L5)

___

### ArchetypeWithoutQuery

Ƭ **ArchetypeWithoutQuery**<`E`, `P`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `P` | extends keyof `E` = keyof `E` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `without` | `P`[] |

#### Defined in

[miniplex-core/src/types.ts:9](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L9)

___

### Predicate

Ƭ **Predicate**<`E`, `D`\>: (`v`: `E`) => v is D \| (`entity`: `E`) => `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `D` | extends `E` |

#### Defined in

[miniplex-core/src/types.ts:1](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L1)

___

### Strict

Ƭ **Strict**<`T`\>: `WithoutOptional`<`T`\>

A utility type that removes all optional properties.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[miniplex-core/src/types.ts:25](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L25)

___

### With

Ƭ **With**<`E`, `P`\>: `E` & `Required`<`Pick`<`E`, `P`\>\>

A utility type that marks the specified properties as required.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `P` | extends keyof `E` |

#### Defined in

[miniplex-core/src/types.ts:20](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/types.ts#L20)

## Functions

### hasAnyComponents

▸ **hasAnyComponents**<`E`\>(`entity`, ...`components`): `boolean`

#### Type parameters

| Name |
| :------ |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `...components` | keyof `E`[] |

#### Returns

`boolean`

#### Defined in

[miniplex-core/src/predicates.ts:18](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/predicates.ts#L18)

___

### hasComponents

▸ **hasComponents**<`E`, `C`\>(`entity`, ...`components`): entity is With<E, C\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `C` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `...components` | `C`[] |

#### Returns

entity is With<E, C\>

#### Defined in

[miniplex-core/src/predicates.ts:11](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/predicates.ts#L11)

___

### hasNoComponents

▸ **hasNoComponents**<`E`\>(`entity`, ...`components`): `boolean`

#### Type parameters

| Name |
| :------ |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `...components` | keyof `E`[] |

#### Returns

`boolean`

#### Defined in

[miniplex-core/src/predicates.ts:22](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/predicates.ts#L22)

___

### isArchetype

▸ **isArchetype**<`E`, `P`\>(`entity`, ...`components`): entity is With<E, P\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `E` | `E` |
| `P` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | `E` |
| `...components` | `P`[] |

#### Returns

entity is With<E, P\>

#### Defined in

[miniplex-core/src/predicates.ts:4](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/predicates.ts#L4)

___

### memoizeQuery

▸ **memoizeQuery**<`Q`\>(`query`): `Q`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Q` | extends `Partial`<[`ArchetypeWithQuery`](modules.md#archetypewithquery)<`any`, `any`\> & [`ArchetypeWithoutQuery`](modules.md#archetypewithoutquery)<`any`, `string` \| `number` \| `symbol`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `Q` |

#### Returns

`Q`

#### Defined in

[miniplex-core/src/queries.ts:19](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/queries.ts#L19)

___

### normalizeComponents

▸ **normalizeComponents**(`components`): `any`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `components` | `any`[] |

#### Returns

`any`[]

#### Defined in

[miniplex-core/src/queries.ts:4](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/queries.ts#L4)

___

### normalizeQuery

▸ **normalizeQuery**(`query`): `Partial`<[`ArchetypeWithQuery`](modules.md#archetypewithquery)<`any`, `any`\> & [`ArchetypeWithoutQuery`](modules.md#archetypewithoutquery)<`any`, `string` \| `number` \| `symbol`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `Partial`<[`ArchetypeWithQuery`](modules.md#archetypewithquery)<`any`, `any`\> & [`ArchetypeWithoutQuery`](modules.md#archetypewithoutquery)<`any`, `string` \| `number` \| `symbol`\>\> |

#### Returns

`Partial`<[`ArchetypeWithQuery`](modules.md#archetypewithquery)<`any`, `any`\> & [`ArchetypeWithoutQuery`](modules.md#archetypewithoutquery)<`any`, `string` \| `number` \| `symbol`\>\>

#### Defined in

[miniplex-core/src/queries.ts:10](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/queries.ts#L10)

___

### not

▸ **not**<`E`, `D`\>(`predicate`): [`Predicate`](modules.md#predicate)<`E`, `E`\>

#### Type parameters

| Name |
| :------ |
| `E` |
| `D` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | [`Predicate`](modules.md#predicate)<`E`, `D`\> |

#### Returns

[`Predicate`](modules.md#predicate)<`E`, `E`\>

#### Defined in

[miniplex-core/src/predicates.ts:30](https://github.com/hmans/miniplex/blob/7733116/packages/miniplex-core/src/predicates.ts#L30)
