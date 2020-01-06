import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, Tabs, message, Button, Modal, Table, Tag, Radio, Input } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import VersionList from './VersionList';
import TemplateList from './TemplateList';
import AppDescription from './Description';
import TagsEdit from '../../common/TagsEdit';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../utils/Session';
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
        ModalText: '确认删除此应用？',
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
            }, ()=>{
                this.CheckForCloning()
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
                filterDataSource: res.data,
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
    sendForkCreate (record){
        http.get('/api/gateways_app_version_latest?app=' + record.name).then(result=>{
            if (result.ok) {
                http.post('/api/applications_forks_create', {
                    name: record.name,
                    version: Number(result.data)
                }).then(res=>{
                    if (res.ok){
                        message.success('应用克隆成功，即将跳转到编辑页面！')
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
                message.success('更改标签成功！')
                this.setVisibleTags()
                this.loadApp(this.state.name)
            } else {
                message.error('更改标签失败，错误信息：' + res.error)
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
                message.error('数量已满！')
            }
        } else {
            message.error('请勿重复添加同一标签！')
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
                        message.error('字符最大长度为八位！')
                    }
                } else {
                    message.error('数量已满！')
                }
            } else {
                message.error('请勿重复添加同一标签！')
            }
        } else {
            message.error('请输入标签内容！')
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
        let { app, app_info, time, user, desc, visible, confirmLoading, ModalText, visible_tags, select_the_label, tags_list } = this.state;
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
                        <div className="appName">{app_info.app_name}</div>
                        {
                            app_info.fork_from && <p>fork_form: {app_info.fork_from}
                            <Button
                                type="link"
                                onClick={()=>{
                                    window.open('/appdetails/' + app_info.fork_from)
                                }}
                            >
                            查看
                            </Button></p>
                        }
                        <div className="info">
                            <span>发布者：{app_info.developer}</span>
                            <span>创建时间：{time}</span><br/>
                            <span>应用分类：{app_info.category === null ? '----' : app_info.category}</span><br/>
                            <div className="appdetail_tags">
                                    <span>标签：</span>
                                    <TagsEdit tags_list={app_info.tags}/>
                                {
                                    app_info.developer === _getCookie('user_id') &&
                                    <Button
                                        type="link"
                                        className="app_details_tags_set"
                                        onClick={this.getTags}
                                    >修改</Button>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="btnGroup">
                        <Button
                            style={app_info.developer === user ? block : none}
                            onClick={()=>{
                                this.props.history.push(`/appedit/${app_info.name}`)
                            }}
                        >
                            <Icon type="setting" />
                            设置
                        </Button>
                        <Button
                            style={app_info.developer === user ? block : none}
                            onClick={()=>{
                                this.props.history.push(`/appeditorcode/${app_info.name}/${app_info.app_name}`)
                            }}
                        >
                            <Icon type="edit" />
                            代码编辑
                        </Button>
                        <Button
                            onClick={()=>{
                                this.getGatewayList()
                            }}
                            style={{height: '35px', marginRight: '10px', marginLeft: '5px'}}
                        >
                            <Icon type="download" />
                            安装此应用
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
                                {
                                    this.state.is_fork
                                    ? '已克隆'
                                    : '克隆'
                                }
                            </Button>
                            : ''
                        }
                        <Button
                            loading={this.state.favorites_loading}
                            onClick={this.setFavorites}
                            style={{ marginBottom: '10px', marginRight: '5px', width: '100px', height: '35px'}}
                            type={!this.state.favorites ? 'primary' : 'danger'}
                        >{this.state.favorites ? '取消收藏' : '收藏'}</Button>
                        {
                            app_info.developer === _getCookie('user_id')
                            ? <Button
                                type="danger"
                                onClick={this.showModal}
                                size="default"
                                style={{height: 35, marginLeft: 5, marginRight: '5px'}}
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
                            title={<span><Icon type="info-circle" /> 编辑标签</span>}
                            visible={visible_tags}
                            onOk={this.saveTags}
                            // confirmLoading={confirmLoading}
                            onCancel={this.setVisibleTags}
                            cancelText="取消"
                            okText="确定"
                        >
                            <div>
                                <div className="Select_the_label">
                                    {
                                        select_the_label.length > 0 && select_the_label.map((item, key) => {
                                            return (
                                                <Tag
                                                    key={key}
                                                    closable
                                                    onClose={()=>{
                                                        this.deleteTag(item)
                                                    }}
                                                >{item}</Tag>
                                            )
                                        })
                                    }
                                </div>
                                <div>
                                    注：每个资源最多绑定20个标签，单次操作绑定/解绑标签的数量分别不能超过20个
                                </div>
                                <div>
                                <Tabs defaultActiveKey="1">
                                    <TabPane
                                        tab="已有标签"
                                        key="1"
                                    >
                                    {
                                        tags_list.length > 0 && tags_list.map((item, key) => {
                                            return (
                                                <Tag
                                                    key={key}
                                                    onClick={()=>{
                                                        this.addTag(item)
                                                    }}
                                                >{item}</Tag>
                                            )
                                        })
                                    }
                                    </TabPane>
                                    <TabPane
                                        tab="新建标签"
                                        key="2"
                                    >
                                        <div className="add_tags">
                                            新建标签：
                                            <Input
                                                value={this.state.tag}
                                                placeholder="请输入自定义标签"
                                                onChange={(e)=>{
                                                    this.setState({tag: e.target.value})
                                                }}
                                            />
                                            <Button
                                                onClick={this.addCustomTag}
                                            >添加</Button>
                                        </div>
                                    </TabPane>
                                </Tabs>
                                </div>
                            </div>
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
                            <Input.Search
                                placeholder="请输入网关序列号，名称，描述"
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
                            user={app_info.developer === user ? true : false}
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