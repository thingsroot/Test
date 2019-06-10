import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Tabs } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import VersionList from './VersionList';
import TemplateList from './TemplateList';
import AppDescription from './Description';
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
@withRouter
@inject('store')
@observer
class AppDetails extends Component {
    state = {
        user: '',
        message: '',
        time: '',
        app: '',
        desc: '',
        groupName: ''
    };

    componentDidMount (){
        let user = this.props.store.session.user_id;
        let app = this.props.match.params.name;
        this.setState({
            user: user,
            app: app
        });
        this.getDetails(app);
        http.get('/api/user_groups_list').then(res=>{
            this.props.store.codeStore.setGroupName(res.data[0].name)
        });
        let action = this.props.match.params.action ? this.props.match.params.action : 'description'
        if (action === 'new_template') {
            this.props.store.codeStore.setTemplateVisible(true)
            this.setState( {activeKey: 'templates'} )
        } else {
            this.setState( {activeKey: action})
        }
    }

    getDetails = (app)=>{
        http.get('/api/applications_read?app=' + app).then(res=>{
            this.setState({
                message: res.data.data,
                versionList: res.data.versionList.data,
                versionLatest: res.data.versionLatest.data,
                desc: res.data.data.description,
                time: res.data.data.modified.substr(0, 11)
            });
            sessionStorage.setItem('app_name', res.data.data.app_name);
            this.props.store.codeStore.setVersionList(res.data.versionList.data);
            this.props.store.codeStore.setVersionLatest(res.data.versionLatest.data)
        });
        http.get('/api/user_configurations_list?app=' + app)
            .then(res=>{
                this.props.store.codeStore.setTemplateList(res.data)
            });
    };
    callback = (key)=>{
        this.setState({activeKey: key})
    };
    render () {
        let { app, message, time, user } = this.state;
        return (
            <div className="myAppDetails">
                <div className="header">
                    <span><Icon type="appstore" />{message.app_name}</span>
                    <span
                        onClick={()=>{
                            this.props.history.go(-1)
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
                            to={`/appsettings/edit/${message.name}`}
                        >
                            <Icon type="setting" />
                            设置
                        </Link>
                        <Link
                            className="button"
                            style={message.owner === user ? block : none}
                            to={`/appeditorcode/${message.name}/${message.app_name}`}
                        >
                            <Icon type="edit" />
                            代码编辑
                        </Link>
                        <Link
                            className="button"
                            to={`/appsinstall/${this.props.store.codeStore.firstGateway}/${message.name}/install`}
                        >
                            <Icon type="download" />
                            安装此应用
                        </Link>
                        <Link
                            className="button"
                            style={message.fork_from ? block : none}
                            to={`/appdetails/${message.fork_from}`}
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
                    activeKey={this.state.activeKey}
                >
                    <TabPane
                        tab="描述"
                        key="description"
                    >
                        <AppDescription source={this.state.desc}/>
                    </TabPane>
                    <TabPane
                        tab="版本列表"
                        key="versions"
                    >
                        <VersionList
                            app={app}
                            dataSource={this.state.versionList}
                            user={message.owner === user ? true : false}
                        />
                    </TabPane>
                    <TabPane
                        tab="模板列表"
                        key="templates"
                    >
                        <TemplateList
                            app={app}
                        />
                    </TabPane>
                </Tabs>

            </div>
        );
    }
}

export default AppDetails;