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
    constructor (props){
        super(props);
        this.state = {
            gateway: ''
        }
    }
    componentDidMount (){
        this.setState({gateway: this.props.match.params.sn})
        this.gatewayRead()
        this.startTimer()
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            this.setState({gateway: nextProps.match.params.sn})
            this.gatewayRead()
        }
    }
    componentWillUnmount (){
        clearInterval(timer);
    }
    startTimer (){
        timer = setInterval(() => {
            const {gateStatusLast, gateStatusGap, gateStatusNoGapTime} = this.props.store.timer;
            let now = new Date().getTime()
            if (now < gateStatusNoGapTime) {
                this.props.store.timer.setGateStatusLast(now)
                this.gatewayRead()
            } else if (now > gateStatusGap + gateStatusLast) {
                this.props.store.timer.setGateStatusLast(now)
                this.gatewayRead()
            }
        }, 1000);
    }
    gatewayRead (){
        http.get('/api/gateways_read?name=' + this.state.gateway).then(res=>{
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
                        this.props.location.pathname.indexOf('/appsinstall') === -1
                        ? <div>
                            <Link to={`/appsinstall/${this.state.gateway}`}>
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