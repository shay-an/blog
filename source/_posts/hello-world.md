---
title: typesrcipt 简明教程
---

> ts 增加了类型约束从而显著解决了因为类型问题而引起的运行时报错

## 增加的基本类型

1.  与js相比增加了tuple（元祖） any（任意类型）never这些基础类型，
2.  tuple可以定义元祖每个元素的类型，像es6解构赋值一样获取。
3.  any可以表示任意类型（非必须不推荐使用）
4.  Never 类型是永远不存在的类型，使用场景：用来检查判断是否完全

## 类型检查机制（重点）

### 类型推断

根据规则自动推导出类型
```typescript
    let a = 1
    // a就是number类型
    // let obj = {a:1}
    // 就会创建一个有a属性并且a是number类型的类型
```
基本推断举例：初始化变量 设置函数默认值 确定函数返回值
最佳类型推断
上下文推断

### 类型断言

变成兼容类型 as 缺点是没有按照接口确定
```typescript
    // 例如期望类型是Event 
    const fn = (ev:Event)=>null
    let ev = xxx
    fn(ev as Event)
    fn(<Event>ev)
    // 可以消除报错，这个完全要自己清楚自己创建的变量就是Event类型
```
### 类型兼容性

X=Y Y兼容X
接口：成员少的兼容成员多的
```typescript
    interface A {a:number }
    interface B {a:number, b:string}

    let a:A = xxx
    let b:B = xxx

    a = b
    // 不会报错

    b = a
    // 报错
```
函数：参数多的兼容参数少的

```typescript
type A = (a:string)=>null
type B = (a: string, b: number) => null

function callA(cb: A) { }
function callB(cb: B) { }


const a: A = () => null
const b: B = (a: string, b: number) => null

callA(a)
callB(a)
// 以上不报错
callA(b)
const a1:A = (a:string,v:string) => null
// 以上报错

```

### 类型保护

> 如果使用了动态类型，类如声明了联合类型 如 function (a\:number|string){}，这样a属性可能是两种类型，
> 在传入参数类型不确定的情况下需要使用类型保护

在区块中确定类型，最常用的就是if (typeof a === 'number') { a ++ }

可以使用的：instanceof typeof in 类型保护函数 isXXX()
```typescript
    // isXXX() 如 isNuber()
    function isNuber(arg) { retrun typeof a === 'number' }
```
一个较为复杂的例子
```typescript
    interface A { 
        a:number
    }

    interface B { 
        b:number
    }

    let arr: A[] | B[] = []

    function a(obj: A) { }
    function b(obj: B) { }

    for (let item of arr) { 
        if ('a' in item) {
            a(item)
        } else if ('b' in item) {
            b(item)
        }
    }
```
简单理解泛型

泛型类似于传参，可以创建新的类型，通过XXX&lt;type&gt;实现
```typescript
    interface A<T> { a:T }

    type B = A<number>
    // 约束字段a 为数字类型
    function foo<T>(a: T):T { 
        return a
     }
    let a = foo<number>(1)
    let b = foo<string>('a')
    // a是数字类型
    // b是字符串类型
```
### 类型兼容关键字

Partial\
adj.	部分的; 不完全的; 热爱; 钟爱; 偏颇; 偏袒;
通过泛型让目标类型中的所有属性变为可选
```typescript
    type QunHaiXing = Pick<QunYou, 'name'> & Partial<QunYouAttribute>;
    const haiXing: QunHaiXing = {
      name: '自称绅士的人',
      isLsp: true,
    };
```
Omit
v.	省略; 忽略; 遗漏; 漏掉; 删除; 不做; 未能做;
通过泛型删除指定属性
```typescript
    interface Person {
      name: string; // 保持不变
      age: number;
    }
    type QunYou = Person & QunYouAttribute;
    type QunDaLao = Omit<QunYou, 'name'>;
    /** 此时QunDaLao的类型
     * QunDaLao = {
        age: number;
        isLsp: boolean;
        sex: '男' | '女' | 0 | 1;
      }
     */
    const qunDaLao: QunDaLao = {
      age: 24,
      sex: '男',
      isLsp: true,
    };
```
Pick
v.	选择; 挑选; 采; 摘; (用手指)摘掉，剔除，掐去;
通过泛型选择指定属性形成新的类型
```typescript
    type QunLipu = Pick<QunYou, 'name'>;
    const qunLipu: QunLipu = {
      name: '离 谱 人',
    };
```
extends

如果T包含的类型 是 U包含的类型的 '子集'，那么取结果X，否则取结果Y。
```typescript
    T extends U ? X : Y
```
infer
v.	推断; 推论; 推理; 间接地提出; 暗示; 意指;
infer X 就相当于声明了一个变量，这个变量随后可以使用，是不是有点像for循环里面的声明语句？
```typescript
    // 内置 ReturnType
    type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```
### 枚举类型

一般定义一个字段的所有状态，常用的有数字枚举和字符串枚举，数字枚举默认从0开始自增，字符串枚举需要显式的定义每个状态的值，数字类型可以反向映射，枚举的值不可改变。
另外还有常量枚举，常量枚举在编译后移除

### 符号相关

!非空断言，告诉编译器该值一定不为空（null,undefined ）
?可选链，省略判空操作 let a = xx?.a 等同于 let a = undefined || xx !== undefined ? xx.a : undefined(es6)
|可能是多种类型  let a\:number | string
? 可选属性
```typescript
    interface A {
        a:number,
        b?:string,
    }
    // 可以没有b属性
```
### 大部分情况删除类型注释可以变成js代码

#### 特殊情况：

namespace、枚举类型会编译成js
namespace babel无法编译，同样不能用于Vue React工程内

