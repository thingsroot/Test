import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';     //
import {Input, Icon, Button, message, notification, Rate, Drawer } from 'antd';  //
import { inject, observer} from 'mobx-react';
import Status from '../../common/status';
import http from '../../utils/Server';
import marked from 'marked';
import highlight from 'highlight.js';
import 'highlight.js/styles/github.css';
import './style.scss';
import Nav from './Nav';
import AppConfig from './AppConfig'
import LazyLoad from 'react-lazy-load';
import {ConfigStore} from '../../utils/app_config'

const Search = Input.Search;
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};

@withRouter
@inject('store')
@observer
class MyGatesAppsInstall extends Component {
    state = {
        app: '',
        app_list: [],
        app_show: [],
        install_step: '', // Install step
        app_info: {},
        filter: {
            ventor: '',
            agreement: '',
            type: ''
        },
        config: [],
        gateway_list_visible: false,
        install_btn_disabled: false,
        configStore: new ConfigStore()
    };

    componentDidMount (){
        let app = this.props.match.params.app ? this.props.match.params.app : ''
        let install_step = this.props.match.params.step ? this.props.match.params.step : ''
        if (this.props.match.params.app !== undefined && install_step === '') {
            install_step = 'view'
        }

        this.setState({app: app, install_step: install_step})
        if (install_step === 'install') {
            http.get('/api/applications_details?name=' + this.props.match.params.app).then(res=>{
                this.setState({app_info: res.data})
            })
        } else {
            http.get('/api/store_list').then(res=>{
                this.setState({
                    app_list: res.data,
                    app_show: res.data
                })
                if (this.state.app && this.state.install_step === 'view') {
                    let item = res.data.find(item => item.name === this.state.app)
                    if (item) {
                        this.setState({
                            app_info: item
                        })
                    }
                }
            });
            marked.setOptions({
                renderer: new marked.Renderer(),
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                xhtml: false,
                highlight: (code) =>  highlight.highlightAuto(code).value // 这段代码
            });
        }
    }

    // shouldComponentUpdate (nextProps, nextState){
    //     if (nextState.item.description && nextState.item.description !== null){
    //         document.getElementById('box').innerHTML = marked(nextState.item.description)
    //     }
    //     return true;
    // }

    searchApp (value){
        let { app_list } = this.state;
        let newdata = [];
        newdata = app_list.filter((item)=>item.app_name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        this.setState({
            app_show: newdata
        })
    }

    onChange = (newValue)=>{
        this.props.store.codeStore.setInstallConfiguration(newValue)
    };

    setUrl = (name, step) => {
        let arr = location.pathname.split('/');
        if (name === undefined) {
            arr.splice(3)
            return arr.join('/')
        }
        arr[3] = name;
        if (step && step.length > 0) {
            arr[4] = step
        }
        return arr.join('/')
    };

    //随机数
    rand = (min, max)=>{
        return Math.floor(Math.random() * (max - min)) + min;
    };

    //获取版本
    getLast = (url, app, sn)=>{
        let version = 0;
        http.get(url + app).then(res=> {
            version = res.data;
            if (version > 0) {
                if (url.indexOf('beta') !== -1) {
                    message.success('网关安装当前应用最新beta版本!');
                }
                let params = {
                    gateway: sn,
                    inst: this.props.store.codeStore.instNames,
                    app: app,
                    version: version,
                    conf: JSON.parse(this.props.store.codeStore.installConfiguration),
                    id: 'app_install/' + sn + '/' + this.props.store.codeStore.instNames + '/' + app + '/' + this.rand(10000, 99999)
                };
                this.appInstall(params, sn)
            } else {
                message.error('应用暂时没有版本，无法安装！');
                this.setState({
                    install_btn_disabled: false
                })
            }
        })
    };

    //安装应用
    appInstall = (params, sn)=>{
        http.post('/api/gateways_applications_install', params).then(res=>{
            openNotification('提交任务成功', '网关' + sn + '安装' + this.props.store.codeStore.instNames + '应用.')
            this.setState({
                install_btn_disabled: false
            });
            if (res.ok === true) {
                let info = {
                    gateway: sn,
                    inst: this.props.store.codeStore.instNames,
                    params: params
                }
                this.props.store.action.pushAction(res.data, '安装应用' + this.props.store.codeStore.instNames, '', info, 10000,  ()=> {
                    this.setState({
                        install_step: ''
                    })
                })
            } else {
                openNotification('安装应用' + this.refs.inst.value + '失败', '' + res.data.message);
            }
        }).catch( (err)=> {
            err;
            openNotification('提交任务失败', '网关' + sn + '安装' + this.props.store.codeStore.instNames + '应用.')
            this.setState({
                install_btn_disabled: false
            });
        })
    };

    //判断是否已有实例名
    isInst =  sn => new Promise((resolve => {
        http.get('/api/gateways_applications_list?gateway=' + sn).then(res=> {
            if (res.ok === true) {
                let names = Object.keys(res.data);
                names && names.length > 0 && names.map(item => {
                    if (item === this.props.store.codeStore.instNames) {
                        resolve(true);
                    }
                    resolve(false)
                })
            }
        });
    }));

    submitData = ()=>{
        let sn = this.props.match.params.sn;
        let app = this.props.match.params.app;
        let url = '';
        this.setState({
            install_btn_disabled: true
        });
        if (this.props.store.codeStore.instNames === '' || this.props.store.codeStore.instNames === undefined) {
            message.error('实例名不能为空！');
            return;
        } else {
            //判断实例名是否存在
            this.isInst(sn).then(data=>{
                console.log(data);
                if (data) {
                    message.error('实例名已存在！');
                } else {
                    http.get('/api/gateways_read?name=' + sn).then(res=>{
                        if (res.enable_beta === 1) {
                            url = '/api/applications_versions_latest?beta=1&app=';
                            this.getLast(url, app, sn)
                        } else {
                            url = '/api/applications_versions_latest?app=';
                            this.getLast(url, app, sn)
                        }
                    })
                }
            });
        }
    };

    onClose = () => {
        this.setState({
            gateway_list_visible: false,
			install_btn_disabled: false
        })
    };

    showDrawer = () => {
        this.setState({
            gateway_list_visible: true
        })
    };

    render () {
        const { app_show, install_step, app_info, app } = this.state;
        return (<div>
            <Status />
                <div className="AppInstall">
                    <Button
                        type="primary"
                        onClick={this.showDrawer}
                        className="listbutton"
                    >
                        <Icon type="swap"/><br />
                    </Button>
                    <Drawer
                        title="网关列表"
                        placement="left"
                        closable={false}
                        onClose={this.onClose}
                        visible={this.state.gateway_list_visible}
                        width="400"
                    >
                        <Nav> </Nav>
                    </Drawer>
                    <div className={install_step === '' ? 'hide appsdetail' : 'show appsdetail'}>
                    <Button
                        className="installbtn"
                        type="primary"
                        onClick={()=>{
                            if (install_step === 'install') {
                                this.setState({install_step: 'view'})
                            } else {
                                this.setState({install_step: 'install'})
                            }
                        }}
                    >
                        {
                            install_step === 'install' ? '查看应用描述' : '安装到网关'
                        }
                    </Button>
                        <Link
                            to={
                                this.setUrl()
                            }
                        >
                            <Icon
                                type="rollback"
                                className="back"
                                onClick={()=>{
                                    this.setState({
                                        install_step: ''
                                    })
                                }}
                            />
                        </Link>
                        <h2 style={{borderBottom: '1px solid #ccc', padding: 10}}>{app_info.app_name}</h2>
                        <div className={install_step !== 'install' ? 'show' : 'hide'}>
                            <div style={{display: 'flex' }}>
                                {
                                    app_info.icon_image
                                    ? <img src={'http://ioe.thingsroot.com/' + app_info.icon_image}
                                        alt=""
                                        style={{width: 128, height: 128}}
                                      />
                                    : ''
                                }
                                <div style={{display: 'flex', paddingTop: 20, paddingLeft: 20}}>
                                    <div style={{width: 500}}
                                        className="detail"
                                    >
                                        <p>发布者： {app_info.app_name_unique}</p>
                                        <p>通讯协议: {app_info.protocol}</p>
                                        <p>适配型号： {app_info.device_serial}</p>
                                    </div>
                                    <div  className="detail">
                                        <p>应用分类： {app_info.category}</p>
                                        <p>设备厂家: {app_info.device_supplier}</p>
                                        <p>应用价格： 免费</p>
                                    </div>
                                </div>
                            </div>
                            <div
                                id="box"
                                style={{marginTop: 20}}
                            >
                                markdown
                            </div>
                        </div>
                        <div className={install_step !== 'install' ? 'installapp hide' : 'installapp show'}>
                            <AppConfig
                                app={app}
                                app_info={app_info}
                                submitData={this.submitData}
                                configStore={this.state.configStore}
                                refreshTemplateList={this.refreshTemplateList}
                            />
                        </div>
                    </div>
                    <div className={install_step === '' ? 'show' : 'hide'}>
                        <div className="installheader">
                           <div className="searchlist">
                               <Search
                                   key="33"
                                   placeholder="搜索应用名"
                                   onSearch={(value)=>{
                                       this.searchApp(value)
                                   }}
                                   style={{ width: 200, marginRight: 80}}
                               />
                               <Icon
                                   className="rollback"
                                   type="rollback"
                                   onClick={()=>{
                                       this.props.history.go(-1)
                                   }}
                               />
                           </div>
                       </div>
                        <div className="installcontent">
                            {
                                app_show && app_show.length > 0 && app_show.map((val, ind)=>{
                                    return (
                                        <LazyLoad
                                            key={ind}
                                            offsetTop={100}
                                        >
                                            <div
                                                className="item"
                                            >
                                                <Link
                                                    to={
                                                        this.setUrl(val.name)
                                                    }
                                                >
                                                    <img
                                                        src={`http://ioe.thingsroot.com/${val.icon_image}`}
                                                        alt="logo"
                                                        onClick={()=>{
                                                            this.setState({
                                                                install_step: 'view',
                                                                app_info: val
                                                            })
                                                        }}
                                                    />
                                                </Link>
                                                <div className="apptitle">
                                                    <p>{val.app_name}</p>
                                                    <div>
                                                        <Rate
                                                            disabled
                                                            defaultValue={val.star}
                                                            size="small"
                                                        />
                                                        <span onClick={()=>{
                                                            this.setState({
                                                                install_step: 'install',
                                                                app_info: val
                                                            })
                                                        }}
                                                        >
                                                            <Link
                                                                to={
                                                                    this.setUrl(val.name, 'install')
                                                                }
                                                            >
                                                                <Icon
                                                                    type="cloud-download"
                                                                />
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </LazyLoad>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MyGatesAppsInstall;
