import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { split as SplitEditor} from 'react-ace';
import http from '../../../utils/Server';
import 'brace/mode/json';
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
        http.get('/home/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_content&id=' + this.props.store.codeStore.fileName)
            .then(res=>{
                this.props.store.codeStore.setEditorContent(res.content);
                this.props.store.codeStore.setNewEditorContent(res.content);
            })
    };

    setContent = (newValue)=>{
        this.props.store.codeStore.setNewEditorContent(newValue);
    };

    onChange = (newValue)=>{
        this.setContent(newValue[0]);
    };
    // blur = ()=>{
    //     this.props.store.codeStore.setMyEditor(this.refs.editor);
    //     console.log(this.props.store.codeStore.myEditor)
    // };

    render () {
        const { fontSize } = this.props;
        return (
            <SplitEditor
                style={{width: '100%', height: '600px'}}
                mode="json"
                theme="github"
                ref="editor"
                fontSize={fontSize}
                splits={1}
                onChange={this.onChange.bind(this)}
                // onBlur={this.blur.bind(this)}
                value={[this.props.store.codeStore.editorContent]}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{$blockScrolling: true}}
            />
        );
    }
}

export default MyCode;