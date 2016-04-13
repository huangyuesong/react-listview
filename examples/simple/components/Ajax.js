import React,{
    Component,
    PropTypes
} from 'react';
import { Link } from 'react-router';
import ListView  from '../../../lib/ListView';

import '../styles/ajax.scss';


class Ajax extends Component {
    constructor(props) {
        super(props);
        this.state = {
            topics: null,
            fetchMoreLoading: false,
            page: 0
        }
    }


    componentDidMount() {
        this._onPullRefresh();
    }


    _fetch(page = 0) {
        return fetch(`https://cnodejs.org/api/v1/topics?page=${page + 1}&limit=${10}`)
            .then(res=>res.json())
            .then(data=>data.data)

    }


    _onPullRefresh() {
        return this._fetch()
            .then(data=> {
                this.setState({
                    topics: data,
                    page: 1
                });
            });
    }


    _onEndReached() {
        this.setState({
            fetchMoreLoading: true
        });
        let startTime = new Date().getTime();
        this._fetch(this.state.page)
            .then(data=> {
                let timeLeft = 1000 - (new Date().getTime() - startTime);
                if (timeLeft > 0) {
                    setTimeout(()=> {
                        this.setState({
                            topics: this.state.topics.concat(data),
                            page: this.state.page + 1,
                            fetchMoreLoading: false
                        })
                    }, timeLeft);
                }
                else {
                    this.setState({
                        topics: this.state.topics.concat(data),
                        page: this.state.page + 1,
                        fetchMoreLoading: false
                    })
                }
            })
            .catch(err=> {
                console.log(err);
                this.setState({
                    fetchMoreLoading: false
                });
            });
    }


    _renderItem(item, index) {
        let { title, create_at, last_reply_at, reply_count, visit_count, author } = item;
        let { avatar_url, loginname } = author || {};
        return (
            <div key={index} className="item">
                <div className="img-wrapper">
                    <img src={avatar_url} alt=""/>
                </div>
                <div className="topic-info-wrapper">
                    {title}
                </div>
            </div>
        )
    }


    _renderFooter() {
        return this.state.fetchMoreLoading ? <ListView.Loading className="footer-loading"/> : null;
    }


    render() {
        let style = {
            height: window.innerHeight - 50
        };
        let listview = (
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
                data={this.state.topics || []}/>
        );
        let empty = (
            <ListView.Loading className="loading"/>
        );
        return (
            <div className="ajax-wrapper">
                <div className="nav">
                    <div className="left">
                        <Link to="/">
                            返回
                        </Link>
                    </div>
                    <div onClick={()=>{
                        this.listview.scrollTo(0);
                    }}>
                        cnode论坛topic
                    </div>
                    <div></div>
                </div>
                { this.state.topics ? listview : empty}
            </div>
        )
    }
}


export default Ajax;