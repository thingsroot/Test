import React, { Component } from 'react';
import { Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import http from '../../utils/Server';
import './style.scss';
@withRouter
@inject('store') @observer
class LeftNav extends Component {
    state = {
        list: [
            {
                icon: 'table',
                text: '设备列表',
                href: '/GatesList'
            }, {
                icon: 'table',
                text: '应用列表',
                href: '/AppsList'
            }, {
                icon: 'table',
                text: '网关状态',
                href: '/LinkStatus'
            }
        ],
        index: 0
    }
    componentDidMount (){
        http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res.message)
          })
        const { pathname } = this.props.location;
        if (pathname.indexOf('/AppsList') !== -1){
            this.setState({
                index: 1
            });
        } else if (pathname.indexOf('/LinkStatus') !== -1){
            this.setState({
                index: 2
            });
        }
    }
    setIndex (key){
        this.setState({
            index: key
        })
    }
    render () {
        const { list, index } = this.state;
        const { url } = this.props.match;
        return (
            <div className="leftnav">
                <div className="navlist">
                    <p>基本功能</p>
                    <ul>
                        {
                            list.map((v, i)=>{
                                return (
                                    <Link to={`${url}${v.href}`}
                                        key={i}
                                        onClick={()=>{
                                        this.setIndex(i)
                                        }}
                                    ><li className={index === i ? 'active' : ''}>
                                    {
                                        v.href === '/GatesList' ? <div className="gatecount count">{this.props.store.appStore.devs_len}</div> : ''
                                    }
                                    {
                                        v.href === '/AppsList' ? <div className="appcount count">{this.props.store.appStore.apps_len}</div> : ''
                                    }
                                    <Icon type={v.icon}/>&nbsp;&nbsp;{v.text}</li></Link>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="navlist">
                    <p>扩展功能</p>
                    <ul>
                        {
                            this.props.vpnflag
                            ? <Link to={`${url}/VPN`}>
                            <li
                                className={index === 3 ? 'active' : ''}
                                key="3"
                                onClick={()=>{
                                    this.setState({index: 3})
                                }}
                            >VPN通道</li>
                        </Link>
                        : ''
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
export default LeftNav;