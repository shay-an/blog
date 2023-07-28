---
title: Typescript 类型体操训练
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

### 题目

> 实现目标：访问res时VsCode可以提示res所包含的属性，做一个类型体操总结。
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





