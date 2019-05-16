import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import http from '../../utils/Server';
import { Link, withRouter } from 'react-router-dom';
import './style.scss';
let timer;
@withRouter
@inject('store')
@observer
class Status extends Component {
    componentDidMount (){
        this.gatewayRead(this.props.match.params.sn)
        timer = setInterval(() => {
            this.gatewayRead(this.props.match.params.sn)
        }, 5000);
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            this.gatewayRead(nextProps.match.params.sn)
            clearInterval(timer)
            timer = setInterval(() => {
                http.get('/api/gateways_read?name=' + nextProps.match.params.sn).then(res=>{
                    this.props.store.appStore.setStatus(res)
                  })
            }, 5000);
        }
    }
    componentWillUnmount (){
        clearInterval(timer);
    }
    gatewayRead = (sn)=>{
        http.get('/api/gateways_read?name=' + sn).then(res=>{
            this.props.store.appStore.setStatus(res)
          })
    }
    render () {
        const { status } = this.props.store.appStore;
        return (
            <div className="statusWrap">
                <div>
                    <div className="status"></div>
                    &nbsp; <span className={status.device_status === 'ONLINE' ? 'online' : 'offline'}>{status.device_status}</span>
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;名称: {status.name}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;描述: {status.description}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;序号: {status.sn}
                </div>
                    {
                        this.props.location.pathname.indexOf('/AppsInstall') === -1
                        ? <div>
                            <Link to={`/AppsInstall/${this.props.match.params.sn}/app/1`}>
                                安装新应用
                            </Link>
                        </div>
                        : ''
                    }
            </div>
        );
    }
}
export default Status;