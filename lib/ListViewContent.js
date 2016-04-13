import React,{
    Component,
    PropTypes
} from 'react';


class ListViewContent extends Component {
    shouldComponentUpdate(nextProps) {
        return this._shouldUpdate([
            'data',
            'renderItem'
        ], nextProps);
    }


    _shouldUpdate(rules, nextProps) {
        return rules.some(item=> {
            return nextProps[item] !== this.props[item]
        })
    }


    _renderItem() {
        return this.props.data.map((item, index)=> {
            return this.props.renderItem(item, index);
        });
    }


    render() {
        return (
            <div className="list-view-content-inner-wrapper">
                {this._renderItem()}
            </div>
        )
    }
}


export default ListViewContent;