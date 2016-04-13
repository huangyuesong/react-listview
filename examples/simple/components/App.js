import React,{
    Component,
    PropTypes
} from 'react';
import { Router, Route, Link, Redirect } from 'react-router';

import './../styles/app.scss';

class App extends Component {
    render() {
        return (
            <div className="app-wrapper">
                <div className="nav">
                    <div></div>
                    <div>
                        React-ListView
                    </div>
                    <div></div>
                </div>
                <div className="list-wrapper">
                    <ul>
                        <li>
                            <Link className="item" to="/simple">
                                基础功能
                            </Link>
                        </li>
                        <li>
                            <Link className="item" to="/ajax">
                                ajax请求例子
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="info-wrapper">
                    请用手机浏览器打开
                </div>
            </div>
        )
    }
}


export default App;