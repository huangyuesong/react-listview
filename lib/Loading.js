import React,{
    Component
} from 'react';
import './styles/loading.scss';

class Loading extends Component {
    static defaultProps = {
        className: '',
        color: 'rgba(255, 255, 255, 0.8)'
    };

    render() {
        return (
            <div className={`react-listview-loading ${this.props.className}`}>
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
            </div>
        )
    }
}


export default Loading;