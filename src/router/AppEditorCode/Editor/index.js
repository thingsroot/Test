import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import AceEditor from 'react-ace';
import { Icon, message, Modal } from 'antd';
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
import 'brace/theme/monokai';

const confirm = Modal.confirm


@withRouter
@inject('store')
@observer
class MyCode extends Component {
    constructor (props){
        super(props);
        this.timer = null
        this.state = {
            editorContent: '',
            mode: 'lua',
            app: '',
            filePath: '',
            fileType: '',
            changed: false,
            fontSize: 16,
            readOnly: true
        }
    }
    componentDidMount () {
        this.setState( {
            app: this.props.app,
            filePath: this.props.filePath,
            fileType: this.props.fileType,
            editorContent: '',
            changed: false,
            readOnly: true
        }, () => {
            this.getContent();
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.state.app !== nextProps.app || this.state.filePath !== nextProps.filePath){
            if (this.state.changed) {
                this.showChangesConfirm(this.state.app, this.state.filePath, this.state.editorContent)
            }
            this.setState( {
                app: nextProps.app,
                filePath: nextProps.filePath,
                fileType: nextProps.fileType,
                editorContent: '',
                changed: false,
                readOnly: true
            }, () => {
                this.getContent();
            })
        }
    }
    componentWillUnmount () {
        if (this.timer){
            clearTimeout(this.timer)
        }
    }
    getMode () {
        let mode = '';
        if (this.state.fileType === 'file') {
            let filePath = this.state.filePath
            switch (filePath.substr(filePath.indexOf('.') + 1, filePath.length)) {
                case 'js' : mode = 'javascript'; break;
                case 'html' : mode = 'html'; break;
                case 'java' : mode = 'java'; break;
                case 'py' : mode = 'python'; break;
                case 'lua' : mode = 'lua'; break;
                case 'xml' : mode = 'xml'; break;
                case 'rb' : mode = 'ruby'; break;
                case 'scss' : mode = 'sass'; break;
                // case 'less' : mode = 'sass'; break;
                case 'md' : mode = 'markdown'; break;
                case 'sql' : mode = 'mysql'; break;
                case 'json' : mode = 'json'; break;
                case 'ts' : mode = 'typescript'; break;
                case 'css' : mode = 'css'; break;
                case '' : mode = 'javascript'; break;
                default : mode = 'text'
            }
        }
        return mode
    }
    showChangesConfirm (app, filePath, content) {
        let file_app = app
        let file_path = filePath
        let file_content = content
        //保存提示
        const save_file = ()=>{
            let url = '/apis/api/method/app_center.editor.editor';
            let params = {
                app: file_app,
                operation: 'set_content',
                id: file_path,
                text: file_content
            };
            http.post(url, params)
                .then(res=>{
                    if (res.status === 'OK') {
                        message.success(`保存文件${file_path}成功`)
                    } else {
                        message.error(`保存文件${file_path}失败! ${res.error}`)
                    }
                }).catch( err => {
                    message.error(`保存文件${file_path}失败! ${err}`)
                })
        };
        confirm({
            title: '提示信息',
            okText: '确定',
            cancelText: '取消',
            content: `文件${file_path}已修改，是否保存这个文件？`,
            onOk () {
                save_file()
            }
        });
    }
    //获取文件内容
    getContent = ()=>{
        this.setState({readOnly: true})
        if (this.state.fileType === 'file') {
            http.get('/apis/api/method/app_center.editor.editor?app=' + this.state.app + '&operation=get_content&id=' + this.state.filePath)
                .then(res=>{
                    let mode = this.getMode()
                    this.setState({
                        mode: mode,
                        editorContent: res.content,
                        changed: false,
                        readOnly: false
                    }, ()=>{
                        console.log(this.state.filePath, this.state.fileType, this.state.mode)
                        //console.log(this.state.editorContent)
                        this.autoSave()
                    })
                })
        }
    };
    autoSave = ()=>{
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(()=>{
            if (this.state.changed) {
                this.saveFile()
            }
        }, 15000)
    };
    onChange = (newValue)=>{
        this.setState({
            editorContent: newValue,
            changed: true
        })
        this.props.onChange(newValue)
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
        if (!this.state.changed) {
            message.warning('文件未改动！')
        } else {
            let url = '/apis/api/method/app_center.editor.editor';
            let params = {
                app: this.state.app,
                operation: 'set_content',
                id: this.state.filePath,
                text: this.state.editorContent
            };
            http.post(url, params)
                .then(res=>{
                    if (res.status === 'OK') {
                        this.setState({changed: false})
                        message.success(`保存文件${this.state.filePath}成功`)
                    } else {
                        message.error(`保存文件${this.state.filePath}失败! ${res.error}`)
                    }
                    this.autoSave()
                }).catch( err => {
                    message.error(`保存文件${this.state.filePath}失败! ${err}`)
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
                        <span>当前文件：{this.state.filePath}</span>
                        <span>{this.state.changed ? '已修改' : '未修改'}</span>
                    </p>
                    {
                        this.state.readOnly ? ''
                        : <AceEditor
                            mode={this.state.mode}
                            readOnly={this.state.readOnly}
                            theme="monokai"
                            name="app_code_editor"
                            onChange={this.onChange}
                            fontSize={fontSize}
                            showPrintMargin
                            showGutter
                            highlightActiveLine
                            value={this.state.editorContent}
                            style={{width: '100%'}}
                            setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: false,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 4
                            }}
                          />
                    }
                </div>
            </div>
        );
    }
}

export default MyCode;