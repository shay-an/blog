---
title: 【掘金】React初阶训练营Demo
icon: pen-to-square
date: 2023-11-08
category:
  - React初阶训练营Demo
tag:
  - React
  - Demo
  - 初阶
star: false
sticky: false
---

直接上代码

```tsx
import { Button, Input, Tabs } from "@arco-design/web-react"
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Radio } from '@arco-design/web-react';
import { Form } from '@arco-design/web-react'
import { createPortal } from "react-dom";
const RadioGroup = Radio.Group;

function Nav(){
    const [tab,setTab] = useState<string>('tab')
    return <Tabs activeTab={tab} onChange={setTab}>
        <Tabs.TabPane key="tab" title="tab">
            <div>111</div>
        </Tabs.TabPane>
        <Tabs.TabPane key="tab2" title="tab2">
            <div>222</div>
        </Tabs.TabPane>
    </Tabs>
}
type ContentProps = {
    children: React.ReactElement,
}


const Content = styled.div`
    padding: 20px;
`

function MainContent(props:ContentProps){
    return <Content>{props.children}</Content>
}

type SizeWapperPorps = {
    children:React.ReactElement[]
    size: ButtonSize
}

type ButtonSize =  'small' | 'default' | 'large' | 'mini'

function SizeWapper(props:SizeWapperPorps) {
    return <div>
        {React.Children.map(props.children,(child:React.ReactElement)=>{
            if (child && child.props)
            return child && React.cloneElement(child,{size:props.size})
        })}
    </div>
}
// 父级跟子级通讯
function Contents(){
    const [size,setSize] = useState<ButtonSize>('small')
    return <>
        <RadioGroup
            type='button'
            name='lang'
            defaultValue='small'
            onChange={setSize}
            style={{ marginRight: 20, marginBottom: 20 }}
        >
            <Radio value='small'>small</Radio>
            <Radio value='default'>default</Radio>
            <Radio value='large'>large</Radio>
            <Radio value='mini'>mini</Radio>
        </RadioGroup>
        <div>{ size }</div>
        <SizeWapper size={size}>
            <Input value="input"/>
            <Input value="input"/>
            <Button type="primary">aaa</Button>
        </SizeWapper>
    </>
}

const FormComponent = (props,ref)=>{
    const [formInstance] = Form.useForm()
    useImperativeHandle(ref,()=>({
        change:(newValue)=>{
            formInstance.setFieldsValue(newValue)
        },
        clear:()=>formInstance.clearFields(['username','email'])
    }))

    return <Form form={formInstance}>
        <Form.Item label="username" field="username">
            <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="email" field="email">
            <Input placeholder="请输入邮箱" />
        </Form.Item>
    </Form>
}
const FormComponentsWithRef = forwardRef(FormComponent)
// 父级调用子级 useImperativeHandle + forwardRef + useRef
const FormWapper = ()=>{
    const formRef = useRef(null)

    return (
        <div>
            <b>Wapper Options :</b>
            <Button onClick={()=>formRef.current?.change({username:'aaa',email:'111@qq.com'})}>Change</Button>
            <Button onClick={()=>formRef.current?.clear()}>clear</Button>
            <FormComponentsWithRef ref={formRef}/>
        </div>
    )
}

type ConterProps = {
    count:number,
    increment:()=>void
}
// React 是如何解决闭包过期问题的
function Counter(props:ConterProps){
    console.log('conter render')
    const [count,setCount] = useState(0)
    useEffect(()=>{
        const id = setInterval(()=>{
            console.log('curr count is ' + count)
        },1000)
        return ()=> clearInterval(id)
    },[count])
    return <div>
        <div>{props.count}</div>
        <Button onClick={props.increment}>加1</Button>
        <div>测试加法{count}</div>
        <Button type="primary" onClick={()=>setCount(count+1)}>加1</Button>
    </div>
}

const ConterMemo = React.memo(Counter,(prevProps, nextProps)=>{
    return prevProps.count === nextProps.count
})
// useMemo React.memo 优化
const MyApp = () => {
	const [count, setCount] = useState(0);
	const [name, setName] = useState('Tony');
	const increment = () => setCount(count + 1);
	const calcValue = useMemo(() => {
		console.log('calculate...');
		return new Array(1000)
			.fill(count)
			.reduce((pre, num) => {
				return pre + num * Math.random() * 10;
			}, Math.random() * 10);
	},[count]);
	// const calcValue = getCalcValue();
	console.log('wrapper render...');
	return (
    <div>
         <div> 
            { name } 
            <button onClick={() => { setName(name === 'Tony' ? 'Kevin' : 'Tony'); }} > 更新 </button> 
            </div> 
            <ConterMemo count={ count } increment={ increment } />
            <div> calcValue: { calcValue } </div>
        </div>
     );
};
// 自定义挂载点
function CustomButton({container,color}) {
    const DemoBtn = <Button>{color}-按钮</Button>
    const containerElem = useMemo(()=>{
        return container
    },[container])

    if (containerElem) {
        return createPortal(DemoBtn,containerElem)
    }

    return DemoBtn
}
// 自定义挂载点后事件冒泡影响
function CustomButtonDemo(){
    const [ visible, setVisibe ] = useState(false)
    const wrapperContainer = React.useRef(null)
    useEffect(()=>{
        setVisibe(true)
    },[])
    const alertDemo = ()=> alert('demo')
    return <div>
        <div onClick={()=>alertDemo()} style={{backgroundColor:'blue'}}>
            <div>blue Container</div>
            { visible && (<CustomButton container={wrapperContainer.current} color='blue'></CustomButton>) }
        </div>
        <div ref={wrapperContainer} style={{backgroundColor:'yellow'}}>
            <div>yellow Container</div>
            <CustomButton color='yellow'></CustomButton>
        </div>
    </div>
}
export default function Page(){
    return <div>
        <Nav></Nav>
        <MainContent>
            <h1>1111111111</h1>
        </MainContent>
        <MainContent>
            <h1>1111111111</h1>
        </MainContent>
        <Contents></Contents>
        <FormWapper/>
        <MyApp/>
        <CustomButtonDemo/>
    </div>
}
```

参考链接 https://bytedance.feishu.cn/file/IH8hbVnj9oMygKxUA9ccHQQTnUd