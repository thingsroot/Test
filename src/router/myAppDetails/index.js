import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Tabs } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import VersionList from './versionList';
import TemplateList from './templateList';
import AppDesc from './appDesc';
import {_getCookie} from '../../utils/Session';
import {inject, observer} from 'mobx-react';

const TabPane = Tabs.TabPane;
const block = {
    display: 'inline-block',
    margin: '0 10px',
    textDecoration: 'none'
};
const none = {
    display: 'none'
};

@inject('store')
@observer
class MyAppDetails extends Component {
    state = {
        user: '',
        message: '',
        time: '',
        app: '',
        desc: '',
        templateList: [],
        groupName: '',
        onLine: []
    };
    componentDidMount (){
        let user = unescape(_getCookie('user_id'));
        let app = this.props.match.params.name;
        this.setState({
            user: user,
            app: app
        });
        this.getDetails(app);
        http.get('/api/user_groups_list').then(res=>{
            this.props.store.codeStore.setGroupName(res.data[0].name)
        });
    }

    getDetails = (app)=>{
        http.get('/api/gateways_list')
            .then(res=>{
                const online = [];
                res.message && res.message.length > 0 && res.message.map((v)=>{
                    if (v.data.device_status === 'ONLINE'){
                        online.push(v.data)
                    }
                });
                console.log(online[0].sn);
                this.setState({
                    onLine: online[0].name
                })
            });
        http.get('/api/applications_read?app=' + app).then(res=>{
            this.setState({
                message: res.data.data.data,
                desc: res.data.data.data.description,
                time: res.data.data.data.modified.substr(0, 11),
                templateList: res.data.tempList
            });
            this.props.store.codeStore.setVersionList(res.data.versionList.data);
            this.props.store.codeStore.setVersionLatest(res.data.versionLatest.data)
        });
        http.get('/api/user_configuration_list?app=' + app)
            .then(res=>{
                this.props.store.codeStore.setTemplateList(res.message)
            });
    };
    callback = (key)=>{
        console.log(key);
    };
    render () {
        const { url } = this.props.match;
        let { app, message, time, user, templateList } = this.state;
        console.log(user)
        return (
            <div className="myAppDetails">
                <div className="header">
                    <span><Icon type="appstore" />{message.app_name}</span>
                    <span
                        onClick={()=>{
                            window.location.href = '/myApps'
                        }}
                    >
                    <Icon type="rollback"/></span>
                </div>
                <div className="details">
                    <div className="appImg">
                        <img
                            src={`http://cloud.thingsroot.com${message.icon_image}`}
                            alt="图片"
                        />
                    </div>
                    <div className="appInfo">
                        <p className="appName">{message.app_name}</p>
                        <p className="info">
                            <span>    发布者：{message.owner}</span>
                            <span>创建时间：{time}</span><br/>
                            <span>应用分类：{message.category === null ? '----' : message.category}</span>
                            <span>通讯协议：{message.protocol === null ? '----' : message.protocol}</span><br/>
                            <span>适配型号：{message.device_serial === null ? '----' : message.device_serial}</span>
                            <span>设备厂商：{message.device_supplier === null ? '----' : message.device_supplier}</span>
                        </p>
                    </div>
                    <div className="btnGroup">

                        <Link
                            className="button"
                            style={message.owner === user ? block : none}
                            to={`/appSettings/2/${message.name}`}
                        >
                            <Icon type="setting" />
                            设置
                        </Link>
                        <Link
                            className="button"
                            style={message.owner === user ? block : none}
                            to={`/AppEditorCode/${message.name}/${message.app_name}`}
                        >
                            <Icon type="edit" />
                            代码编辑
                        </Link>
                        <Link
                            className="button"
                            to={`/AppsInstall/${this.state.onLine}/${message.name}/2`}
                        >
                            <Icon type="download" />
                            安装此应用
                        </Link>
                        <Link
                            className="button"
                            style={message.fork_from ? block : none}
                            to={`/myAppDetails/${message.fork_from}`}
                            onClick={
                                ()=>{
                                    this.getDetails(message.fork_from);
                                    this.setState({
                                        app: this.props.match.params.name
                                    });
                                }
                            }
                        >
                            <Icon type="share-alt" />
                            分支
                        </Link>
                    </div>
                </div>
                <Tabs
                    onChange={this.callback}
                    type="card"
                >
                    <TabPane
                        tab={
                            <Link
                                style={{textDecoration: 'none'}}
                                to={`${url}/appDesc`}
                            >
                                描述
                            </Link>}
                        key="1"
                    >
                        <AppDesc desc={this.state.desc}/>
                    </TabPane>
                    <TabPane
                        tab={
                            <Link
                                style={{textDecoration: 'none'}}
                                to={`${url}/versionList`}
                            >
                                版本列表
                            </Link>}
                        key="2"
                    >
                        <VersionList
                            app={app}
                            user={message.owner === user ? true : false}
                        />
                    </TabPane>
                    <TabPane
                        tab={
                            <Link
                                style={{textDecoration: 'none'}}
                                to={`${url}/templateList`}
                            >
                                模板列表
                            </Link>}
                        key="3"
                    >
                        <TemplateList
                            templateList={templateList}
                            app={app}
                        />
                    </TabPane>
                </Tabs>

            </div>
        );
    }
}

export default MyAppDetails;