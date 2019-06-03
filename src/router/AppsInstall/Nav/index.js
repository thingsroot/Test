import React, { Component } from 'react';
import http from '../../../utils/Server';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import './style.scss';
// import {Drawer} from "antd";
@withRouter
@inject('store')
@observer
class Nav extends Component {
    state = {
        visible: false,
        url: window.location.pathname
      };
    componentDidMount (){
        this.sendAjax()
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.match.params.sn !== nextProps.match.params.sn){
          http.get('/api/gateways_read?name=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res)
          })
        }
    }
      sendAjax = () => {
        http.get('/api/gateways_read?name=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res);
        });
        http.get('/api/gateway_list?status=online').then(res=>{
          const online = res.message;
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

    render () {
        // const { gateList } = this.props.store.appStore;
        const { gateList, status } = this.props.store.appStore;
        return (
        <ul>
            {
                gateList && gateList.length > 0 && gateList.map((v, i)=>{
                    return (
                        <Link
                            key={i}
                            to={
                                this.setUrl(v.sn)
                            }
                        >
                            <li onClick={this.onClose}
                                className={status.sn === v.sn ? 'gateslist gateslistactive' : 'gateslist'}
                            >
                                <span></span>
                                <p>{v.dev_name}(&nbsp;<i>{v.description}</i>&nbsp;)</p>
                            </li>
                        </Link>
                    )
                })
            }
        </ul>
        );
    }
}

export default Nav;