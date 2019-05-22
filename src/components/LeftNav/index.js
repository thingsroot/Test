import React, { Component } from 'react';
import { Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
// import http from '../../utils/Server';
import './style.scss';
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1163855_qf16uefhcsb.js'
})
@withRouter
@inject('store')
@observer
class LeftNav extends Component {
    state = {
        list: [
            {
                icon: 'profile',
                text: '设备列表',
                href: '/gateslist'
            }, {
                icon: 'appstore',
                text: '应用列表',
                href: '/appslist'
            }, {
                icon: 'database',
                text: '网关设置',
                href: '/setgateway'
            }
        ],
        index: 0
    }
    componentDidMount (){
        // http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
        //     this.props.store.appStore.setStatus(res.message)
        //   })
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('/gateslist') !== -1) {
            this.setState({
                index: 0
            })
        } else if (pathname.indexOf('/appslist') !== -1){
            this.setState({
                index: 1
            });
        } else if (pathname.indexOf('/setgateway') !== -1){
            this.setState({
                index: 2
            });
        } else if (pathname.indexOf('/vpn') !== -1){
            this.setState({
                index: '4'
            });
        } else if (pathname.indexOf('/gatewayrecord') !== -1){
            this.setState({
                index: 5
            })
        } else if (pathname.indexOf('/logviewer') !== -1){
            this.setState({
                index: 6
            })
        } else if (pathname.indexOf('/message') !== -1){
            this.setState({
                index: 7
            })
        } else if (pathname.indexOf('/platformevent') !== -1){
            this.setState({
                index: 8
            })
        } else if (pathname.indexOf('/devicesevent') !== -1){
            this.setState({
                index: 9
            })
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
                                        v.href.toLowerCase() === '/gateslist' ? <div className="gatecount count">{this.props.store.appStore.devs_len}</div> : ''
                                    }
                                    {
                                        v.href.toLowerCase() === '/appslist' ? <div className="appcount count">{this.props.store.appStore.apps_len}</div> : ''
                                    }
                                    <Icon type={v.icon}/>&nbsp;&nbsp;{v.text}</li></Link>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="navlist">
                        <p>高级功能</p>
                        <ul>
                            <Link
                                to={`${url}/gatewayrecord`}
                                onClick={()=>{
                                    this.setState({index: 5})
                                }}
                            >
                                <li
                                    className={index === 5 ? 'active' : ''}
                                ><Icon type="reconciliation"/>&nbsp;&nbsp;在线记录</li>
                            </Link>
                            <Link
                                to={`${url}/logviewer`}
                                onClick={()=>{
                                    this.setState({index: 6})
                                }}
                            >
                                <li
                                    className={index === 6 ? 'active' : ''}
                                >{this.props.store.appStore.lognum !== 0 ? <div className="logcount count">{this.props.store.appStore.lognum}</div> : ''}<Icon type="ordered-list"/>&nbsp;&nbsp;网关日志</li>
                            </Link>
                            <Link
                                to={`${url}/message`}
                                onClick={()=>{
                                    this.setState({index: 7})
                                }}
                            >
                                <li
                                    className={index === 7 ? 'active' : ''}
                                >{this.props.store.messageStore.commnum !== 0 ? <div className="logcount count">{this.props.store.messageStore.commnum}</div> : ''}<Icon type="select"/>&nbsp;&nbsp;网关报文</li>
                            </Link>
                            <Link
                                to={`${url}/platformevent`}
                                onClick={()=>{
                                    this.setState({index: 8})
                                }}
                            >
                                <li
                                    className={index === 8 ? 'active' : ''}
                                ><Icon type="desktop"/>&nbsp;&nbsp;平台事件</li>
                            </Link>
                            <Link
                                to={`${url}/devicesevent`}
                                onClick={()=>{
                                    this.setState({index: 9})
                                }}
                            >
                                <li
                                    className={index === 9 ? 'active' : ''}
                                ><Icon type="message"/>&nbsp;&nbsp;设备事件</li>
                            </Link>
                        </ul>
                </div>
                <div className="navlist">
                    <p>扩展功能</p>
                    <ul>
                        {
                            this.vserialflag
                            ? <Link to={`${url}/Vserial`}
                                key="4"
                                onClick={()=>{
                                this.setIndex('3')
                                }}
                              >
                                <li
                                    className={index === '3' ? 'active' : ''}
                                ><MyIcon type="icon-tiaoshi"/>&nbsp;&nbsp;远程编程-串口</li></Link>
                        : ''
                        }
                        {
                            this.props.vpnflag
                            ? <Link to={`${url}/VPN`}
                                key="4"
                                onClick={()=>{
                                    this.setIndex('4')
                                }}
                              >
                              <li className={index === '4' ? 'active' : ''}><MyIcon type="icon-tiaoshi"/>&nbsp;&nbsp;VPN通道</li></Link>
                            : ''
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
export default LeftNav;