# React-ListView

> 模拟native下拉刷新的react ListView组件.


## Install

```
    mnpm install @scfe/react-listview  --save
```


## Feature

* 类似于native的下拉刷新

* 支持下拉事件和拉到底部的事件

* 采用浏览器的native scroll

* 可自定义loading和pullRefreshUI

* 除了`react`外不依赖其他第三方库


## Screenshots


![react-listview](http://7lrzfj.com1.z0.glb.clouddn.com/listView.gif)


## Props


### `renderItem(item: object, index: number)`:(required)

每一行的渲染函数.

#### `params`:
* `item`: 该行的数据

* `index`: 改行在数组中得index

### `renderHeader()`

渲染ListView的头部, 通常可以自定义init loading或者其他东西等等.

### `renderFooter()`

渲染ListView的尾部, 通常加载下一页时的loading就可以放到这里渲染. 详情可以看`expamples/simple/App.js`.

### `renderPullUI(shouldRefresh: bool)`

渲染在下拉时应该显示的提示信息, 比如下拉时会显示, `下拉刷新`, 拉到一定位置会出现`释放更新`.

#### `params`:
* `shouldRefresh`: 此时下拉的位置是否是可以更新的, 因为可以更新和不可以更新的提示不一样, 可以通过这个来区别.

***Example***:

```
renderPullUI={(shouldRefresh)=>{
                        return (
                            <span>
                                <span className={`fa fa-arrow-down ${shouldRefresh && 'list-view-refresh'}`}/>
                                { !shouldRefresh ? ' 下拉刷新' : ' 释放更新' }
                            </span>
                        )
              }}
```

### `renderPullLoading()`

渲染在下拉时的loading部分的UI.

### `onEndReached()`

当`ListView`到达底部时会触发的事件

### `onPullRefresh(cb: function)`

下拉刷新时触发的事件, 因为loading的`state`是在`ListView`内部, 所以当`onPullRefresh`要异步获取数据时, 获取完成后(无论失败或者成功)得通知`ListView`, 以便更新state.


该函数支持promise和callback模式, 该函数会传入一个参数`cb`, 如果采用callback模式, 使用方法如下:

```
_onPullRefresh(cb) {
        setTimeout(()=> {
            this.setState({
                data: this.data
            });
            cb();
        }, 1000);
    }
```

*promise模式*:

```
    _onPullRefresh(cb) {
        return new Promise((resolve, reject)=> {
            setTimeout(()=> {
                resolve();
            }, 1000);
        });
    }
```

***备注:*** 这种方法比较hack, 其实理应传入一个`pullRefresh Loading`来控制, 这样更加符合react思想, 但是直接直接采用这种模式, 性能会更加优秀.


### `onScroll(e: event, contentDOM: node)`

listview滑动时触发的事件.

#### `params`

* `e`: 滚动事件的引用
* `contentDOM`: listview可滚动区域的dom, 暴露这个object是为了解决, 在有些情况下, 需要根据滚动的距离来改变一些ui, 就可以根据这个来做. 使用`contentDOM.scrollTop`可获取到滚动的距离.


### Other Props


* `resistance`(number): 下拉刷新时下拉的阻力, 默认为:`2`.

* `onPullRefreshThreshold`(number): 下拉多少距离才触发更新事件, 默认为:`80`

* `onEndReachedThreshold`(number): 距离底部多少距离时触发`onEndReached`事件, 在`content`长度不变的情况下, 只会触发一次, 所以如果一次触发, 请求后端失败后, 就不会再次触发.
一般的解决办法是, 请求失败后, 在`Footer`里添加一个`button`通过点击来再次触发请求事件. 当列表已经加载完毕后, 就是没有更多的数据时, 需要显示提示(比如:*已到底部*), 则需要自己渲染`Footer`在做相应处理.

* `minLoadingTime`(number): 下拉刷新的最短loading时间, 默认是一秒.

* `enablePullRefreshEvent`(bool): 是否开启下拉刷新事件.

* `enableOnEndReachedEvent`(bool): 拉到底部是否会触发事件, 这个用于列表没有更多数据时, 禁止触发`onEndReached`事件.

* `data`(array): 需要显示的数据, 默认为`[]`;

* `style`(object): 传入`ListView`最外层`div`的style.

* `pullUIStyle`(object): 传入给`pullUI`的style, 暴露这个props的目的是为了解决当css没有载入时, `pullUI`的style还没有赋予, 而这时需要测量`pullUI`的高度, 然后`transition`, 所以初始第一次载入时就会出现`transition`的距离和`pullUI`的高度不一致, 导致ui显示bug.

* `contentStyle`(object): 传入给`content`的style.

* `className`(string): 传递给`listView`最外层的`div`的class.

* `pullUIClassName`(string): 传递给`pullUI`的class, 也就是包含整个pullRefresh需要的提示文字和loading相关的最外层div.

* `contentClassName`(string): 传递给`content`的class, 也就是传递给list数据展示div.

* `pullUIInfoClassName`(string): 传递给`pull-ui-info`的class, 也就是展示文字提示的div.


## Functions

### `unlockReachEndEvent()`

这个用于在一次请求失败后, 因为请求失败, 所以content的长度没有变, 所以不会再次触发`ReachEnd`event. 这时如果要解锁`ReachEnd`事件, 可以调用这个方法.

### `resetState()`

这个是用于重置所有的state, 也就是假设说有多个数据源都用一个listView, 当从第一个数据源切换到第二个数据源时, 第一个数据源正在刷新时, 切换到第二个数据源, 刷新这个状态会一直保持, 这时如果想重置state, 可调用这个函数. 这个函数也会重置重置scroll高度.


### `scrollTo(distance: number)`

用于控制content的滚动距离, 常见使用场景: 例如公用一个listView时, 切换数据源后需要scrollToTop, 这时就可调用该方法.

#### params

* `distance`: content距离父元素顶部的距离


## Static Props

### `Loading`

这个是Listview内部所用的Loading控件, 若需要使用时, 可以直接:

```

import Listview from '@scfe/react-listview';

.... 此处省略代码


render(){
    return <ListView.Loading className="loading"/>;
}


```

## FAQ

### 如何解决iOS safari浏览器上下拉的弹性动画?

采用`[inobounce](https://github.com/lazd/iNoBounce)`, 只需在项目中引用该库便可.

### `pullUI`的文字没有隐藏怎么办?

需要设置`listview`上面的`div`的`z-index`比`listview`高, `listview`默认的`z-index`为`20`, 一般来说, 将上面的`div`的`z-index`设置为`20`即可.

### 如何自定义样式?

首先react渲染后的html如下:

```
<div style="height:555px;" class="react-listview-wrapper " data-reactid=".0.1">
	<div class="react-listview-pull-ui " style="height: 50px; transform: translate3d(0px, -50px, 0px);"
		 data-reactid=".0.1.0">
		<div class="pull-ui-info " data-reactid=".0.1.0.1"><span data-reactid=".0.1.0.1.0"><span
				class="fa fa-arrow-down false" data-reactid=".0.1.0.1.0.0"></span><span data-reactid=".0.1.0.1.0.1"> 下拉刷新</span></span>
		</div>
	</div>
	<div class="react-listview-content " data-reactid=".0.1.1" style="transform: translate3d(0px, 0px, 0px);">
		<div class="list-view-content-inner-wrapper" data-reactid=".0.1.1.1">
			<div class="item" data-reactid=".0.1.1.1.$25">text_25</div>
		</div>
	</div>
</div>
```

默认***className***备注:

* `react-listview-wrapper`: 是整个component最外层的div, 对应`className`

* `react-listview-pull-ui`: 是整个`pullUI`的最外层div, 对应`pullUIClassName`和`pullUIStyle`

* `pull-ui-info`: 是pullUI的文字提示的div, 对应`pullUIInfoClassName`

* `react-listview-content`: 是`content`的wrapper class, 对应`contentClassName`和`contentStyle`, 需要注意的是, `content`div下还有个`list-view-content-inner-wrapper`div.

## Development


### 目录说明:

* dist: 存放编译后的lib文件
* examples: 存放demo, 在开发的时候也可以拿`examples/simple`作为调试的载体
* lib: 组件源文件的存放处
* \__tests__: 测试文件的存放处


### Development Script


* `npm start`: 启动开发模式下的服务器, 这样默认会加载`examples/simple`下地index.html, 可以以此作为编写时的调试工具
* `npm run test:w`: test模式, 会一直watch文件变动, 然后执行test
* `npm test`: 测试
* `npm run build`: 编译打包库到`dist`文件夹下
