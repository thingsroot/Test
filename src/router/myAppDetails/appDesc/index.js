import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import {inject, observer} from 'mobx-react';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
}

@inject('store')
@observer
class AppDesc extends Component {
    render () {
        return (
            <div className="appDesc">
                <div
                    style={this.props.source !== '' ? block : none}
                >
                    <ReactMarkdown
                        source={this.props.source && this.props.source}
                    />
                </div>
                <div
                    className="empty"
                    style={this.props.source !== '' ? none : block}
                >
                    暂时没有描述！
                </div>
            </div>
        );
    }
}

export default AppDesc;