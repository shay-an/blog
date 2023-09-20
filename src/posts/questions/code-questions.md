---
title: 前端面试题-代码01
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-09-01
category:
  - 面试题
tag:
  - 前端
  - 面试题
star: false
sticky: false
---

### 微任务宏任务

```javascript
let p = document.createElement('p')
p.innerHTML = '123444'
document.body.appendChild(p)
let rect = p.getBoundingClientRect()
console.log(rect)
Promise.resolve().then(()=>{
    alert('阻塞1')
})
setTimeout(()=>{
    alert('dom渲染结束')
})
requestAnimationFrame(()=>{
    alert('阻塞2')
})
```
总结：

1. 微任务在DOM渲染之前执行，宏任务在DOM渲染之后执行
2. requestAnimationFrame Promise.resolve().then 是微任务，setTimeout 是宏任务
3. requestAnimationFrame 由于在DOM渲染之前执行，可用来做可编程动画，比 setTimeout 有更好的性能和更好的用户体验

### 二分查找

```javascript
function getNum(arr,num){
    // 定义开始二分指针
    let start = 0
    let end = arr.length
    while(end >= start) {
        // 每次得到中间指针
        let mid = Math.floor(parseInt((end - start)/2)+start)
        let currNum = arr[mid]
        // 相等则返回
        if (currNum === num) {
            return mid
        // 当前值大于查找值则修改结束指针
        } else if (currNum>num) {
            end = mid - 1
        // 小于则修改开始指针
        } else {
            start = mid + 1
        }
    }
    // 没有找到则返回 -1，表示没有找到
    return -1
}

console.log(getNum(arr,5))
console.log(getNum(arr,2))
console.log(getNum(arr,9))
console.log(getNum(arr,1))
console.log(getNum(arr,10))
```

### 链表反转

```javascript
var linkedList = {
    val:1,
    next:{
        val:2,
        next:{
            val:3,
            next:{
                val:4,
                next:null
            }
        }
    }
}

function read(list) {
    let head = list
    while(head) {
        console.log(head.val)
        head = head.next
    }
}

read(linkedList)
function foo(list){
    //前指针
    let prev = null
    //当前指针
    let curr = list
    while(curr) {
        // 临时存放下一个
        let nextTemp = curr.next
        // 修改下一个等于前一个
        curr.next = prev
        // 两个变量指针后移
        prev = curr
        curr = nextTemp
    }
    return prev
}

read(foo(linkedList))
```

### 多级数组扁平-只1层

```javascript
function flet(arr){
    let newArr = []
    for (let item of arr) {
        newArr = newArr.concat(item)
    }
    return newArr
}
```

### 多级数组扁平-扁平所有

```javascript
function flet2(arr){
    let newArr = []
    for (let item of arr) {
        if (Array.isArray(item)) {
            // 递归调用
            newArr.push(...flet2(item)) 
        } else {
            newArr.push(item)
        }
    }
    return newArr
}

console.log(flet2([1,2,3,[4,[5]],6]))
```

### 实现LazyMan

``` javascript
class LazyMan {
    // 名称
    name = ''
    // 任务队列，这里用数组模拟
    tasks = []
    constructor(name) {
        this.name = name
        // 自动执行队列
        setTimeout(()=>{
            this.next()
        })
    }
    // 队列执行
    next() {
        let task = this.tasks.shift()
        task && task()
    }

    eat(name){
        // 重新封装task，将来这里如果可以传入函数可在下面执行该函数
        const task = () => {
            console.info(this.name,'eat',name)
            // 执行完当前task，执行下一个task
            this.next()
        }
        this.tasks.push(task)
        // 实现链式调用的关键代码
        return this
    }

    sleep(time) {
        const task = ()=> {
            // 实现延迟执行当前任务及后面的任务
            setTimeout(()=>{
                console.info(this.name,'sleep',time)
                this.next()
            },time * 1000)
        }
        this.tasks.push(task)
        return this
    }
}

const man = new LazyMan('tiantian')
man.eat('doudou').sleep(4).eat('nangua')

```

### 函数柯里化

```javascript
function carry(fn){
    // 获取函数形参数量
    const argLen = fn.length
    // 缓存参数
    let newArgs = []
    // 返回计算函数
    function celc(...args) {
        // 每次调用合并实参
        newArgs = [
            ...newArgs,
            ...args
        ]
        // 如果合并后的实参没有达到要柯里化函数的形参数量则返回计算函数
        if (newArgs.length < argLen) {
            return celc
        // 否则执行目标函数
        } else {
            return fn.apply(this,newArgs.slice(0,argLen))
        }
    }
    // 返回计算函数
    return celc
}

function add(a,b,c) {
    return a + b + c
}
const addC = carry(add)
console.log(addC(1)(2)(3))
```

### 实现 myInstanceOf

```javascript
function myInstanceOf(instance,origin){
    if (instance === null) return false
    let type = typeof instance
    if (type !== 'object' && type !== 'function') {
        return false
    }
    let tempInstace = instance

    while(tempInstace) {
        if (tempInstace.__proto__ === origin.prototype) {
            return true
        }
        tempInstace = tempInstace.__proto__
    }

    return false
}

class A {}
let a = new A()

console.log(myInstanceOf('111',A))
```

总结：

1. 这里利用了原型链的查找，判断实例的```obj.__proto__``` 是否等于目标构造函数的 prototype
2. 代码结构本质就是个链表查找算法
3. javascript 的继承也是通过原型模式模拟的，通过给实例本身或原型链其中某个设置属性或方法实现了重写，使代码有了继承、封装、多态的特性

### 获取变量的类型

```javascript
function getType(target) {
    // 通过对象原型的 toString 方法获取类型
    let targetStr = Object.prototype.toString.call(target)
    let space = targetStr.indexOf(' ')
    return targetStr.substring(space + 1,targetStr.length-1).toLowerCase()
}
console.log('type',getType('123'))
```

### call apply bind 实现

```javascript
Function.prototype.myBind = function(context,...args){
    let salf = this
    // 返回一个新函数实现函数的延迟调用，通过apply实现了 this 的绑定
    return function(cArgs){
        return salf.apply(context,...args.concat(cArgs))
    }
}
/**
 * 
 * let obj = {a:1}
 * obj.fn = fn
 * obj.fn() // 这里的 fn 内部 this 指向 obj
 * 
*/
Function.prototype.myCall = function(context,...args) {
    if (context === null) context = globalThis
    if (typeof context !== 'object') context = new Object(context)
    // 使用 Symbol 可防止变量冲突
    let fnKey = Symbol('fnKey')
    context[fnKey] = this
    const res = context[fnKey](...args)
    // 删除临时属性 回收内存
    delete context[fnKey]
    return res
}

Function.prototype.myApply = function(context,args) {
    if (context === null) context = globalThis
    if (typeof context !== 'object') context = new Object(context)
    let fnKey = Symbol('fnKey')
    context[fnKey] = this
    const res = context[fnKey](...args)
    delete context[fnKey]
    return res
}
```

### 实现 EventBug (事件总线)

```javascript
 class EventBus {
    events = new Map()
    name = ''
    constructor(name = '') {
        this.name = name
    }
    on(event,callback) {
        if (typeof callback !== 'function') return
        let targetEvent = this.events.get(event)
        if (targetEvent) {
            targetEvent.push(callback)
        } else {
            targetEvent = [callback]
            this.events.set(event,targetEvent)
        }
    }

    once(event,callback) {
        if (typeof callback !== 'function') return
        // 这里设计有点临时了，最好把数据结构设计成 [{callback:function,isOnce:boolean}]，不会污染使用者传入的callback
        callback.isOnce = true
        this.on(event,callback)
    }

    emit(event,payload) {
        let targetEvent = this.events.get(event)
        if (targetEvent) {
            //filter 会更好,能更语义化一点
            targetEvent.forEach(callback=>{
                callback(payload)
                if (callback.isOnce) {
                    this.off(event,callback)
                }
            })
        }
    }

    off(event,callback) {
        let targetEvent = this.events.get(event)
        if (targetEvent && targetEvent.length) {
            let index = targetEvent.indexOf(callback)
            if (index>=0) {
                targetEvent.splice(index)
            }
        }

        if (!targetEvent || targetEvent.length === 0) {
            this.events.delete(event)
        }
    }
}

let event = new EventBus()
const close1Fn = (data)=>{
    console.info('close',data)
}

const close1Fn2 = (data)=>{
    console.info('close fn2',data)
}

const close1Fn3 = (data)=>{
    console.info('close fn3',data)
}
event.on('close',close1Fn)
event.on('close',close1Fn2)
event.once('close',close1Fn3)

event.emit('close','a')
event.emit('close','b')

event.off('close',close1Fn)
event.off('close',close1Fn2)

event.emit('close','a1')
event.emit('close','b1')
```

### LRUCatch Map实现

``` javascript
class LRUCatch {
    len = 0
    data = new Map()
    constructor(len) {
        if (len < 1) throw new TypeError('长度最小为1')
        this.len = len
    }

    get(key) {
        if (!this.data.has(key)) return null

        let val = this.data.get(key)
        this.data.delete(key)
        this.data.set(key,val)

        return val

    }
    set(key,v) {
        if (this.data.has(key)) {
            this.data.delete(key)
        }
        this.data.set(key,v)
        
        if (this.data.keys().length > this.len) {
            let oldKey = this.data.keys().next().value
            this.delete(oldKey)
        }
            
    }
}
```
