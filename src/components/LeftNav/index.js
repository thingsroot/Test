import React, { Component } from 'react';
import { Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
// import http from '../../utils/Server';
import './style.scss';

import {IconIOT} from '../../utils/iconfont';

@withRouter
@inject('store')
@observer
class LeftNav extends Component {
    state = {
        lognum: 0,
        commnum: 0,
        list: [
            {
                icon: 'gold',
                text: '设备列表',
                href: '/devices'
            }, {
                icon: 'appstore',
                text: '应用列表',
                href: '/apps'
            }, {
                icon: 'setting',
                text: '网关设置',
                href: '/settings'
            }
        ],
        index: 0
    }
    componentDidMount (){
        this.t1 = setInterval(() => {
            this.getNum()
        }, 500);
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('/devices') !== -1) {
            this.setState({
                index: 0
            })
        } else if (pathname.indexOf('/apps') !== -1){
            this.setState({
                index: 1
            });
        } else if (pathname.indexOf('/settings') !== -1){
            this.setState({
                index: 2
            });
        } else if (pathname.indexOf('/vpn') !== -1){
            this.setState({
                index: '4'
            });
        } else if (pathname.indexOf('/onlinerecords') !== -1){
            this.setState({
                index: 5
            })
        } else if (pathname.indexOf('/logs') !== -1){
            this.setState({
                index: 6
            })
        } else if (pathname.indexOf('/comms') !== -1){
            this.setState({
                index: 7
            })
        } else if (pathname.indexOf('/platformevents') !== -1){
            this.setState({
                index: 8
            })
        } else if (pathname.indexOf('/events') !== -1){
            this.setState({
                index: 9
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
    }
    setIndex (key){
        this.setState({
            index: key
        })
    }
    getNum (){
        this.setState({
            commnum: this.props.mqtt.comm_channel.NewArrived,
            lognum: this.props.mqtt.log_channel.NewArrived
        })
    }
    render () {
        const { list, index } = this.state;
        const { url } = this.props.match;
        const { gatewayInfo } = this.props.store;
        return (
            <div className="leftnav">
                <div className="navlist">
                    <p className="FeaturesGroup">基本功能</p>
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
                                        v.href.toLowerCase() === '/devices' ? <div className="gatecount count">{gatewayInfo.devices_count}</div> : ''
                                    }
                                    {
                                        v.href.toLowerCase() === '/apps' ? <div className="appcount count">{gatewayInfo.apps_count}</div> : ''
                                    }
                                    <Icon type={v.icon}/>&nbsp;&nbsp;{v.text}</li></Link>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="navlist">
                        <p className="FeaturesGroup">高级功能</p>
                        <ul>
                            <Link
                                to={`${url}/logs`}
                                onClick={()=>{
                                    this.setState({index: 6})
                                }}
                            >
                                <li
                                    className={index === 6 ? 'active' : ''}
                                >{this.state.lognum !== 0 ? <div className="logcount count">{this.state.lognum}</div> : ''}<Icon type="ordered-list"/>&nbsp;&nbsp;网关日志</li>
                            </Link>
                            <Link
                                to={`${url}/comms`}
                                onClick={()=>{
                                    this.setState({index: 7})
                                }}
                            >
                                <li
                                    className={index === 7 ? 'active' : ''}
                                >{this.state.commnum !== 0 ? <div className="logcount count">{this.state.commnum}</div> : ''}<Icon type="bars"/>&nbsp;&nbsp;网关报文</li>
                            </Link>
                            <Link
                                to={`${url}/platformevents`}
                                onClick={()=>{
                                    this.setState({index: 8})
                                }}
                            >
                                <li
                                    className={index === 8 ? 'active' : ''}
                                ><Icon type="bell"/>&nbsp;&nbsp;平台事件</li>
                            </Link>
                            <Link
                                to={`${url}/events`}
                                onClick={()=>{
                                    this.setState({index: 9})
                                }}
                            >
                                <li
                                    className={index === 9 ? 'active' : ''}
                                ><Icon type="message"/>&nbsp;&nbsp;设备事件</li>
                            </Link>
                            <Link
                                to={`${url}/onlinerecords`}
                                onClick={()=>{
                                    this.setState({index: 5})
                                }}
                            >
                                <li
                                    className={index === 5 ? 'active' : ''}
                                ><Icon type="exception"/>&nbsp;&nbsp;在线记录</li>
                            </Link>
                        </ul>
                </div>
                <div className="navlist">
                    <p className="FeaturesGroup">扩展功能</p>
                    <ul>
                        {
                            gatewayInfo.ioe_ser2net
                            ? <Link to={`${url}/vserial`}
                                key="4"
                                onClick={()=>{
                                this.setIndex('3')
                                }}
                              >
                                <li
                                    className={index === '3' ? 'active' : ''}
                                ><IconIOT type="icon-tiaoshi"/>&nbsp;&nbsp;远程编程-串口</li></Link>
                        : ''
                        }
                        {
                            gatewayInfo.ioe_frpc
                            ? <Link to={`${url}/VPN`}
                                key="4"
                                onClick={()=>{
                                    this.setIndex('4')
                                }}
                              >
                              <li className={index === '4' ? 'active' : ''}><IconIOT type="icon-tiaoshi"/>&nbsp;&nbsp;VPN通道</li></Link>
                            : ''
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
export default LeftNav;