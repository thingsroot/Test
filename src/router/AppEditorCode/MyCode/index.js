import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import AceEditor from 'react-ace';
import http from '../../../utils/Server';
import 'brace/mode/java';
import 'brace/theme/github';
@withRouter
@inject('store')
@observer

class MyCode extends Component {
    constructor (props){
        super(props);
        this.state = {
            editorContent: '',
            mode: '',
            app: '',
            fileName: '',
            newContent: ''
        }
    }
    componentDidMount () {
        this.getContent();
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.fileName !== nextProps.fileName || this.props.isChange !== nextProps.isChange){
            console.log(123);
            this.getContent();
        }
    }
    //获取文件内容
    getContent = ()=>{
        http.get('/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_content&id=' + this.props.store.codeStore.fileName)
            .then(res=>{
                this.props.store.codeStore.setEditorContent(res.content);
                this.props.store.codeStore.setNewEditorContent(res.content);
            })
    };
    setContent = (newValue)=>{
        this.props.store.codeStore.setNewEditorContent(newValue);
    };
    onChange = (newValue, e)=>{
        console.log(newValue, e);
        this.setContent(newValue)
    };
    // blur = ()=>{
    //     this.props.store.codeStore.setMyEditor(this.refs.editor);
    //     console.log(this.props.store.codeStore.myEditor)
    // };

    render () {
        const { fontSize } = this.props;
        return (
            <div className="myCode">
                <AceEditor
                    style={{width: '100%', height: '600px'}}
                    mode="java"
                    theme="github"
                    ref="editor"
                    fontSize={fontSize}
                    onChange={this.onChange.bind(this)}
                    // onBlur={this.blur.bind(this)}
                    value={this.props.store.codeStore.editorContent}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}}
                />
            </div>
        );
    }
}

export default MyCode;