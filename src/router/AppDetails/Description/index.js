import React, { Component } from 'react';
import Editor from 'for-editor'
import {inject, observer} from 'mobx-react';
import intl from 'react-intl-universal';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
}

@inject('store')
@observer
class AppDescription extends Component {
    render () {
        const preview = true;
        return (
            <div className="appDescription">
                <div
                    style={this.props.source !== '' ? block : none}
                >
                    <Editor
                        // style={{height: 400}}
                        preview={preview}
                        value={this.props.source}
                        toolbar={false}
                    />
                </div>
                <div
                    className="empty"
                    style={this.props.source !== '' ? none : block}
                >
                    {`${intl.get('appdetails.no_description_at_present')}!`}
                </div>
            </div>
        );
    }
}

export default AppDescription;