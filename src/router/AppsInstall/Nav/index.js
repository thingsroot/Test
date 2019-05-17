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
        // http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
        //   this.props.store.appStore.setStatus(res.message)
        // })
        http.get('/api/gateways_read?name=' + this.props.match.params.sn).then(res=>{
          this.props.store.appStore.setStatus(res)
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
        // http.get('/api/method/iot_ui.iot_api.devices_list?filter=online').then(res=>{
        //   this.props.store.appStore.setGatelist(res.message);
        // })
      };
      setUrl = (sn) => {
        let arr = location.pathname.split('/');
        arr[2] = sn;
        return arr.join('/')
      };

    setBeta = (sn)=>{
        http.get('/api/gateways_read?name=' + sn)
            .then(res=>{
                this.props.store.codeStore.setUserBeta(res.enable_beta);
            })
    };

    render () {
        const { gateList } = this.props.store.appStore;
        console.log(gateList);
        return (
            <div className="Nav">
                <ul>
                    <p>网关列表</p>
                    {
                      gateList && gateList.length > 0 && gateList.map((v, i)=>{
                        return (
                        <Link
                            key={i}
                            onClick={()=>{
                              this.setBeta(v.sn)
                            }}
                            to={
                              this.setUrl(v.sn)
                            }
                        >
                            <li onClick={this.onClose}
                                className={this.props.match.params.sn === v.sn ? 'gateslist gateslistactive' : 'gateslist'}
                            >
                              <span></span>
                              <p>{v.dev_name}</p>
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