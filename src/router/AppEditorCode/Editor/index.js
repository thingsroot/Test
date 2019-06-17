import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import {Icon, Input, message, Modal, Select} from 'antd';
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

const confirm = Modal.confirm;
const Option = Select.Option;
const { TextArea } = Input;

@withRouter
@inject('store')
@observer
class MyCode extends Component {
    constructor (props){
        super(props);
        this.timer = null;
        this.state = {
            editorContent: '',
            mode: 'lua',
            app: '',
            filePath: '',
            fileType: '',
            changed: false,
            fontSize: 16,
            readOnly: true,
            visible: false,
            versionList: [],
            showReleaseModal: false,
            newVersion: '',
            comment: '',
            codeEditorAllList: [
                'one',
                'two',
                'three',
                'four'
            ]
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
            this.loadVersionList()
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
            let filePath = this.state.filePath;
            switch (filePath.substr(filePath.indexOf('.') + 1, filePath.length)) {
                case 'js' : mode = 'javascript'; break;
                case 'html' : mode = 'html'; break;
                case 'java' : mode = 'java'; break;
                case 'py' : mode = 'python'; break;
                case 'lua' : mode = 'lua'; break;
                case 'xml' : mode = 'xml'; break;
                case 'rb' : mode = 'ruby'; break;
                case 'scss' : mode = 'sass'; break;
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
    loadVersionList () {
        //应用版本列表
        http.get('/apis/api/method/app_center.api.get_versions?app=' + this.props.app + '&beta=1')
            .then(res=>{
                let data = [];
                res.message && res.message.length > 0 && res.message.map((v)=>{
                    data.push(v.version)
                });
                data.sort(function (a, b) {
                    return b - a;
                });
                this.setState({
                    versionList: data,
                    newVersion: data[0] + 1,
                    comment: 'V' + (data[0] + 1)
                })
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
                message.success('工作区将重置到版本' + this.state.version);
                setTimeout(()=>{
                    window.location.reload();
                }, 1500)

            })
    };
    //重置版本结束

    //发布新版本
    showReleaseModal = () => {
        this.setState({
            showReleaseModal: true
        });
    };
    hide = () => {
        this.setState({
            showReleaseModal: false
        });
    };
    versionChange = (e)=>{
        const { value } = e.target;
        this.setState({
            newVersion: value
        })
    };

    commentChange = (e)=>{
        const { value } = e.target;
        this.setState({
            comment: value
        })
    };
    newVersion = ()=>{
        const {codeStore} = this.state
        http.post('/apis/api/method/app_center.editor.editor_release?app=' + this.state.app +
            '&operation=set_content&version=' + this.state.newVersion +
            '&comment=' + this.state.comment)
            .then(res=>{
                message.success(res.message + ', 即将跳转到新版本！');
            });
        setTimeout(()=>{
            this.setState({
                showReleaseModal: false
            });
            codeStore.change();
            window.location.reload()
        }, 1500)
    };

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
        const { fontSize, visible, versionList, showReleaseModal, newVersion, comment } = this.state;
        return (
            <div className="codeEditor">
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
                            onClick={this.showReleaseModal}
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
                        this.state.editorContent !== '' ? <AceEditor
                            mode={this.state.mode}
                            readOnly={this.state.readOnly}
                            theme="tomorrow"
                            name="app_code_editor"
                            onChange={this.onChange}
                            fontSize={fontSize}
                            showPrintMargin
                            showGutter
                            highlightActiveLine
                            enableSnippets
                            value={this.state.editorContent}
                            style={{width: '100%', height: '75vh'}}
                            setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: true,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 4
                            }}
                        />
                        : ''
                    }
                </div>
                <Modal
                    title="重置编辑器工作区内容版本到"
                    visible={visible}
                    onOk={this.resetVersion}
                    onCancel={this.hideModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <span style={{padding: '0 20px'}}>版本</span>
                    <Select
                        defaultValue="请选择..."
                        style={{ width: 350 }}
                    >
                        {
                            versionList && versionList.length > 0 && versionList.map((v)=>{
                                return (
                                    <Option
                                        key={v}
                                        onClick={()=>{
                                            this.getVersion(v)
                                        }}
                                    >
                                        {v}
                                    </Option>
                                )
                            })
                        }
                    </Select>
                </Modal>
                <Modal
                    title="发布新版本"
                    visible={showReleaseModal}
                    onOk={this.newVersion}
                    onCancel={this.hide}
                    okText="确认"
                    cancelText="取消"
                >
                    <p style={{display: 'flex'}}>
                        <span style={{padding: '5px 20px'}}>填写版本</span>
                        <Input
                            type="text"
                            defaultValue={newVersion}
                            style={{width: '320px'}}
                            onChange={this.versionChange}
                        />
                    </p>
                    <br/>

                    <p style={{display: 'flex'}}>
                        <span style={{padding: '0 20px'}}>更新日志</span>
                        <TextArea
                            row={8}
                            style={{width: '320px'}}
                            defaultValue={comment}
                            onChange={this.commentChange}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

export default MyCode;