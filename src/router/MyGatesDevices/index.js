import React, { Component } from 'react';
import { withRouter, Switch, Redirect } from 'react-router-dom';
import Status from '../../common/status';
import LeftNav from '../../components/LeftNav';
import LoadableComponent from '../../utils/LoadableComponent';
import PrivateRoute from '../../components/PrivateRoute';
import './style.scss';
import http from '../../utils/Server';
import { inject, observer } from 'mobx-react';
import { Button, Icon } from 'antd';
const GatesList = LoadableComponent(()=>import('./GatesList'));
const AppsList = LoadableComponent(()=>import('./AppsList'));
const Setgateway = LoadableComponent(()=>import('./Setgateway'));
const VPN  = LoadableComponent(()=>import('./VPN'));
const Vserial = LoadableComponent(()=>import('./Vserial'));
const GatewayRecord = LoadableComponent(()=>import('./GatewayRecord'));
const Logviewer = LoadableComponent(()=>import('./MyGatesLogviewer'));
const Comm = LoadableComponent(()=>import('./MyGatesComm'));
const Appconfig = LoadableComponent(()=>import('../AppsInstall/AppConfig'));
const Platformevent = LoadableComponent(()=>import('../PlatformMessage'));
const Devicesevent = LoadableComponent(()=>import('../DeviceMessage'));
const GatewaysDrawer = LoadableComponent(()=>import('../AppsInstall/GatewaysDrawer'));
@withRouter
@inject('store')
@observer
class MyGatesDevices extends Component {
    state = {
        gateway: '',
        visible: false,
        flag: true,
        VPNflag: false,
        url: window.location.pathname
    }
    componentDidMount (){
        this.sendAjax(this.props.match.params.sn)
        this.setState({gateway: this.props.match.params.sn})
        this.props.store.timer.setGateStatusLast(0)
        if (this.props.location.pathname.indexOf('VPN') !== -1){
            this.setState({flag: false})
        } else {
            this.setState({flag: true})
        }
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname.indexOf('VPN') !== -1){
            this.setState({flag: false})
        } else {
            this.setState({flag: true})
        }
        if (this.props.match.params.sn !== nextProps.match.params.sn){
            this.sendAjax(nextProps.match.params.sn)
            this.setState({gateway: this.props.match.params.sn})
            this.props.store.timer.setGateStatusLast(0)
        }
    }
    sendAjax = (sn) => {
        // http.get('/api/gateways_read?name=' + sn).then(res=>{
        //   this.props.store.appStore.setStatus(res)
        // })
        http.get('/api/gateways_app_list?gateway=' + sn).then(res=>{
            if (Object.values(res.data).filter(item=> item.device_name === 'ioe_frpc').length > 0){
                this.setState({VPNflag: true})
            } else {
                this.setState({VPNflag: false})
            }
            this.props.store.appStore.setApplen(Object.keys(res.data).length);
        })
        http.get('/api/gateways_dev_len?gateway=' + sn).then(res=>{
            this.props.store.appStore.setDevlen(res.length);
        })
    }
    showDrawer = () => {
        this.setState({
            visible: true
        })
    }
    onClose = () => {
        this.setState({
            visible: false
        })
    }
    // setUrl = (sn) => {
    //   let arr = location.pathname.split('/');
    //   arr[2] = sn;
    //   return arr.join('/')
    // }
    render () {
      const { flag } = this.state;
      const { path } = this.props.match;
      // const { gateList, status } = this.props.store.appStore;
        return (
            <div>
                <Status gateway={this.state.gateway}/>
                    <div className="mygatesdevices">
                        <LeftNav
                            prop={this.props.match.params}
                            vpnflag={this.state.VPNflag}
                        />
                        {
                            flag
                            ? <Button type="primary"
                                onClick={this.showDrawer}
                                className="listbutton"
                              >
                                <Icon type="swap"/><br />
                            </Button>
                            : ''
                        }
                    <GatewaysDrawer
                        onClose={this.onClose}
                        visible={this.state.visible}
                    />
                    <div className="mygateslist">
                      <Switch>
                        <PrivateRoute path={`${path}/gateslist`}
                            component={GatesList}
                            title="我的网关·设备列表"
                        />
                        <PrivateRoute path={`${path}/appslist`}
                            component={AppsList}
                            title="我的网关·应用列表"
                        />
                        <PrivateRoute path={`${path}/setgateway`}
                            component={Setgateway}
                            title="我的网关·网关设置"
                        />
                        <PrivateRoute path={`${path}/vpn`}
                            component={VPN}
                            title="我的网关·vpn通道"
                        />
                        <PrivateRoute path={`${path}/vserial`}
                            component={Vserial}
                            title="我的网关·虚拟串口"
                        />
                        <PrivateRoute path={`${path}/gatewayrecord`}
                            component={GatewayRecord}
                            title="我的网关·在线记录"
                        />
                        <PrivateRoute path={`${path}/logviewer`}
                            component={Logviewer}
                            title="我的网关·日志"
                        />
                        <PrivateRoute path={`${path}/message`}
                            component={Comm}
                            title="我的网关·报文"
                        />
                        <PrivateRoute path={`${path}/platformevent`}
                            component={Platformevent}
                            title="我的网关·平台事件"
                        />
                        <PrivateRoute path={`${path}/devicesevent`}
                            component={Devicesevent}
                            title="我的网关·设备事件"
                        />
                        <PrivateRoute path="/mygatesdevices/appconfig"
                            component={Appconfig}
                            title="我的网关·应用配置"
                        />
                        <Redirect from={path}
                            to={`${path}/gateslist`}
                        />
                      </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
export default MyGatesDevices;