import React, { Component } from 'react';
import http from '../../../utils/Server';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import './style.scss';
@withRouter
@inject('store') @observer
class Nav extends Component {
    state = {
        visible: false,
        url: window.location.pathname
      }
      componentDidMount (){
        this.sendAjax()
      }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.match.params.sn !== nextProps.match.params.sn){
            http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + nextProps.match.params.sn).then(res=>{
                this.props.store.appStore.setStatus(res.message)
              })
        }
    }
      sendAjax = () => {
        http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
          this.props.store.appStore.setStatus(res.message)
        })
        http.get('/api/method/iot_ui.iot_api.devices_list?filter=online').then(res=>{
          this.props.store.appStore.setGatelist(res.message);
        })
      }
      setUrl = (sn) => {
        let arr = location.pathname.split('/');
        arr[2] = sn
        return arr.join('/')
      }
    render () {
        const { gateList } = this.props.store.appStore;
        return (
            <div className="Nav">
                <ul>
                    <p>网关列表</p>
                    {
                      gateList && gateList.length > 0 && gateList.map((v, i)=>{
                        return (
                        <Link key={i}
                            to={
                          this.setUrl(v.device_sn)
                        }
                        >
                            <li onClick={this.onClose}
                                className={this.props.match.params.sn === v.device_sn ? 'gateslist gateslistactive' : 'gateslist'}
                            >
                              <span></span>
                              <p>{v.device_name}</p>
                            </li>
                        </Link>
                        )
                      })
                    }
                    </ul>
            </div>
        );
    }
}

export default Nav;