---
title: Typescript 类型编程（掘金小测学习笔记）
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-07-28
category:
  - Typescript
tag:
  - Typescript
  - 语法
star: false
sticky: false
---
[toc]

### 前言

TypeScript 是 JavaScript 的超集，其实就是在 JavaScript 之上加了一个类型系统，将原来的动态类型语言进行了类型约束，不同于传统的强类型面向对象语言，所有对象都是从一个构造函数 new 出来的，JavaScript 有着非常灵活的对象声明方式，比如通过对象字面量的形式声明，而且构造函数内也可以动态增加成员变量，TypeSript 在类型约束上加入了类型编程，使得类型有了动态性与类型的可预测。

### 基本操作

#### 条件：extends ? :

```typescript
type res = 1 extends 2 ? true : false;
```
#### 推导 infer

```typescript
type First<Tuple extends unknown[]> = Tuple extends [infer T,...infer R] ? T : never;

type res = First<[1,2,3]>;
```
将类型函数入参约束为数组，我觉得可以把这里的 T 看成一个变量，剩余参数 R 定义为另一个变量，最后将 T 返回，则 First 函数返回的就是 1，此时 res 的类型则为 数字1。

#### 联合 |

```typescript
type Union = 1 | 2 | 3;
```
如果声明变量为 Union 类型，那该变量可能的值 为 1 或 2 或 3

#### 交叉 &

```typescript
type ObjType = {a: number } & {c: boolean};
let o:ObjType = {
  a:1,
  c:false
}
```
这里将两个类型求了个并集

#### 映射类型

```typescript
type MapType<T> = {
  [Key in keyof T]?: T[Key]
}
type res = MapType<{a: 1, b: 2}>;
```
这里遍历了 T ,T 相当于一个入参，in 将这个入参对象进行遍历
keyof T 将对象的值取出，赋值给 Key
? 声明该 key 可能不存在
T[Key] 取出该值
此时就能将入参和出参进行了映射

以上列举了 TypeScript 中的基本操作，以下列举一些套路操作，其实一开始学习一门新语言，看书也会给我们介绍一些该语言的套路，来帮助我们更好的体会语言特性，毕竟超集是在原有的语言基础上增加了新的语法，对于我们来说就是一门新的语言。

学习新语言最快的理解就是类比我们曾经学过的语言，计算机语言通常就常用的那些，循环、逻辑控制（判断）、方法（函数）、变量等这些。

### 套路

#### 模式匹配做提取

##### Lv1

```Typescript
type p = Promise<'guang'>;
type GetValueType<T> = T extends Promise<infer Value> ? Value : never;
type GetType = GetValueType<p> // guang
```
可以看出来把 p 传入 GetValueType 后，里面假设 T 是 Promise<infer Value> 类型，将Promise 入参的类型 定义为 Value 并返回

##### Lv2

```typescript
type arr = [1,2,3]
type GetFirst<Arr extends unknown[]> = 
    Arr extends [infer First, ...unknown[]] ? First : never;
```
这个是获取数组第一个的方法，同样，里面通过 infer 拿到数组第一个为 First，后面返回了这个 First

```typescript
type GetLast<Arr extends unknown[]> = 
    Arr extends [...unknown[], infer Last] ? Last : never;
```
最后一个也是同理
```typescript
type PopArr<Arr extends unknown[]> = 
    Arr extends [] ? [] 
        : Arr extends [...infer Rest, unknown] ? Rest : never;
```
删除一个，也是这样，只不过取的是一组，就返回了一个数组

##### StartsWith

```typescript
type StartsWith<Str extends string, Prefix extends string> = 
    Str extends `${Prefix}${string}` ? true : false;
```

##### 函数
获取函数参数

```typescript
// 如果 Func 是这个函数类型，参数就是这个 infer 的 Args，则返回这个 Args
type GetParameters<Func extends Function> = Func extends (...args: infer Args) => unknown ? Args : never;


type ParametersResult = GetParameters<(name: string, age: number) => string>;

type ParametersResult2 = GetParameters<() => string>;

let a:ParametersResult = ['1',2]
let b:ParametersResult2 = []
```
获取返回值类型

```typescript
// 这里推导的就是 ReturnType
type GetReturnType<Func extends Function> = 
    Func extends (...args: any[]) => infer ReturnType 
        ? ReturnType : never;
```
#### 重新构造做变换


### 题目

> 实现目标：访问res时VsCode可以提示res所包含的属性，做一个类型编程总结。
```js
"use strict";
function parseQueryString(queryStr) {
    if (!queryStr || !queryStr.length) {
        return {};
    }
    const queryObj = {};
    const items = queryStr.split('&');
    items.forEach(item => {
        const [key, value] = item.split('=');
        if (queryObj[key]) {
            if (Array.isArray(queryObj[key])) {
                queryObj[key].push(value);
            }
            else {
                queryObj[key] = [queryObj[key], value];
            }
        }
        else {
            queryObj[key] = value;
        }
    });
    return queryObj;
}
const res = parseQueryString('a=1&b=2&c=3');
```
### 前言
什么是类型体操，简单的说就是类型编程。Typescript 是 JavaScript的超集，同时也是图灵完备的语言，同样具有编程能力，下面实现一下上面的题目。

### step 1

看JS的步骤是先根据 & 拆分字符串，遍历拆分后的数组，数组的每一项根据=号拆分，第0项是key 第1项是value，然后赋值个对象（如果有相同key则存储为数组）就拿到我们想要的结果。

parseQueryString函数的签名可以这样写
```ts
function parseQueryString<Str extends string>(queryStr: Str): ParseQueryString<Str>;
```

基于上面的分析大致较为清晰的知道可以拆分成以下几个type（转化到JS即为函数）：

```ts
// 根据 & 拆分字符串
type ParseQueryString
// 合并值
type MergeValues
// 合并对象 {a:1} {b:2} => {a:1,b:2}
type MergeParams
// 转换 a=1 => {a:'1'}
type ParseParam
```

type(“函数”)的调用层级是从上到下的，那实现过程就从最具体的 type ParseParam 开始实现。

### step2 type ParseParam

```ts
type ParseParam<Param extends string> = 
    Param extends `${infer Key}=${infer Value}` ?
        {
            [k in Key]:Value
        }:{}
type ParseParamResult = ParseParam<'a=1'>;
```
“入参”限定了string类型，形参为 Param，如果 Param 是 xxx=xxx的结构，则抽取=的前 后部分，infer 定义了两个“变量” key 和 Value ，构建了一个“对象”，拿到的结果就是 {a:'1'}
> 重新构造做变换

### step3 type MergeValues

```ts
type MergeValues<One, Other> = 
    One extends Other 
        ? One
        : Other extends unknown[]
            ? [One, ...Other]
            : [One, Other];
type a = MergeValues<1,2> // [1,2]
type b = MergeValues<1,1> //1
```
如果 One 和 Other 相同 则直接返回 One，否则构造一个新的数组

### step4 type MergeParams

我们拿到了单个对象，然后我们就可以合并多个对象，实现如下：

```ts
type MergeParams<
    OneParam extends Record<string, any>,
    OtherParam extends Record<string, any>
> = {
  [Key in keyof OneParam | keyof OtherParam]: 
  
    Key extends keyof OneParam
        // 如果 要合并的两个对象key相同 则 合并两个值
        ? Key extends keyof OtherParam
            ? MergeValues<OneParam[Key], OtherParam[Key]>
            // 返回第一个值
            : OneParam[Key]
        : Key extends keyof OtherParam 
            // 返回第二个值
            ? OtherParam[Key] 
            : never
}

type MergeParamsResult = MergeParams<{ a: 1 }, { b: 2 }>;
```
上面的代码我们分开理解一下，先看看怎么“遍历”对象：

```ts
type Obj<OneParam extends Record<string, any>> = 
    {
        [Key in keyof OneParam]:OneParam[Key]
    }

type o = Obj<{a:1,b:2}>
// 这里的o就是{a:1,b:2}这个类型
```
那如何同时遍历两个“对象”呢？看下面的代码：

```ts
type MergeParams<
    OneParam extends Record<string, any>,
    OtherParam extends Record<string, any>
> = {
  // 这里联合了 OneParam 和 OtherParam 两个的key
  [Key in keyof OneParam | keyof OtherParam]: string
}
```

再加上这段代码：
```ts
// 这里拿到的就是联合后的所有key的每一个
 Key extends keyof OneParam
        // 如果 要合并的两个对象key相同 则 合并两个值，和JS的逻辑一样
        ? Key extends keyof OtherParam
            ? MergeValues<OneParam[Key], OtherParam[Key]>
            // 返回第一个值
            : OneParam[Key]
        : Key extends keyof OtherParam 
            // 返回第二个值
            ? OtherParam[Key] 
            : never
```

通过上面的逻辑串联 MergeParams 就不难理解了。

### step5 type ParseParam

最后就差拆分字符串并调用上面的方法把逻辑串起来了：

```ts
type ParseQueryString<Str extends string> = 
    // 提取第一个到 & 的字符串
    Str extends `${infer Param}&${infer Rest}`
        // 格式化成为对象 并 合并对象 ，递归剩余字符串
        ? MergeParams<ParseParam<Param>,ParseQueryString<Rest>>
        // 不包含 & 符号 直接格式化
        : ParseParam<Str>
```

这里用到了递归的形式来代替循环


### end 查看效果

```ts
function parseQueryString<Str extends string>(queryStr: Str): ParseQueryString<Str> ;
function parseQueryString(queryStr: string) {
    if (!queryStr || !queryStr.length) {
        return {};
    }
    const queryObj:Record<string, any> = {};
    const items = queryStr.split('&');
    items.forEach(item => {
        const [key, value] = item.split('=');
        if (queryObj[key]) {
            if(Array.isArray(queryObj[key])) {
                queryObj[key].push(value);
            } else {
                queryObj[key] = [queryObj[key], value]
            }
        } else {
            queryObj[key] = value;
        }
    });
    return queryObj;
}


const res = parseQueryString('a=1&b=2&c=3');
```

### 总结

1. typescript 里没有循环，我们用递归代替
2. 遍历对象可以通过 Key in keyof 拿到 对象的key，这个叫索引查询
3. 使用联合枚举所有可能
4. 使用 infer 在 方法体内可以定义“变量”
5. 逻辑判断可以使用 extends





