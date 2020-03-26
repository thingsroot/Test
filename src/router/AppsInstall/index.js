import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';     //
import {Input, Icon, Button, message, notification, Rate, Modal, Tag } from 'antd';  //
import { inject, observer} from 'mobx-react';
import GatewayStatus from '../../common/GatewayStatus';
import http from '../../utils/Server';
import Editor from 'for-editor'
import './style.scss';
import GatewaysDrawer from '../../common/GatewaysDrawer';
import AppConfig from './AppConfig'
import LazyLoad from 'react-lazy-load';
import {ConfigStore} from '../../utils/ConfigUI'

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
        gateway_sn: '',
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
        installing: false,
        configStore: new ConfigStore(),
        showLinkSelection: false
    };

    componentDidMount (){
        let app = this.props.match.params.app ? this.props.match.params.app.replace(/\*/g, '/') : ''
        let gateway_sn = this.props.match.params.sn;
        let install_step = this.props.match.params.step ? this.props.match.params.step : ''
        if (this.props.match.params.app !== undefined && install_step === '') {
            install_step = 'view'
        }

        this.setState({
            app: app,
            install_step: install_step,
            installing: false,
            gateway_sn: gateway_sn
        }, () => {
            if (install_step === 'install') {
                http.get('/api/applications_details?name=' + this.state.app).then(res=>{
                    if (res.ok) {
                        this.setState({app_info: res.data})
                    }
                })
            } else {
               this.fetchStoreApps()
            }
        })
    }
    fetchStoreApps () {
        http.get('/api/store_list').then(res=>{
            if (res.ok) {
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
            }
        });
    }

    searchApp (value){
        this.inputFilterTimer && clearTimeout(this.inputFilterTimer)
        this.inputFilterTimer = setTimeout(()=>{
            let { app_list } = this.state;
            let newdata = [];
            newdata = app_list.filter((item)=>item.app_name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
            this.setState({
                app_show: newdata
            })
        }, 200)
    }

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
    installLatestVersion = (app, sn, inst_name, configuration)=>{
        let url = ''
        const {gatewayInfo} = this.props.store
        let enable_beta = gatewayInfo.data.enable_beta
        if (enable_beta === 1) {
            url = '/api/applications_versions_latest?beta=1&app=';
        } else {
            url = '/api/applications_versions_latest?app=';
        }
        let version = 0;
        http.get(url + app).then(res=> {
           if (res.ok) {
            version = res.data;
            if (version > 0) {
                if (enable_beta === 1) {
                    message.success(`网关安装当前应用最新beta版本[${version}]!`);
                } else {
                    message.success(`网关安装当前应用最新版本[${version}]!`);
                }

                let params = {
                    gateway: sn,
                    inst: inst_name,
                    app: app,
                    version: version,
                    conf: configuration,
                    id: 'app_install/' + sn + '/' + inst_name + '/' + app + '/' + this.rand(10000, 99999)
                };
                this.appInstall(params, sn)
            } else {
                message.error('应用暂时没有版本，无法安装！');
                this.setState({ installing: false })
            }
           }
        }).catch(err=> {
            err;
            message.error('安装应用最新版本失败!')
            this.setState({ installing: false })
        })
    };

    //安装应用
    appInstall = (params, sn)=>{
        http.post('/api/gateways_applications_install', params).then(res=>{
            openNotification('提交任务成功', '网关' + sn + '安装' + params.inst + '应用.')
            if (res.ok === true) {
                let info = {
                    gateway: sn,
                    params: params
                }
                this.props.store.action.pushAction(res.data, '网关' + sn + '安装应用' + params.inst, '', info, 30000,  (result)=> {
                    if (result) {
                        this.setState({ showLinkSelection: true, installing: false })
                    } else {
                        this.setState({ installing: false });
                    }
                })
            } else {
                this.setState({ installing: false });
                openNotification('安装应用' + this.refs.inst.value + '失败', '' + res.data.message);
            }
        }).catch( (err)=> {
            err;
            openNotification('提交任务失败', '网关' + sn + '安装' + params.inst + '应用.')
            this.setState({ installing: false });
        })
    };

    //判断是否已有实例名
    checkInstanceName =  (sn, inst_name) => new Promise((resolve, reject) => {
        http.get('/api/gateways_applications_list?gateway=' + sn).then(res=> {
            if (res.ok === true) {
                let names = Object.keys(res.data);
                let fond_dumplicate = false
                names && names.length > 0 && names.map(item => {
                    if (item === inst_name) {
                        fond_dumplicate = true
                    }
                })
                if (!fond_dumplicate) {
                    resolve()
                } else {
                    reject('实例名重复')
                }
            }
        }).catch(err=> {
            reject(err)
        });
    });

    onInstallSubmit = (inst_name, app_info, configuration)=>{
        if (inst_name === '' || inst_name === undefined) {
            message.error('实例名不能为空！');
            return;
        } else {
            this.setState({
                installing: true
            });
            //判断实例名是否存在
            this.checkInstanceName(this.state.gateway_sn, inst_name).then(()=>{
                this.installLatestVersion(app_info.name, this.state.gateway_sn, inst_name, configuration)
            }).catch(err=>{
                message.error(err)
                this.setState({ installing: false });
            });
        }
    };
    onInstallCancel = ()=>{
        this.setState({install_step: '', showLinkSelection: false})
        if (this.state.app_list === undefined || this.state.app_list.length === 0) {
            this.fetchStoreApps()
        }
    }

    onClose = () => {
        this.setState({
            gateway_list_visible: false,
			installing: false
        })
    };

    showDrawer = () => {
        this.setState({
            gateway_list_visible: true
        })
    };
    onChangeGateway = () => {
        this.componentDidMount()
    }

    render () {
        const preview = true;
        const { gateway_sn, app_show, install_step, app_inst, app_info, showLinkSelection } = this.state;
        return (<div>
            <GatewayStatus gateway={gateway_sn}/>
                <div className="AppInstall">
                    <Button
                        type="primary"
                        onClick={this.showDrawer}
                        className="listbutton"
                    >
                        <Icon type="swap"/><br />
                    </Button>
                    <GatewaysDrawer
                        gateway={gateway_sn}
                        onClose={this.onClose}
                        onChange={this.onChangeGateway}
                        visible={this.state.gateway_list_visible}
                    />
                    <Modal
                        visible={showLinkSelection}
                        title="快捷选择"
                        closable={false}
                        keyboard
                        wrapClassName={'linkSelectionWeb'}
                        onCancel={()=>{
                            this.setState({install_step: 'view', showLinkSelection: false})
                        }}
                    >
                        <ul className="linkSelection">
                            <li
                                onClick={()=>{
                                    this.setState({
                                        gateway_list_visible: true,
                                        showLinkSelection: false
                                    })
                                }}
                            >
                                <Icon type="laptop" />
                                安装到其他网关
                            </li>
                            <li
                                onClick={this.onInstallCancel}
                            >
                                <Icon type="download" />
                                继续安装其他应用
                            </li>
                            <li
                                onClick={()=>{
                                    window.location.href = `/gateway/${gateway_sn}/apps`
                                }}
                            >
                                <Icon type="appstore" />
                                查看应用列表
                            </li>
                            <li
                                onClick={()=>{
                                    window.location.href = `/gateway/${gateway_sn}/devices`
                                }}
                            >
                                <Icon type="unordered-list" />
                                查看设备列表
                            </li>
                        </ul>

                    </Modal>
                    <div className={install_step === '' ? 'hide appsdetail' : 'show appsdetail'}>
                        <Button
                            style={{position: 'absolute', right: '205px', top: '10px', zIndex: '999'}}
                            icon="question-circle"
                            onClick={()=>{
                                window.open('https://wiki.freeioe.org/doku.php?id=apps:' + app_info.name, '_blank')
                            }}
                        >帮助</Button>
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
                                    if (this.state.app_list === undefined || this.state.app_list.length === 0) {
                                        this.fetchStoreApps()
                                    }
                                }}
                            />
                        </Link>
                        <h2 style={{borderBottom: '1px solid #ccc', padding: 10}}>安装 {app_info.app_name} 到 {this.state.gateway_sn}</h2>
                        <div className={install_step !== 'install' ? 'show' : 'hide'}>
                            <div style={{display: 'flex' }}>
                                {
                                    app_info.icon_image
                                    ? <img src={'/store_assets' + app_info.icon_image}
                                        alt=""
                                        style={{width: 128, height: 128}}
                                      />
                                    : ''
                                }
                                <div style={{display: 'flex', paddingTop: 20, paddingLeft: 20}}>
                                    <div style={{width: 500}}
                                        className="detail"
                                    >
                                        <p>发布者： {app_info.user_info && app_info.user_info.dev_name}</p>
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
                                <Editor
                                    preview={preview}
                                    value={app_info && app_info.description && app_info.description}
                                    toolbar={false}
                                />
                            </div>
                        </div>
                        <div className={install_step !== 'install' ? 'installapp hide' : 'installapp show'}>
                            {
                                install_step === 'install'
                                ? <AppConfig
                                    gateway_sn={gateway_sn}
                                    configStore={this.state.configStore}
                                    app_inst={app_inst}
                                    inst_editable
                                    disabled={this.state.installing}
                                    app_info={app_info}
                                    onSubmit={this.onInstallSubmit}
                                    onCancel={this.onInstallCancel}
                                  />
                                : ''
                            }
                        </div>
                    </div>
                    <div className={install_step === '' ? 'show' : 'hide'}>
                        <div className="installheader">
                           <div className="searchlist">
                               <Search
                                   key="33"
                                   placeholder="搜索应用名"
                                   onChange={(e)=>{
                                       this.searchApp(e.target.value)
                                   }}
                                   style={{ width: 200, marginRight: 80}}
                               />
                               <Icon
                                   className="rollback"
                                   type="rollback"
                                   onClick={()=>{
                                       window.location.href = localStorage.getItem('url')
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
                                                <span className="price">免费</span>
                                                <Link
                                                    to={
                                                        this.setUrl(val.name)
                                                    }
                                                >
                                                    <img
                                                        src={`/store_assets${val.icon_image}`}
                                                        alt="logo"
                                                        onClick={()=>{
                                                            this.setState({
                                                                install_step: 'view',
                                                                app_info: {...val}
                                                            })
                                                        }}
                                                    />
                                                </Link>
                                                <div className="apptitle">
                                                    <p>{val.app_name}</p>
                                                    <span>{val.user_info.dev_name}</span>
                                                    <div className="app_footer">
                                                        <div className="app_footer_tags">
                                                            {
                                                                val.tags && val.tags.split(',').length > 0 && val.tags.split(',').map((item, key)=>{
                                                                    return (
                                                                        <Tag
                                                                            color="gold"
                                                                            key={key}
                                                                        >{item}</Tag>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                        <div className="app_footer_rate">
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
