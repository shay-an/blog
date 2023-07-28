---
title: Error对象
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-07-28
category:
  - javascript
tag:
  - javascript
  - 语法
star: true
sticky: true
---

    EvalError
创建一个error实例，表示错误的原因：与 eval() 有关。

    RangeError
创建一个error实例，表示错误的原因：数值变量或参数超出其有效范围。

    ReferenceError
创建一个error实例，表示错误的原因：无效引用。

    SyntaxError
创建一个error实例，表示错误的原因：eval()在解析代码的过程中发生的语法错误。

    TypeError
创建一个error实例，表示错误的原因：变量或参数不属于有效类型。

    URIError
创建一个error实例，表示错误的原因：给 encodeURI()或  decodeURl()传递的参数无效。


    new ***Error([message[, fileName[, lineNumber]]])
    
    message
    可阅读的关于错误的描述.
    fileName
    代码中导致异常的文件的文件名.
    lineNumber
    代码中导致异常的代码的行号.
    
    一般与throw结合使用