import React, { Component } from 'react';
import marked from 'marked';
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
class AppDesc extends Component {
    state = {
        editorContent: '',
        desc: ''
    };
    componentDidMount (){
        console.log(this.props)
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

<<<<<<< HEAD
    UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
=======
    UNSAFE_componentWillReceiveProps (nextProps, nextContext){
>>>>>>> 4a99987aefb531df0a7235ac5cfa906b69b1046c
        if (nextProps.desc !== nextContext.desc) {
            this.setState({
                desc: nextProps.desc
            }, ()=>{
                console.log(this.state.desc)
            })
            this.refs.editor.innerHTML = marked(nextProps.desc);
        }
    }

    render () {
        return (
            <div className="appDesc">
                <div
                    ref="editor"
                > </div>
            </div>
        );
    }
}

export default AppDesc;