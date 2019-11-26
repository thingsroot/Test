import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Tabs, message, Button, Modal, Table, Tag, Radio } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import VersionList from './VersionList';
import TemplateList from './TemplateList';
import AppDescription from './Description';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../utils/Session';

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
        app_info: '',
        versionList: [],
        versionLatest: 0,
        time: '',
        app: '',
        desc: '',
        groupName: '',
        selectedRowKeys: '',
        sn_visible: false,
        newTemplateVisiable: false,
        name: '',
        sn: '',
        ModalText: '确认删除此应用？',
        visible: false,
        confirmLoading: false,
        dataSource: [],
        loading: false,
        columns: [
            {
                title: '',
                data: 'dataIndex',
                key: 'dataIndex',
                width: '35px',
                render: record=>{
                    return <Radio checked={record.sn === this.state.sn}/>
                }
            },
            {
                title: '序列号',
                dataIndex: 'sn',
                key: 'sn'
            },
            {
                title: '名称',
                dataIndex: 'dev_name',
                key: 'dev_name',
                sorter: (a, b) => a.dev_name.length - b.dev_name.length,
                render: (props, record)=>{
                    return (
                        <div style={{lineHeight: '45px'}}>
                            {!record.is_shared && record.owner_type === 'Cloud Company Group' ? <Tag color="cyan" >公司</Tag> : null}
                            {!record.is_shared && record.owner_type === 'User' ? <Tag color="lime" >个人</Tag> : null}
                            {record.is_shared ? <Tag color="orange" >分享</Tag> : null}
                            {record.dev_name}
                        </div>
                    )
                }
              }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description',
                sorter: (a, b) => a.description && b.description && a.description.length - b.description.length
              }
          ]
    };
    UNSAFE_componentWillMount () {
            this.setState({
                name: this.props.match.params.name.replace(/\*/g, '/')
            })
    }
    componentDidMount (){
        this.loadApp(this.state.name)
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
            this.loadApp(this.state.name)
        }
    }
    loadApp = (name) => {
        let user = this.props.store.session.user_id;
        let app = name ? name : this.state.name;
        let action = this.props.match.params.action ? this.props.match.params.action : 'description'
        if (action === 'new_template') {
            this.setState( {activeKey: 'templates', newTemplateVisiable: true} )
        } else {
            this.setState( {activeKey: action})
        }
        this.setState({
            user: user,
            app: app
        }, ()=>{
            this.getDetails();
        })
    }
    getDetails = ()=>{
        const {name} = this.state;
        http.get('/api/applications_read?app=' + name).then(res=>{
            if (res.ok && res.data && res.data.data.name.indexOf('/') !== -1) {
                res.data.data.name = res.data.data.name.replace(/\//g, '*')
            }
            if (!res.ok) {
                message.error('无法获取应用信息')
                this.props.history.push('/myapps')
                return
            }

            this.setState({
                app_info: res.data.data,
                versionList: res.data.versionList,
                versionLatest: res.data.versionLatest,
                desc: res.data.data.description,
                time: res.data.data.modified.substr(0, 11)
            });
            sessionStorage.setItem('app_name', res.data.data.app_name);
        });
    };
    showModal = () => {
        this.setState({
          visible: true
        });
      };
      handleOk = () => {
        this.setState({
          ModalText: '删除应用中,请稍后...',
          confirmLoading: true
        });
        if (this.props.match.params.name) {
            const data = {
                name: this.props.match.params.name
            }
            http.post('/api/my_applications_remove', data).then(res=>{
                this.setState({
                    confirmLoading: false,
                    visible: false
                }, ()=>{
                    if (res.ok){
                        message.success('删除应用成功！')
                        this.props.history.go(-1)
                    } else {
                        message.error('删除应用失败，错误信息：' + res.error + ',请重试！')
                    }
                })
            })
        }
      }
      handleCancel = () => {
        this.setState({
          visible: false
        });
      };
    updateVersionList = ()=> {
        http.get('/api/versions_list?app=' + this.state.name).then(res=>{
            if (res.ok && res.data) {
                this.setState({
                    versionList: res.data
                })
            }
        });
    }
    callback = (key)=>{
        this.setState({activeKey: key})
    };
    getGatewayList = () => {
        this.setState({sn_visible: true, loading: true})
        http.get('/api/gateways_list?status=online').then(res=>{
            this.setState({
                dataSource: res.data,
                loading: false
            })
        })
    }
    JumpToInstall = () => {
        if (this.state.sn === '') {
            message.error('请先选择需要安装到的网关！')
            return false;
        }
        this.props.history.push(`/appsinstall/${this.state.sn}/${this.state.app}/install`)
    }
    cancelInstall = () =>{
        this.setState({
            sn_visible: false
        })
    }
    render () {
        let { app, app_info, time, user, desc, visible, confirmLoading, ModalText } = this.state;
        return (
            <div className="myAppDetails">
                <div className="header">
                    <span><Icon type="appstore" />{app_info.app_name}</span>
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
                            src={`/store_assets${app_info.icon_image}`}
                            alt="图片"
                        />
                    </div>
                    <div className="appInfo">
                        <p className="appName">{app_info.app_name}</p>
                        <p className="info">
                            <span>    发布者：{app_info.owner}</span>
                            <span>创建时间：{time}</span><br/>
                            <span>应用分类：{app_info.category === null ? '----' : app_info.category}</span>
                            <span>通讯协议：{app_info.protocol === null ? '----' : app_info.protocol}</span><br/>
                            <span>适配型号：{app_info.device_serial === null ? '----' : app_info.device_serial}</span>
                            <span>设备厂商：{app_info.device_supplier === null ? '----' : app_info.device_supplier}</span>
                        </p>
                    </div>
                    <div className="btnGroup">

                        <Link
                            className="button"
                            style={app_info.owner === user ? block : none}
                            to={`/appedit/${app_info.name}`}
                        >
                            <Icon type="setting" />
                            设置
                        </Link>
                        <Link
                            className="button"
                            style={app_info.owner === user ? block : none}
                            to={`/appeditorcode/${app_info.name}/${app_info.app_name}`}
                        >
                            <Icon type="edit" />
                            代码编辑
                        </Link>
                        <Button
                            onClick={()=>{
                                this.getGatewayList()
                            }}
                            style={{height: '35px'}}
                        >
                            <Icon type="download" />
                            安装此应用
                        </Button>
                        <Link
                            className="button"
                            style={app_info.fork_from ? block : none}
                            to={`/appdetails/${app_info.fork_from}`}
                        >
                            <Icon type="share-alt" />
                            分支
                        </Link>
                        {
                            app_info.owner === _getCookie('user_id')
                            ? <Button
                                type="danger"
                                onClick={this.showModal}
                                size="default"
                                style={{height: 36, marginLeft: 15}}
                              >
                                <Icon type="info-circle" />
                                <span>删除</span>
                            </Button>
                            : ''
                        }
                        <Modal
                            title={<span><Icon type="info-circle" /> 提示信息</span>}
                            visible={visible}
                            onOk={this.handleOk}
                            confirmLoading={confirmLoading}
                            onCancel={this.handleCancel}
                            cancelText="取消"
                            okText="确定"
                        >
                            <p>{ModalText}</p>
                        </Modal>
                        <Modal
                            title={<span><Icon type="download" /> 请选择要安装到的网关</span>}
                            visible={this.state.sn_visible}
                            onOk={this.JumpToInstall}
                            onCancel={this.cancelInstall}
                            maskClosable={false}
                            cancelText="取消"
                            okText="确定"
                            width="1024px"
                        >
                            <Table
                                dataSource={this.state.dataSource}
                                columns={this.state.columns}
                                loading={this.state.loading}
                                size="small"
                                onRow={(record) => ({
                                    onClick: () => {
                                      this.setState({sn: record.sn});
                                    }
                                })}
                            />
                        </Modal>
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
                        <AppDescription source={desc}/>
                    </TabPane>
                    <TabPane
                        tab="版本列表"
                        key="versions"
                    >
                        <VersionList
                            app={app}
                            initialVersion={this.state.versionLatest}
                            dataSource={this.state.versionList}
                            onUpdate={this.updateVersionList}
                            user={app_info.owner === user ? true : false}
                        />
                    </TabPane>
                    <TabPane
                        tab="模板列表"
                        key="templates"
                    >
                        <TemplateList
                            app={app}
                            newTemplateVisiable={this.state.newTemplateVisiable}
                        />
                    </TabPane>
                </Tabs>

            </div>
        );
    }
}

export default AppDetails;