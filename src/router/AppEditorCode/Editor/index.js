import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { split as SplitEditor} from 'react-ace';
import { Icon, message } from 'antd';
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
        if (this.props.codeStore.folderType === 'file') {
            http.get('/apis/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_content&id=' + this.props.codeStore.showFileName)
                .then(res=>{
                    this.props.codeStore.setEditorContent(res.content);
                    this.props.codeStore.setNewEditorContent(res.content);
                })
        }
    };
    autoSave = (newValue)=>{
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(()=>{
            let url = '/apis/api/method/app_center.editor.editor';
            http.post(url + '?app=' + this.props.match.params.app +
                '&operation=set_content&id=' + this.props.codeStore.fileName +
                '&text=' + newValue)
                .then(res=>{
                    res;
                })
        }, 3000)
    };
    onChange = (newValue)=>{
        this.props.codeStore.setNewEditorContent(newValue);
        this.autoSave(newValue)
    };
    //+
    zoomIn = ()=>{
        let size = this.state.fontSize - 2;
        this.setState({
            fontSize: size
        })
    };
    //-
    zoomOut = ()=>{
        let size = this.state.fontSize + 2;
        this.setState({
            fontSize: size
        })
    };
    //重置版本
    showModal = () => {
        this.setState({
            visible: true
        });
    };
    hideModal = () => {
        this.setState({
            visible: false
        });
    };
    getVersion = (value)=>{
        this.setState({
            version: value
        });
    };
    resetVersion = ()=>{
        this.setState({
            visible: false
        });
        let url = '/apis/api/method/app_center.editor.editor_revert';
        http.post(url + '?app=' + this.state.app + '&operation=set_content&version=' + this.state.version)
            .then(res=>{
                res;
                this.props.codeStore.change();
                message.success('工作区将重置到版本' + this.state.version);
                setTimeout(()=>{
                    window.location.reload();
                }, 1500)

            })
    };

    //重置版本结束
    //保存文件
    saveFile = ()=>{
        const {codeStore} = this.props
        if (codeStore.editorContent === codeStore.newEditorContent) {
            message.warning('文件未改动！')
        } else {
            let url = '/apis/api/method/app_center.editor.editor';
            http.post(url + '?app=' + this.state.app +
                '&operation=set_content&id=' + codeStore.fileName +
                '&text=' + codeStore.newEditorContent)
                .then(res=>{
                    console.log(res);
                    console.log(codeStore.newEditorContent)
                    message.success('文件保存成功！')
                })
        }
    };//保存文件结束
    render () {
        const { fontSize } = this.props;

        return (
            <div>
                <div className="iconGroup">
                    <p style={{width: 'auto', position: 'resolute'}}>
                        <Icon
                            type="sync"
                            onClick={this.showModal}
                        />
                        <Icon
                            type="zoom-in"
                            onClick={this.zoomOut}
                        />
                        <Icon
                            type="zoom-out"
                            onClick={this.zoomIn}
                        />
                        <Icon
                            type="save"
                            onClick={this.saveFile}
                        />
                        <Icon
                            type="upload"
                            onClick={this.show}
                        />
                        {/*<Icon*/}
                        {/*type="undo"*/}
                        {/*onClick={this.undo}*/}
                        {/*/>*/}
                        {/*<Icon type="redo" onClick={this.keyPress} />*/}
                        <Icon
                            style={{position: 'absolute', right: 60, top: 85}}
                            type="cloud-upload"
                            onClick={()=>{
                                console.log('1')
                            }}
                        />
                        <Icon
                            style={{position: 'absolute', right: 30, top: 85}}
                            type="rollback"
                            onClick={()=>{
                                this.props.history.go(-1)
                            }}
                        />

                    </p>
                </div>
                <div className="myCode">
                    <p className="color">
                        <span>编辑状态：</span>
                        <span>{this.props.codeStore.showFileName}</span>
                    </p>
                    <SplitEditor
                        style={{width: '100%', height: '80vh'}}
                        mode={this.props.codeStore.suffixName}
                        splits={1}
                        theme="tomorrow"
                        ref="editor"
                        fontSize={fontSize}
                        onChange={this.onChange}
                        value={typeof this.props.codeStore.editorContent === 'string'
                            ? [this.props.codeStore.editorContent]
                            : [JSON.stringify(this.props.codeStore.editorContent)]}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{$blockScrolling: true}}
                    />
                </div>
            </div>
        );
    }
}

export default MyCode;