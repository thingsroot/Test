import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { inject, observer} from 'mobx-react';
import FileTree from './FileTree';
import CodeEditor from './Editor';
import './style.scss';

import http from '../../utils/Server';
import GatewayStatus from '../../common/GatewayStatus';
import intl from 'react-intl-universal';

GatewayStatus;

@withRouter
@inject('store')
@observer
class AppEditorCode extends Component {
    constructor (props){
        super(props);
        this.state = {
            gateway: undefined,
            app_inst: '',
            app: '',
            appName: '',
            version: '',
            selectedFile: 'version',
            selectedFileType: 'file',
            // fileNodes: [],
            currentNode: 1
        }
    }
    componentDidMount () {
        let app = this.props.match.params.app.replace(/\*/g, '/');
        let appName = this.props.match.params.name;
        let gateway = this.props.match.params.gateway;
        let app_inst = this.props.match.params.inst;
        this.setState({
            appName: appName,
            app: app,
            gateway: gateway,
            app_inst: app_inst
        }, () => {
            if (app !== '') {
                this.loadWorkspace()
            }
        });
    }

    componentWillUnmount () {
    }

    notifyVersionDiff () {
        //提示：当前工作区是基于版本initVersion,
        // 请将设备中的应用升级到版本initVersion，或者将工作区重置到之前版本。
        const {initVersion} = this.state
        this.info(intl.get('appedit.version_hint'),
            intl.get('appedit.the_current_workspace_is_version_based') + initVersion,
            intl.get('appeditorcode.please_upgrade_the_app_in_the_device_to_version') + initVersion,
            intl.get('appeditorcode.Or_reset_the_workspace_to_a_previous_version')
        );
    }

    checkVersionAndLoad () {
        const {version, app} = this.state
        http.get('/apis/api/method/app_center.api.get_latest_version?app=' + app + '&beta=' + 1)
        .then(data=>{
            let latestVersion = data.message;
            console.log(latestVersion);
            this.setState({latestVersion: latestVersion})
            if (latestVersion === undefined || latestVersion === 0){
                this.info(intl.get('appedit.version_hint'), intl.get('appeidtorcode.the_app_hasnt_released_any_version_yet'));
                this.initWorkspace()
                return
            }

            if (version !== latestVersion) {
                if (version !== undefined && version !== 0) {
                    //提示当前工作区是会基于worksapceVersion，当前的最新版本为latest_version（弹框）
                    this.info(intl.get('appedit.version_hint'), intl.get('appeditorcode.the_current_workspace_is_based_on_version    ') + version + `, ${intl.get('appeditorcode.the_current_latest_version_is')}  ` + latestVersion + '.');
                } else {
                    message.info(intl.get('appeditorcode.Initialize_workspace'))
                    this.resetWorkspace(latestVersion)
                }
            } else if (version === latestVersion ) {
                this.loadVersionList()
                // TODO:
                //this.info('版本提示', '当前工作区是基于最新版本' + latestVersion + '.');
            }
        });
    }
    loadVersionList () {
        const {app} = this.state
        //应用版本列表
        http.get('/apis/api/method/app_center.api.get_versions?app=' + app + '&beta=1')
            .then(res=>{
                let data = [];
                res.message && res.message.length > 0 && res.message.map((v)=>{
                    data.push(v.version)
                });
                data.sort(function (a, b) {
                    return b - a;
                });
                this.setState({ versionList: data })
            });
    }
    initWorkspace () {
        const {app} = this.state
        //初始化工作区域到最新版本
        http.get('/apis/api/method/app_center.editor.editor_init?app=' + app)
        .then(res=>{
            let version = res.message;
            this.setState({version: version}, ()=>{
                message.success(intl.get('appeditorcode.workspace_initialized_successfully'))
                this.setState({app: ''}) // Force the fileTree reload
                setTimeout(() => {
                    this.setState({app: app})
                }, 2000);
            })
        })
    }
    resetWorkspace (version) {
        const {app} = this.state
        //初始化工作区域到最新版本
        http.get('/apis/api/method/app_center.editor.editor_init?app=' + app + '&version=' + version)
        .then(res=>{
            let version = res.message;
            // console.log(initVersion);
            //window.location.reload();
            message.success(`${intl.get('appeditorcode.workspace_successfully_initialized_to_version')}：${version}，${intl.get('appeditorcode.please_wait_while_the_editor_loads')}`)
            this.setState({app: ''}) // Force the fileTree reload
            setTimeout(() => {
                this.setState({app: app})
            }, 2000);
        })
    }

    loadWorkspace () {
        const {app} = this.state
        //设备应用和平台应用对比
        http.get('/apis/api/method/app_center.editor.editor_workspace_version?app=' + app)
            .then(res=>{
                let worksapceVersion = res.message;
                this.setState({version: worksapceVersion ? worksapceVersion : 0}, () => {
                    this.checkVersionAndLoad()
                })
            });
    }


    //提示弹框
    info = (title, content)=>{
        Modal.info({
            title: title,
            content: (
                <div>
                    <p>{content}</p>
                </div>
            ),
            onOk () {}
        });
    };

    onSelect = (dataNode) => {
       this.setState({
           selectedFile: dataNode.key,
           selectedFileType: dataNode.type
       })
    };

    onContentChange () {
        console.log('changed')
    }

    render () {
        const {
            app,
            appName,
            gateway,
            app_inst,
            selectedFile,
            selectedFileType
        } = this.state;
        return (
            <div>
            {
                gateway !== undefined ? <GatewayStatus gateway={gateway}/> : ''
            }
            <div
                className="appEditorCode"
                style={{marginTop: gateway !== undefined ? '0' : '-20px'}}
            >
                <div className="main">
                    <FileTree
                        app={app}
                        gateway={gateway}
                        app_inst={app_inst}
                        onSelect={this.onSelect}
                        appName={appName}
                    />
                    <CodeEditor
                        app={app}
                        gateway={gateway}
                        app_inst={app_inst}
                        filePath={selectedFile}
                        fileType={selectedFileType}
                        onChange={this.onContentChange}
                    />
                </div>


            </div>
            </div>
        );
    }
}

export default AppEditorCode;