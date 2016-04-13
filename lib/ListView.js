import React,{
    Component,
    PropTypes
} from 'react';
import ReactDOM from 'react-dom';
import ListViewContent from './ListViewContent';
import Loading from './Loading';

import './styles/react-listview.scss';

const defaultFunc = ()=>null;


class ListView extends Component {
    static propTypes = {
        resistance: PropTypes.number,
        onPullRefreshThreshold: PropTypes.number,
        onEndReachedThreshold: PropTypes.number,
        minLoadingTime: PropTypes.number,
        enablePullRefreshEvent: PropTypes.bool,
        enableOnEndReachedEvent: PropTypes.bool,


        style: PropTypes.object,
        pullUIStyle: PropTypes.object,
        contentStyle: PropTypes.object,
        className: PropTypes.string,
        pullUIClassName: PropTypes.string,
        contentClassName: PropTypes.string,
        pullUIInfoClassName: PropTypes.string,
        data: PropTypes.array,


        renderPullLoading: PropTypes.func,
        renderPullUI: PropTypes.func,
        renderItem: PropTypes.func.isRequired,
        renderHeader: PropTypes.func,
        renderFooter: PropTypes.func,

        onEndReached: PropTypes.func,
        onPullRefresh: PropTypes.func,
        onScroll: PropTypes.func

    };

    static defaultProps = {
        resistance: 2,
        onPullRefreshThreshold: 80,
        className: '',
        pullUIClassName: '',
        contentClassName: '',
        pullUIInfoClassName: '',
        data: [],
        minLoadingTime: 1000,
        onEndReachedThreshold: 120,
        enableOnEndReachedEvent: true,
        pullUIStyle: {},
        contentStyle: {},

        renderHeader: defaultFunc,
        renderFooter: defaultFunc,
        onEndReached: defaultFunc,
        onPullRefresh: defaultFunc
    };


    static Loading = Loading;


    constructor(props) {
        super(props);
        this._setDefaultPanProps();
        this.state = {
            loading: false,
            showLoadingInfo: true,
            refresh: false,
            reset: false
        }
    }

    componentDidMount() {
        this.contentDom = ReactDOM.findDOMNode(this.content);
        this.pullUIDom = ReactDOM.findDOMNode(this.pullUI);

        this._setContentPan();
    }


    componentWillUnmount() {
        clearTimeout(this.doResetTimeout);
    }


    shouldComponentUpdate(nextProps, nextState) {
        const isStateChanged = Object.keys(nextState).some(key=> {
            return nextState[key] !== this.state[key]
        });
        const isPropsChanged = Object.keys(nextProps).some(key=> {
            return nextProps[key] !== this.props[key]
        });
        return isStateChanged || isPropsChanged
    }


    unlockReachEndEvent() {
        this.pan.lastOnEndReachedContentLength = 0;
    }


    resetState() {
        clearTimeout(this.doResetTimeout);
        this._doReset();
        this.scrollTo(0);
    }


    scrollTo(distance) {
        if (!this.contentDom) return false;
        this.contentDom.scrollTop = distance;
        return true;
    }


    _setDefaultPanProps() {
        this.pan = {
            pullRefreshEnablePan: false,
            distance: 0,
            startingPositionY: 0,
            direction: undefined,
            lastOnEndReachedContentLength: 0
        };
    }


    _touch(e) {
        const touch = e.touches[0];
        if (!touch) return;
        const { pageX, pageY } = touch;
        if (!this.touchStart) return;
        if (!this.pan.direction) {
            if (this.touchStart < pageY) {
                // down
                this.pan.direction = 'down';
            }
            if (this.touchStart > pageY) {
                // up
                this.pan.direction = 'up';
            }
            if (this.pan.direction) {
                this._onPanStart({
                    direction: this.pan.direction
                });
            }
        }
        if (this.lastTouch) {
            let distance = pageY - this.touchStart;
            let panEvent = {
                distance
            };
            if (this.lastTouch < pageY) {
                this._onPanDown(panEvent);
            }
            if (this.lastTouch > pageY) {
                this._onPanUp(panEvent);
            }
        }
        this.lastTouch = pageY;
    }


    _touchStart(e) {
        const touch = e.touches[0];
        if (!touch) return;
        this.touchStart = touch.pageY;
    }


    _touchEnd() {
        this._onPanEnd();
        this.touchStart = undefined;
        this.lastTouch = undefined;
    }


    _onPanStart(e) {
        const { scrollTop } = this.contentDom;
        if (scrollTop > 0 || !this.props.enablePullRefreshEvent) {
            return this.pan.pullRefreshEnablePan = false;
        }

        this.pan.startingPositionY = this.contentDom.scrollTop;
        this.pan.direction = e.direction;


        if (this.pan.startingPositionY === 0 && e.direction == 'down') {
            this.pan.pullRefreshEnablePan = true;
        }

        this.doingPullDown = true;
    }


    _onPanDown(e) {
        if (!this.pan.pullRefreshEnablePan) {
            return;
        }
        this.pan.distance = e.distance / this.props.resistance;

        this._setContentPan();
        this._setRefresh();
    }


    _onPanUp(e) {
        if (!this.pan.pullRefreshEnablePan) {
            this._reachEnd();
            return;
        }
        const { distance } = e;


        let resistance = this.props.resistance;
        if (!this.pan.pullRefreshEnablePan || this.pan.distance === 0) {
            return;
        }


        if (this.pan.distance < distance / resistance) {
            this.pan.distance = 0;
        } else {
            this.pan.distance = distance / resistance;
        }

        this._setContentPan();
        this._setRefresh();
    }


    _onPanEnd() {
        if (!this.pan.pullRefreshEnablePan) {
            this.pan.distance = 0;
            this.pan.pullRefreshEnablePan = false;
            this.pan.direction = undefined;
            return;
        }


        this.contentDom.style.transform = this.contentDom.style.webkitTransform = 'translate3d( 0, ' + this.pullUIDom.offsetHeight + 'px, 0 )';
        this.pullUIDom.style.transform = this.pullUIDom.style.webkitTransform = 'translate3d( 0, ' + 0 + 'px, 0 )';
        this.contentDom.style.transition = this.pullUIDom.style.webkitTransform = 'all .25s ease';
        this.pullUIDom.style.transition = this.pullUIDom.style.webkitTransform = 'all .25s ease';

        if (this.state.refresh) {
            this._doLoading();
        } else {
            this._doReset();
        }
        this.pan.distance = 0;
        this.pan.pullRefreshEnablePan = false;
        this.pan.direction = undefined;
    }


    _onScroll(e) {
        this._reachEnd();
        this.props.onScroll && this.props.onScroll(e, this.contentDom);
    }


    _reachEnd() {
        const { scrollHeight, scrollTop, clientHeight }= this.contentDom;
        const currentContentHeight = ReactDOM.findDOMNode(this.listviewContent).clientHeight;
        if (this.props.enableOnEndReachedEvent && scrollHeight - scrollTop - clientHeight < this.props.onEndReachedThreshold && this.pan.lastOnEndReachedContentLength !== currentContentHeight) {
            this.props.onEndReached();
            this.pan.lastOnEndReachedContentLength = currentContentHeight;
        }
    }


    _setContentPan() {
        this.contentDom && (this.contentDom.style.transform = this.contentDom.style.webkitTransform = 'translate3d( 0, ' + this.pan.distance + 'px, 0 )');
        this.pullUIDom && (this.pullUIDom.style.transform = this.pullUIDom.style.webkitTransform = 'translate3d( 0, ' + ( this.pan.distance - this.pullUIDom.offsetHeight ) + 'px, 0 )');
    }


    _setRefresh() {
        this.setState({
            refresh: this.pan.distance > this.props.onPullRefreshThreshold
        });
    }


    _doLoading() {
        this.setState({
            loading: true
        });
        this._setDefaultPanProps();
        const cb = ()=> {
            const endTime = new Date().getTime();
            const timeLeft = this.props.minLoadingTime - (endTime - startTime);
            if (timeLeft > 0) {
                this.doResetTimeout = setTimeout(()=> {
                    this._doReset();
                }, timeLeft)
            }
            else {
                this._doReset();
            }
        };
        let result = this.props.enablePullRefreshEvent && this.props.onPullRefresh(cb);
        const startTime = new Date().getTime();
        if (typeof result === 'object' && result && typeof result.then === 'function') {
            this.doResetTimeout = setTimeout(()=> {
                result.then(()=> {
                        this._doReset();
                    })
                    .catch(err=> {
                        this._doReset();
                    });
            }, this.props.minLoadingTime);
        }
    }


    _doReset() {
        if (!this.doingPullDown) return;
        this.setState({
            loading: false,
            refresh: false,
            reset: true
        });
        this._setDefaultPanProps();
        this._setContentPan();
        this.pan.lastOnEndReachedContentLength = 0;

        const removeReset = ()=> {
            this.setState({
                reset: false
            });
            document.body.removeEventListener('transitionend', removeReset, false);
        };
        document.body.addEventListener('transitionend', removeReset, false);
        this.doingPullDown = false;
    }


    _renderDefaultPullLoading() {
        return <Loading/>;
    }


    _renderDefaultPullUI() {
        return (
            <span>
                { !this.state.refresh ? '下拉刷新' : '释放更新'}
            </span>
        )
    }


    render() {
        let styles = {};
        const transitionStyle = {
            transition: 'all .25s ease'
        };
        const { className, pullUIClassName, contentClassName, pullUIInfoClassName, renderHeader, renderFooter } = this.props;

        if (this.pullUI && this.content) {
            styles = {
                content: {
                    transform: this.contentDom.style.transform,
                    WebkitTransform: this.contentDom.style.webkitTransform
                },
                pullUI: {
                    transform: this.pullUIDom.style.transform,
                    WebkitTransform: this.pullUIDom.style.webkitTransform
                }
            };
        }

        if (this.state.loading) {
            styles.loadingInfo = {
                display: 'none'
            };
        }

        if (this.state.reset || this.state.loading) {
            styles.pullUI = {
                ...styles.pullUI,
                ...transitionStyle
            };
            styles.content = {
                ...styles.content,
                ...transitionStyle
            };
            styles.loadingInfo = {
                display: 'none'
            }
        }

        const pullUI = (
            <div ref={view=>this.pullUI=view}
                 className={`react-listview-pull-ui ${pullUIClassName}`}
                 style={{
                        ...styles.pullUI,
                        ...this.props.pullUIStyle
                     }}>

                { this.state.loading && (this.props.renderPullLoading ? this.props.renderPullLoading() : this._renderDefaultPullLoading())}

                <div
                    style={styles.loadingInfo}
                    className={`pull-ui-info ${pullUIInfoClassName}`}>
                    { this.props.renderPullUI ? this.props.renderPullUI(this.state.refresh) : this._renderDefaultPullUI() }
                </div>
            </div>
        );


        return (
            <div
                style={this.props.style}
                className={`react-listview-wrapper ${className}`}>

                { this.props.enablePullRefreshEvent && pullUI}

                <div ref={view=>this.content=view}
                     className={`react-listview-content ${contentClassName}`}
                     style={{
                        ...styles.content,
                        ...this.props.contentStyle
                     }}
                     onScroll={this._onScroll.bind(this)}
                     onTouchCancel={this._touchEnd.bind(this)}
                     onTouchMove={this._touch.bind(this)}
                     onTouchEnd={this._touchEnd.bind(this)}
                     onTouchStart={this._touchStart.bind(this)}>
                    {renderHeader()}
                    <ListViewContent ref={view=>this.listviewContent=view} {...this.props}/>
                    {renderFooter()}
                </div>
            </div>
        );
    }
}

export default ListView;
