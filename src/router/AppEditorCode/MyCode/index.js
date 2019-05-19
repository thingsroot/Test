import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import AceEditor from 'react-ace';
import http from '../../../utils/Server';
// import `brace/mode/${this.props.store.codeStore.suffixName}`;
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
            this.getContent();
        }
    }
    //获取文件内容
    getContent = ()=>{
        if (this.props.store.codeStore.folderType === 'file') {
            http.get('/home/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_content&id=' + this.props.store.codeStore.fileName)
                .then(res=>{
                    this.props.store.codeStore.setEditorContent(res.content);
                    this.props.store.codeStore.setNewEditorContent(res.content);
                })
        }
    };
    setContent = (newValue)=>{
        this.props.store.codeStore.setNewEditorContent(newValue);
    };
    onChange = (newValue, e)=>{
        console.log(newValue, e);
        this.setContent(newValue)
    };


    render () {
        const { fontSize } = this.props;
        return (
            <div className="myCode">
                <p className="color">
                    <span>编辑状态：</span>
                    <span>{this.props.store.codeStore.fileName}</span>
                </p>
                <AceEditor
                    style={{width: '100%', height: '80vh'}}
                    mode={this.props.store.codeStore.setSuffixName}
                    theme="github"
                    ref="editor"
                    fontSize={fontSize}
                    onChange={this.onChange.bind(this)}
                    value={this.props.store.codeStore.editorContent}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}}
                />
            </div>
        );
    }
}

export default MyCode;