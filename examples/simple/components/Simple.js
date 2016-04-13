import React,{
    Component,
    PropTypes
} from 'react';
import { Link } from 'react-router';
import ListView  from '../../../lib/ListView';

import '../styles/simple.scss';


class App extends Component {
    constructor(props) {
        super(props);
        this.data = [];
        for (let i = 0; i <= 50; i++) {
            this.data.push({
                id: i,
                text: `text_${i}`
            })
        }
        this.state = {
            data: this.data,
            loading: false
        };
    }


    _renderItem(item, index) {
        return (
            <div
                key={index}
                className="item">
                {item.text}
            </div>
        )
    }

    _onPullRefresh(cb) {
        setTimeout(()=> {
            this.setState({
                data: this.data
            });
            cb();
        }, 2000);
    }


    _onEndReached() {
        this.setState({
            loading: true
        });
        setTimeout(()=> {
            let data = [];
            for (let i = this.state.data.length + 1; i < this.state.data.length + 50; i++) {
                data.push({
                    id: i,
                    text: `text_${i}`
                })
            }
            this.setState({
                data: this.state.data.concat(data),
                loading: false
            });
        }, 2000);
    }


    _renderFooter() {
        if (this.state.loading) {
            return <ListView.Loading className="footer-loading"/>
        }
        return null;
    }


    render() {
        let style = {
            height: window.innerHeight - 50
        };
        return (
            <div className="simple-wrapper">
                <div className="nav">
                    <div className="left">
                        <Link to="/">
                            返回
                        </Link>
                    </div>
                    <div>
                        基本功能
                    </div>
                    <div></div>
                </div>
                <ListView
                    ref={view=>this.listview=view}
                    style={style}
                    pullUIStyle={{
                            height: 50
                        }}
                    renderPullUI={(shouldRefresh)=>{
                            return (
                                <span>
                                    <span className={`fa fa-arrow-down ${shouldRefresh && 'list-view-refresh'}`}/>
                                    { !shouldRefresh ? ' 下拉刷新' : ' 释放更新' }
                                </span>
                            )
                        }}
                    onPullRefresh={this._onPullRefresh.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    enablePullRefreshEvent={true}
                    enableOnEndReachedEvent={true}
                    renderItem={this._renderItem.bind(this)}
                    renderFooter={this._renderFooter.bind(this)}
                    data={this.state.data}>

                </ListView>
            </div>
        )
    }
}


export default App;
