import React, { Component } from 'react';
import { withRouter, Switch, Redirect } from 'react-router-dom';
import GatewayStatus from '../../common/GatewayStatus';
import LeftNav from '../../components/LeftNav';
import LoadableComponent from '../../utils/LoadableComponent';
import GatewayRoute from '../../components/GatewayRoute';
import './style.scss';
import http from '../../utils/Server';
import { inject, observer } from 'mobx-react';
import { Button, Icon, message, Modal } from 'antd';
import GatewayMQTT from '../../utils/GatewayMQTT';
import intl from 'react-intl-universal';

const DeviceList = LoadableComponent(()=>import('./DeviceList'));
const AppsList = LoadableComponent(()=>import('./AppsList'));
const Settings = LoadableComponent(()=>import('./Settings'));
const Vnet  = LoadableComponent(()=>import('./Vnet'));
const Vserial = LoadableComponent(()=>import('./Vserial'));
const OnlineRecords = LoadableComponent(()=>import('./OnlineRecords'));
const Logviewer = LoadableComponent(()=>import('./Logviewer'));
const Comm = LoadableComponent(()=>import('./CommViewer'));
const Appconfig = LoadableComponent(()=>import('../AppsInstall/AppConfig'));
const PlatformEvents = LoadableComponent(()=>import('./PlatformEvents'));
const DeviceEvents = LoadableComponent(()=>import('./DeviceEvents'));
const GatewaysDrawer = LoadableComponent(()=>import('../../common/GatewaysDrawer'));
const Networkconfig  = LoadableComponent(()=>import('./NetworkConfig'));

@withRouter
@inject('store')
@observer
class MyGatesDevices extends Component {
    constructor (props){
        super(props);
        this.data_len = 0
        this.timer = null
        this.state = {
            gateway: '',
            visible: false,
            url: window.location.pathname,
            mqtt: new GatewayMQTT(),
            warning: true
        }
    }
    componentDidMount (){
        this.setState({gateway: this.props.match.params.sn}, ()=>{
            this.props.store.timer.setGateStatusLast(0)
            this.fetch()
            clearInterval(this.timer)
            this.timer = setInterval(() => this.fetch(), 10000)
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.match.params.sn !== nextProps.match.params.sn &&
            this.state.gateway !== nextProps.match.params.sn){
            this.setState({gateway: nextProps.match.params.sn}, ()=>{
                this.state.mqtt.disconnect(true)
                this.props.store.timer.setGateStatusLast(0)
                this.fetch()
                clearInterval(this.timer)
                this.timer = setInterval(() => this.fetch(), 10000)
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    warning = () => {
        this.setState({
            warning: false
        })
        const $this = this;
            Modal.warning({
                title: intl.get('gateway.App_does_not_exist_or_is_not_running'),
                content: intl.get('gateway.The_device_app_does_not_exist_or_is_not_running'),
                onOk (){
                  $this.props.history.push('/gateway/' + $this.props.match.params.sn + '/apps')
                }
              })
      }
    fetch = () => {
        const {gateway} = this.state;
        if (gateway === undefined || gateway === '') {
            return;
        }
        const {gatewayInfo} = this.props.store;
        if (!gatewayInfo.apps_is_show) {
            http.get('/api/gateways_app_list?gateway=' + gateway).then(res=>{
                if (res.ok) {
                    gatewayInfo.setApps(res.data);
                    const { pathname } = this.props.location;
                    res.data && res.data.length > 0 && res.data.map(item=>{
                        if (item.name === 'APP00000377' && item.status !== 'running' && pathname.indexOf('vserial') !== -1) {
                            if (this.state.warning) {
                                this.warning()
                            }
                        }
                        if (item.name === 'APP00000135' && item.status !== 'running' && pathname.indexOf('vnet') !== -1) {
                            if (this.state.warning) {
                                this.warning()
                            }
                        }
                    })
                } else {
                    message.error(res.error)
                }
            })
        }
        if (!gatewayInfo.devices_is_show) {
            http.get('/api/gateways_dev_list?gateway=' + gateway).then(res=>{
                if (res.ok) {
                    gatewayInfo.setDevices(res.data)
                } else {
                    message.error(res.error)
                }
            })
        }
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
    render () {
      const { path } = this.props.match;
      const { pathname } = this.props.location;
      const {gatewayInfo} = this.props.store;
        return (
            <div>
                <GatewayStatus gateway={this.state.gateway}/>
                    <div className="mygatesdevices">
                        <LeftNav
                            prop={this.props.match.params}
                            gateway={this.state.gateway}
                            mqtt={this.state.mqtt}
                        />
                        {
                            pathname.indexOf('vnet') === -1 && pathname.indexOf('vserial') === -1 && pathname.indexOf('networkconfig') === -1
                            ? <Button type="primary"
                                onClick={this.showDrawer}
                                className="listbutton"
                              >
                                <Icon type="swap"/><br />
                            </Button>
                        : ''
                        }
                    <GatewaysDrawer
                        gateway={this.state.gateway}
                        onClose={this.onClose}
                        visible={this.state.visible}
                    />
                    <div className="mygateslist">
                      <Switch>
                        <GatewayRoute path={`${path}/devices`}
                            component={DeviceList}
                            title={intl.get('gateway.my_gateway_device_list')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/apps`}
                            component={AppsList}
                            title={intl.get('gateway.my_gateway_application_list')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/settings`}
                            component={Settings}
                            title={intl.get('gateway.my_gateway_gateway_settings')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/vnet`}
                            component={Vnet}
                            title={intl.get('gateway.my_gateway_remote_programming_network')}
                            gateway={this.state.gateway}
                            mqtt={this.state.mqtt}
                            gatewayInfo={gatewayInfo}
                        />
                        <GatewayRoute path={`${path}/vserial`}
                            component={Vserial}
                            title={intl.get('gateway.my_gateway_virtual_serial_port')}
                            gateway={this.state.gateway}
                            mqtt={this.state.mqtt}
                            gatewayInfo={gatewayInfo}
                        />
                        <GatewayRoute path={`${path}/onlinerecords`}
                            component={OnlineRecords}
                            title={intl.get('gateway.my_gateway_online record')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/logs`}
                            component={Logviewer}
                            title={intl.get('gateway.my_gateway_log')}
                            mqtt={this.state.mqtt}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/comms`}
                            component={Comm}
                            title={intl.get('gateway.my_gateway_message')}
                            mqtt={this.state.mqtt}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/platformevents`}
                            component={PlatformEvents}
                            title={intl.get('gateway.my_gateway_platform_event')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/events`}
                            component={DeviceEvents}
                            title={intl.get('gateway.my_gateway_device_events')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path="/gateways/appconfig"
                            component={Appconfig}
                            title={intl.get('gateway.my_gateway_application_configuration')}
                            gateway={this.state.gateway}
                        />
                        <GatewayRoute path={`${path}/networkconfig`}
                            component={Networkconfig}
                            title={intl.get('gateway.my_gateway_network_configuration')}
                            gateway={this.state.gateway}
                        />
                        <Redirect from={path}
                            to={`${path}/devices`}
                        />
                      </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
export default MyGatesDevices;