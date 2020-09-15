import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Tabs, message, Button, Modal, Table, Tag, Radio, Input } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import VersionList from './VersionList';
import TemplateList from './TemplateList';
import AppDescription from './Description';
// import TagsEdit from '../../common/TagsEdit';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../utils/Session';
import intl from 'react-intl-universal';

// const { Panel } = Collapse;
const TabPane = Tabs.TabPane;
const block = {
    height: '35px',
    margin: '0 5px'
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
        tag: '',
        app_info: '',
        versionList: [],
        select_the_label: [],
        tags_list: [],
        versionLatest: 0,
        is_fork: false,
        time: '',
        app: '',
        desc: '',
        groupName: '',
        selectedRowKeys: '',
        sn_visible: false,
        newTemplateVisiable: false,
        name: '',
        sn: '',
        ModalText: intl.get('appdetails.confirm_to_delete_this_app'),
        visible: false,
        visible_tags: false,
        confirmLoading: false,
        dataSource: [],
        filterDataSource: [],
        loading: false,
        favorites: false,
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
                title: intl.get('appdetails.serial_number'),
                dataIndex: 'sn',
                key: 'sn'
            },
            {
                title: intl.get('common.name'),
                dataIndex: 'dev_name',
                key: 'dev_name',
                sorter: (a, b) => a.dev_name.length - b.dev_name.length,
                render: (props, record)=>{
                    return (
                        <div style={{lineHeight: '45px'}}>
                            {!record.is_shared && record.owner_type === 'Cloud Company Group' ? <Tag color="cyan" >{intl.get('gateway.company')}</Tag> : null}
                            {!record.is_shared && record.owner_type === 'User' ? <Tag color="lime" >{intl.get('gateway.individual')}</Tag> : null}
                            {record.is_shared ? <Tag color="orange" >{intl.get('gateway.share')}</Tag> : null}
                            {record.dev_name}
                        </div>
                    )
                }
              }, {
                title: intl.get('common.desc'),
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
        this.getFavoritesList()
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
            this.setState({
                name: nextProps.match.params.name
            }, ()=>{
                this.loadApp(this.state.name)
            })
        }
    }
    CheckForCloning = () => {
        http.get('/api/applications_forks_list?name=' + this.props.match.params.name).then(res=>{
            if (res.ok) {
                if (res.data.length > 0) {
                    res.data.map(item=>{
                        if (item.fork_version === this.state.versionLatest) {
                           this.setState({
                               is_fork: true
                           })
                        }
                    })
                }
            }
        })
    }
    getFavoritesList = () => {
        http.post('/api/store_favorites_list').then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                const {name} = this.props.match.params;
                let favorites = false;
                res.data.map(item=>{
                    if (item.name === name) {
                        favorites = true
                    }
                })
                this.setState({
                    favorites,
                    favorites_loading: false
                })
            } else {
                this.setState({
                    favorites: false,
                    favorites_loading: false
                })
            }
        })
    }
    setFavorites = () => {
        this.setState({
            favorites_loading: true
        })
        const data = {
            app: this.state.app_info.name
            // comment: '123',
            // priority: ''v
        }
        const url = !this.state.favorites ? '/api/store_favorites_add' : '/api/store_favorites_remove'
        http.post(url, data).then(res=>{
            if (res.ok) {
                this.getFavoritesList()
            }
        })
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
                message.error(intl.get('appdetails.unable_to_get_app_information'))
                this.props.history.push('/myapps')
                return
            }

            this.setState({
                app_info: res.data.data,
                versionList: res.data.versionList,
                versionLatest: res.data.versionLatest,
                desc: res.data.data.description,
                time: res.data.data.modified.substr(0, 11)
            }, ()=>{
                this.CheckForCloning()
            });
            sessionStorage.setItem('app_name', res.data.data.app_name);
        });
    };
    showModal = () => {
        this.setState({
          visible: true,
          ModalText: intl.get('appdetails.confirm_to_delete_this_app') + '?'
        });
      };
      handleOk = () => {
        this.setState({
          ModalText: intl.get('appdetails.deleting_app'),
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
                        message.success(`${intl.get('appdetails.delete_app_succeeded')}!`)
                        this.props.history.go(-1)
                    } else {
                        message.error(`${intl.get('appdetails.failed_to_delete_app')}：` + res.error + `,${intl.get('appdetails.please_try_again')}!`)
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
                filterDataSource: res.data,
                loading: false
            })
        })
    }
    JumpToInstall = () => {
        if (this.state.sn === '') {
            message.error(`${intl.get('appdetails.please_select_the_gateway_you_want_to_install_to')}！`)
            return false;
        }
        this.props.history.push(`/appsinstall/${this.state.sn}/${this.state.app}/install`)
    }
    cancelInstall = () =>{
        this.setState({
            sn_visible: false
        })
    }
    sendForkCreate (record){
        http.get('/api/gateways_app_version_latest?app=' + record.name).then(result=>{
            if (result.ok) {
                http.post('/api/applications_forks_create', {
                    name: record.name,
                    version: Number(result.data)
                }).then(res=>{
                    if (res.ok){
                        message.success(`${intl.get('appdetails.clone_successfully_applied')}！`)
                        if (res.data){
                            this.props.history.push(`/appeditorcode/${res.data.name}/${res.data.app_name}`);
                        }
                    } else {
                        message.error(res.error)
                    }
                })
            }
        })
    }
    saveTags = () => {
        const {select_the_label} = this.state;
        const data = {
            name: this.props.match.params.name,
            tags: select_the_label.join(',')
        }
        http.post('/api/applications_tags_update', data).then(res=>{
            if (res.ok && res.data === 'done') {
                message.success(intl.get('appedit.Changed_TAB_successfully'))
                this.setVisibleTags()
                this.loadApp(this.state.name)
            } else {
                message.error(intl.get('appedit.Failed_to_change_label_error_message') + res.error)
                this.setVisibleTags()
            }
        })
    }
    filterGateway = (e) => {
        const value = e.target.value.toLowerCase();
        const data = this.state.filterDataSource.filter(item=> item.description.toLowerCase().indexOf(value) !== -1 || item.dev_name.toLowerCase().indexOf(value) !== -1 || item.name.indexOf(value) !== -1)
        this.setState({
            dataSource: data
        })
    }
    getTags = () => {
        http.get('/api/store_tags_list').then(res=>{
            if (res.ok) {
                const tags_list = []
                if (res.data.length > 0) {
                    res.data.map(item=>{
                        tags_list.push(item[0])
                    })
                }
                const {tags} = this.state.app_info;
                const select_the_label = tags !== '' ? tags.split(',') : []
                this.setState({
                    tags_list,
                    select_the_label
                })
            }
        })
        this.setState({visible_tags: true})
    }
    setVisibleTags = () => {
        this.setState({
            visible_tags: false
        })
    }
    addTag = (item) =>{
        const {select_the_label} = this.state;
        if (select_the_label.indexOf(item) === -1) {
            if (select_the_label.length < 20) {
                select_the_label.push(item)
                this.setState({
                    select_the_label
                })
            } else {
                message.error(intl.get('appedit.The_quantity_is_full'))
            }
        } else {
            message.error(intl.get('appedit.Do_not_add_the_same_label_repeatedly'))
        }
    }
    addCustomTag = () => {
        if (this.state.tag !== ''){
            const {select_the_label} = this.state;
            if (select_the_label.indexOf(this.state.tag) === -1) {
                if (select_the_label.length < 20) {
                    if (this.state.tag.length < 8) {
                        select_the_label.push(this.state.tag)
                        this.setState({
                            select_the_label,
                            tag: ''
                        })
                    } else {
                        message.error(intl.get('appedit.Maximum_length_of_characters_is_eight'))
                    }
                } else {
                    message.error(intl.get('appedit.The_quantity_is_full'))
                }
            } else {
                message.error(intl.get('appedit.Do_not_add_the_same_label_repeatedly'))
            }
        } else {
            message.error(intl.get('appedit.Please_enter_label_content'))
        }
    }
    deleteTag = (item)=>{
        const {select_the_label} = this.state;
        const ind = select_the_label.indexOf(item)
        select_the_label.splice(ind, 1)
        this.setState({
            select_the_label
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
                            src={`/store_assets${app_info.icon_image ? app_info.icon_image : '/'}`}
                            alt={intl.get('appdetails.picture')}
                        />
                    </div>
                    <div className="appInfo">
                        <p className="appName">{app_info.app_name}</p>
                        <p className="info">
                            <span>{intl.get('appdetails.publisher')}：{app_info.developer}</span>
                            <span>{intl.get('appdetails.creation_time')}：{time}</span><br/>
                            <span>{intl.get('appdetails.application_classification')}：{app_info.category === null ? '----' : app_info.category}</span>
                            <span>{intl.get('appdetails.communication_protocol')}：{app_info.protocol === null ? '----' : app_info.protocol}</span><br/>
                            <span>{intl.get('appdetails.adapter_type')}：{app_info.device_serial === null ? '----' : app_info.device_serial}</span>
                            <span>{intl.get('appdetails.equipment_manufacturer')}：{app_info.device_supplier === null ? '----' : app_info.device_supplier}</span>
                        </p>
                    </div>
                    <div className="btnGroup">
                        <Button
                            style={app_info.developer === user ? block : none}
                            onClick={()=>{
                                this.props.history.push(`/appedit/${app_info.name}`)
                            }}
                        >
                            <Icon type="setting" />
                            {intl.get('appdetails.settings')}
                        </Button>
                        <Button
                            className="button"
                            style={app_info.developer === user ? block : none}
                            onClick={()=>{
                                this.props.history.push(`/appeditorcode/${app_info.name}/${app_info.app_name}`)
                            }}
                        >
                            <Icon type="edit" />
                            {intl.get('appdetails.code_editing')}
                        </Button>
                        <Button
                            onClick={()=>{
                                this.getGatewayList()
                            }}
                            style={{height: '35px', marginRight: '10px', marginLeft: '5px'}}
                        >
                            <Icon type="download" />
                            {intl.get('appdetails.install_this_app')}
                        </Button>
                        {
                            app_info.developer !== _getCookie('user_id') && Number(_getCookie('is_developer')) === 1
                            ? <Button
                                style={{
                                    height: '35px',
                                    marginRight: '10px'
                                }}
                                disabled={this.state.is_fork}
                                onClick={()=>{
                                    this.sendForkCreate(app_info)
                                }}
                              >
                                <Icon type="fork" />
                                {intl.get('appdetails.clone')}
                            </Button>
                            : ''
                        }
                        <Button
                            className="button"
                            style={app_info.fork_from ? block : none}
                            onClick={()=>{
                                this.props.history.push(`/appdetails/${app_info.fork_from}`)
                            }}
                            // to={`/appdetails/${app_info.fork_from}`}
                        >
                            <Icon type="share-alt" />
                            {intl.get('appdetails.branch')}
                        </Button>
                        {
                            app_info.developer === _getCookie('user_id')
                            ? <Button
                                type="danger"
                                onClick={this.showModal}
                                size="default"
                                style={{height: 35, marginLeft: 5, marginRight: '5px', marginTop: 5}}
                              >
                                <Icon type="info-circle" />
                                <span>{intl.get('appdetails.delete')}</span>
                            </Button>
                            : ''
                        }
                        <Modal
                            title={<span><Icon type="info-circle" /> {intl.get('appdetails.prompt_information')}</span>}
                            visible={visible}
                            onOk={this.handleOk}
                            confirmLoading={confirmLoading}
                            onCancel={this.handleCancel}
                            cancelText={intl.get('common.cancel')}
                            okText={intl.get('common.sure')}
                        >
                            <p>{ModalText}</p>
                        </Modal>
                        <Modal
                            title={<span><Icon type="download" /> {intl.get('appdetails.please_select_the_gateway_to_install_to')}</span>}
                            visible={this.state.sn_visible}
                            onOk={this.JumpToInstall}
                            onCancel={this.cancelInstall}
                            maskClosable={false}
                            cancelText={intl.get('common.cancel')}
                            okText={intl.get('common.sure')}
                            width="1024px"
                        >
                            <Input.Search
                                placeholder={intl.get('gateway.placeholder')}
                                onChange={this.filterGateway}
                                style={{
                                    width: '70%',
                                    marginLeft: '15%',
                                    marginBottom: '15px'
                                }}
                            />
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
                        tab={intl.get('common.desc')}
                        key="description"
                    >
                        <AppDescription source={desc}/>
                    </TabPane>
                    <TabPane
                        tab={intl.get('appdetails.version_list')}
                        key="versions"
                    >
                        <VersionList
                            app={app}
                            initialVersion={this.state.versionLatest}
                            dataSource={this.state.versionList}
                            onUpdate={this.updateVersionList}
                            user={app_info.developer === user ? true : false}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.get('appdetails.template_list')}
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