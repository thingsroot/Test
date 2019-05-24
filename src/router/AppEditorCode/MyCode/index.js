import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { split as SplitEditor} from 'react-ace';
import http from '../../../utils/Server';
import 'brace/mode/javascript';//
import 'brace/mode/html';//
import 'brace/mode/java';//
import 'brace/mode/python';//
import 'brace/mode/lua';//
import 'brace/mode/xml';//
import 'brace/mode/ruby';//
import 'brace/mode/sass';
import 'brace/mode/markdown';//
import 'brace/mode/mysql';
import 'brace/mode/json';//
import 'brace/mode/css';//
import 'brace/mode/typescript';
import 'brace/theme/tomorrow';//
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
        if (this.props.showFileName !== nextProps.showFileName){
            this.getContent();
        }
    }
    //获取文件内容
    getContent = ()=>{
        if (this.props.store.codeStore.folderType === 'file') {
            http.get('/apis/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_content&id=' + this.props.store.codeStore.showFileName)
                .then(res=>{
                    this.props.store.codeStore.setEditorContent(res.content);
                    this.props.store.codeStore.setNewEditorContent(res.content);
                })
        }
    };

    onChange = (newValue)=>{
        this.props.store.codeStore.setNewEditorContent(newValue);
    };

    render () {
        const { fontSize } = this.props;

        return (
            <div className="myCode">
                <p className="color">
                    <span>编辑状态：</span>
                    <span>{this.props.store.codeStore.showFileName}</span>
                </p>
                <SplitEditor
                    style={{width: '100%', height: '80vh'}}
                    mode={this.props.store.codeStore.suffixName}
                    splits={1}
                    theme="tomorrow"
                    ref="editor"
                    fontSize={fontSize}
                    onChange={this.onChange}
                    value={typeof this.props.store.codeStore.editorContent === 'string'
                        ? [this.props.store.codeStore.editorContent]
                        : [JSON.stringify(this.props.store.codeStore.editorContent)]}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}}
                />
            </div>
        );
    }
}

export default MyCode;