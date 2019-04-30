import React, { Component } from 'react';
import marked from 'marked';
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
    state = {
        editorContent: '',
        desc: ''
    };
    componentDidMount (){
        let rendererMD = new marked.Renderer();
        marked.setOptions({
            renderer: rendererMD,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });//基本设置
    }

    UNSAFE_componentWillReceiveProps (nextProps, nextContext){
        if (nextProps.desc !== nextContext.desc) {
            this.setState({
                desc: nextProps.desc
            });
            this.refs.editor.innerHTML = marked(nextProps.desc);
        }
    }

    render () {
        return (
            <div className="appDesc">
                <div
                    style={this.state.desc !== '' ? block : none}
                    ref="editor"
                > </div>
                <div
                    className="empty"
                    style={this.state.desc !== '' ? none : block}
                >
                    暂时没有描述！
                </div>
            </div>
        );
    }
}

export default AppDesc;