import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import {Icon, Input, message, Modal, Select, Divider, Tooltip} from 'antd';
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
import 'brace/theme/monokai';//
import intl from 'react-intl-universal';

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
            editable: false,
            editorContent: undefined,
            mode: 'lua',
            app: '',
            gateway: undefined,
            applyEnable: true,
            app_inst: '',
            filePath: '',
            fileType: '',
            changed: false,
            fontSize: 16,
            readOnly: true,
            showRevertModal: false,
            versionList: [],
            showReleaseModal: false,
            newVersion: '',
            comment: '',
            deskHeight: document.body.clientHeight * 0.8
        }
    }
    componentDidMount () {
        this.setState( {
            app: this.props.app,
            gateway: this.props.gateway,
            app_inst: this.props.app_inst,
            filePath: this.props.filePath,
            fileType: this.props.fileType,
            editorContent: undefined,
            changed: false,
            readOnly: true
        }, () => {
            this.getContent();
            this.loadVersionList()
        })
        document.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('resize', this.handleSize);
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.state.app !== nextProps.app ||
            this.state.filePath !== nextProps.filePath ||
            this.state.gateway !== nextProps.gateway ||
            this.state.app_inst !== nextProps.app_inst){
            if (this.state.changed) {
                this.showChangesConfirm(this.state.app, this.state.filePath, this.state.editorContent)
            }
            this.setState( {
                app: nextProps.app,
                gateway: nextProps.gateway,
                app_inst: nextProps.app_inst,
                filePath: nextProps.filePath,
                fileType: nextProps.fileType,
                editorContent: undefined,
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
        document.removeEventListener('keydown', this.onKeyDown)
        window.removeEventListener('resize', this.handleSize);
    }

    handleSize = () => {
        this.setState({
            deskHeight: document.body.clientHeight * 0.8
        });
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
                        message.success(`${intl.get('appeditorcode.save_file')}${file_path}${intl.get('common.success')}`)
                    } else {
                        message.error(`${intl.get('appeditorcode.save_file')}${file_path}${intl.get('common.fail')}! ${res.error}`)
                    }
                }).catch( err => {
                    message.error(`${intl.get('appeditorcode.save_file')}${file_path}${intl.get('common.fail')}! ${err}`)
                })
        };
        confirm({
            title: intl.get('appdetails.prompt_information'),
            okText: intl.get('common.sure'),
            cancelText: intl.get('common.cancel'),
            content: `${intl.get('appeditorcode.file')}${file_path}${intl.get('appeditorcode.revised')}，${intl.get('appeditorcode.do_you_want_to_save_this_file')}?`,
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
            let app = this.state.app;
            let filePath = this.state.filePath;
            if (app === '' || filePath === '') {
                return
            }
            http.get('/apis/api/method/app_center.editor.editor?app=' + app + '&operation=get_content&id=' + filePath)
                .then(res=>{
                    if (this.state.app !== app || this.state.filePath !== filePath) {
                        return
                    }
                    let mode = this.getMode()
                    this.setState({
                        mode: mode,
                        editorContent: res.content,
                        editable: true,
                        changed: false,
                        readOnly: false
                    }, ()=>{
                        this.autoSave()
                    })
                }).catch( (err) => {
                    err;
                    if (this.state.app !== app || this.state.filePath !== filePath) {
                        return
                    }
                    message.error(intl.get('appeditorcode.file_is_not_editable'))
                    this.setState({editorContent: undefined, editable: false})
                })
        } else {
            this.setState({editable: false, changed: false})
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
            showRevertModal: true
        });
    };
    hideModal = () => {
        this.setState({
            showRevertModal: false
        });
    };
    getVersion = (value)=>{
        this.setState({
            version: value
        });
    };
    resetVersion = ()=>{
        this.setState({
            showRevertModal: false
        });
        let url = '/apis/api/method/app_center.editor.editor_revert';
        http.post(url + '?app=' + this.state.app + '&operation=set_content&version=' + this.state.version)
            .then(res=>{
                res;
                message.success(intl.get('appeditorcode.workspace_will_be_reset_to_version') + this.state.version);
                setTimeout(()=>{
                    window.location.reload();
                }, 1500)
            })
    };
    //重置版本结束

    uploadToGateway = () => {
        const {app_inst, app, gateway, version} = this.state;
        const { actionEnable } = this.props.store.gatewayInfo;
        if (!this.state.applyEnable || !actionEnable) {
            return;
        }

        if (app_inst === '' || app === '' || gateway === undefined) {
            message.error(intl.get('ppeditorcode.installation_information_not_found'))
            return
        }
        this.setState({applyEnable: false})
        let url = '/apis/api/method/app_center.editor.editor_apply';
        let params = {
            app: app,
            device: gateway,
            inst: app_inst,
            version: version,
            id: `editor_apply/${gateway}/${app_inst}/${new Date() * 1}`
        }
        http.post(url, params)
            .then(res=>{
                if (res.message) {
                    message.success(intl.get('appeditorcode.application_installation_successful_request_successful'));
                    this.props.store.action.pushAction(res.message, intl.get('appeditorcode.code_of_application_installation_and_debugging_area'), '', params, 30000,  (result)=> {
                        result;
                        this.setState({applyEnable: true})
                    })
                } else {
                    this.setState({applyEnable: true})
                    message.error(intl.get('appeditorcode.application_installation_success_request_failed'))
                }
            })
            .catch( (err) => {
                err;
                this.setState({applyEnable: true})
                message.error(intl.get('appeditorcode.failed_to_send_application_installation_success_request'))
            })
    }

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
        const {codeStore} = this.state;
        http.post('/apis/api/method/app_center.editor.editor_release?app=' + this.state.app +
            '&operation=set_content&version=' + this.state.newVersion +
            '&comment=' + this.state.comment)
            .then(res=>{
                message.success(res.message + `, ${intl.get('appeditorcode.about_to_jump_to_the_new_version')}`);
            });
        setTimeout(()=>{
            this.setState({
                showReleaseModal: false
            });
            codeStore && codeStore.change();
            window.location.reload()
        }, 1500)
    };

    //保存文件
    saveFile = ()=>{
        if (this.state.editable && this.state.changed) {
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
                        message.success(`${intl.get('appeditorcode.save_file')}${this.state.filePath}${intl.get('common.success')}`)
                    } else {
                        message.error(`${intl.get('appeditorcode.save_file')}${this.state.filePath}${intl.get('common.fail')}! ${res.error}`)
                    }
                    this.autoSave()
                }).catch( err => {
                    message.error(`${intl.get('appeditorcode.save_file')}${this.state.filePath}${intl.get('common.fail')}! ${err}`)
                })
        }
    };//保存文件结束

    render () {
        const { fontSize, gateway, showRevertModal, versionList, showReleaseModal, newVersion, comment } = this.state;
        const { actionEnable } = this.props.store.gatewayInfo;
        return (
            <div className="codeEditor">
                <div className="iconGroup">
                    <p style={{width: 'auto', position: 'resolute'}}>
                        <Divider type="vertical" />
                        <Tooltip title={intl.get('appeditorcode.save_modification_code')} >
                            <Icon
                                type="save"
                                disabled
                                style={{color: this.state.changed ? '#333' : '#ccc'}}
                                onClick={this.saveFile}
                            />
                        </Tooltip>
                        <span style={{padding: '0 2px'}} />
                        <Icon
                            type="zoom-in"
                            onClick={this.zoomOut}
                        />
                        <span style={{padding: '0 2px'}} />
                        <Icon
                            type="zoom-out"
                            onClick={this.zoomIn}
                        />
                        <Divider type="vertical" />
                        <Tooltip title={intl.get('appeditorcode.package_and_release_new_version')} >
                            <Icon
                                type="tag"
                                onClick={this.showReleaseModal}
                            />
                        </Tooltip>
                        <span style={{padding: '0 2px'}} />
                        <Tooltip title={intl.get('appeditorcode.rollback_code')} >
                            <Icon
                                type="retweet"
                                onClick={this.showModal}
                            />
                        </Tooltip>
                        <Divider type="vertical" />
                        {
                            gateway !== undefined ? (

                            <Tooltip title={intl.get('appeditorcode.install_current_code_to_gateway')} >
                                <Icon
                                    style={{color: this.state.applyEnable && actionEnable ? '#333' : '#ccc'}}
                                    type="check-square"
                                    onClick={this.uploadToGateway}
                                />
                            </Tooltip> ) : null
                        }
                        {/*<Icon*/}
                        {/*type="undo"*/}
                        {/*onClick={this.undo}*/}
                        {/*/>*/}
                        {/*<Icon type="redo" onClick={this.keyPress} />*/}
                        <span
                            style={{padding: '0 10px', position: 'absolute', right: 160, color: '#ccc'}}
                            className="color"
                        >
                            <span>当前文件：{this.state.filePath}</span>
                            <span>{this.state.changed ? intl.get('appeditorcode.revised') : intl.get('appeditorcode.not_changed')}</span>
                        </span>
                        <Icon
                            style={{position: 'absolute', right: 0, top: 10}}
                            type="rollback"
                            onClick={()=>{
                                this.props.history.go(-1)
                            }}
                        />

                    </p>
                </div>
                <div className="myCode">
                    {
                        this.state.editable
                        ? <AceEditor
                            id="editor"
                            ref="editor"
                            mode={this.state.mode}
                            readOnly={this.state.readOnly}
                            theme="monokai"
                            name="app_code_editor"
                            onChange={this.onChange}
                            fontSize={fontSize}
                            showPrintMargin
                            showGutter
                            highlightActiveLine
                            enableSnippets
                            commands={[{    //命令是键绑定数组。
                                name: 'saveFile', //键绑定的名称。
                                bindKey: {win: 'Ctrl-S', mac: 'Command-S'}, //用于命令的组合键。
                                exec: ()=>{
                                    if (!this.state.changed) {
                                        message.warning(intl.get('appeditorcode.document_unchanged'))
                                    } else {
                                        this.saveFile()
                                    }
                                }   //重新绑定命令的名称
                            }]}
                            value={this.state.editorContent}
                            style={{width: '100%', height: this.state.deskHeight, minHeight: 600}}
                            setOptions={{
                                enableBasicAutocompletion: true,
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
                    title={intl.get('appeditorcode.reset_editor_workspace_content_version_to')}
                    visible={showRevertModal}
                    onOk={this.resetVersion}
                    onCancel={this.hideModal}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <span style={{padding: '0 20px'}}>{intl.get('appdetails.version')}</span>
                    <Select
                        defaultValue={intl.get('appeditorcode.please_choose')}
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
                    title={intl.get('appeditorcode.release_new_version')}
                    visible={showReleaseModal}
                    onOk={this.newVersion}
                    onCancel={this.hide}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <p style={{display: 'flex'}}>
                        <span style={{padding: '5px 20px'}}>{intl.get('appeditorcode.fill_in_version')}</span>
                        <Input
                            type="text"
                            defaultValue={newVersion}
                            style={{width: '320px'}}
                            onChange={this.versionChange}
                        />
                    </p>
                    <br/>

                    <p style={{display: 'flex'}}>
                        <span style={{padding: '0 20px'}}>{intl.get('appdetails.update_log')}</span>
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