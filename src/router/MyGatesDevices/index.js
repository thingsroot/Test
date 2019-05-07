import React, { Component } from 'react';
import { withRouter, Switch, Redirect, Link } from 'react-router-dom';
import Status from '../../common/status';
import LeftNav from '../../components/LeftNav';
import LoadableComponent from '../../utils/LoadableComponent';
import PrivateRoute from '../../components/PrivateRoute';
import './style.scss';
import http from '../../utils/Server';
import { inject, observer } from 'mobx-react';
import { Drawer, Button, Icon } from 'antd';
const GatesList = LoadableComponent(()=>import('./GatesList'));
const AppsList = LoadableComponent(()=>import('./AppsList'));
const LinkStatus = LoadableComponent(()=>import('./LinkStatus'));
const VPN  = LoadableComponent(()=>import('./VPN'));
const Vserial = LoadableComponent(()=>import('./Vserial'));
@withRouter
@inject('store')
@observer
class MyGatesDevices extends Component {
  state = {
    visible: false,
    flag: true,
    VPNflag: false,
    url: window.location.pathname
  }
  componentDidMount (){
    this.sendAjax(this.props.match.params.sn)
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
    }
  }
  sendAjax = (sn) => {
    // http.get('/api/gateways_read?name=' + sn).then(res=>{
    //   this.props.store.appStore.setStatus(res)
    // })
    http.get('/api/gateways_app_list?gateway=' + sn).then(res=>{
      if (Object.values(res.message).filter(item=> item.device_name === 'ioe_frpc').length > 0){
        this.setState({VPNflag: true})
      } else {
        this.setState({VPNflag: false})
      }
      this.props.store.appStore.setApplen(Object.keys(res.message).length);
    })
    http.get('/api/gateways_dev_len?gateway=' + sn).then(res=>{
      this.props.store.appStore.setDevlen(res.length);
    })
    http.get('/api/gateways_list').then(res=>{
      const online = [];
      res.message && res.message.length > 0 && res.message.map((v)=>{
          if (v.data.device_status === 'ONLINE'){
              online.push(v.data)
          }
      })
      this.props.store.appStore.setGatelist(online)
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
  setUrl = (sn) => {
    let arr = location.pathname.split('/');
    arr[2] = sn;
    return arr.join('/')
  }
    render () {
      const { flag } = this.state;
      const { path } = this.props.match;
      const { gateList, status } = this.props.store.appStore;
        return (
            <div >
                <Status flag={this.visible}/>
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
                  网关列表
                </Button>
                : ''
                  }
                  <Drawer
                      title="网关列表"
                      placement="left"
                      closable={false}
                      onClose={this.onClose}
                      visible={this.state.visible}
                  >
                  <ul>
                    {
                      gateList && gateList.length > 0 && gateList.map((v, i)=>{
                        return (
                        <Link key={i}
                            to={
                          this.setUrl(v.sn)
                        }
                        >
                            <li onClick={this.onClose}
                                className={status.sn === v.sn ? 'gateslist gateslistactive' : 'gateslist'}
                            >
                              <span></span>
                              <p>{v.dev_name}</p>
                            </li>
                        </Link>
                        )
                      })
                    }
                    </ul>
                  </Drawer>
                  <div className="mygateslist">
                    <Switch>
                      <PrivateRoute path={`${path}/GatesList`}
                          component={GatesList}
                      />
                      <PrivateRoute path={`${path}/AppsList`}
                          component={AppsList}
                      />
                      <PrivateRoute path={`${path}/LinkStatus`}
                          component={LinkStatus}
                      />
                      <PrivateRoute path={`${path}/VPN`}
                          component={VPN}
                      />
                      <PrivateRoute path={`${path}/Vserial`}
                          component={Vserial}
                      />
                      <Redirect from={path}
                          to={`${path}/GatesList`}
                      />
                    </Switch>
                  </div>
                </div>
            </div>
        );
    }
}
export default MyGatesDevices;