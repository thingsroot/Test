import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import http from '../../utils/Server';
import { Link, withRouter } from 'react-router-dom';
import './style.scss';
@withRouter
@inject('store')
@observer
class Status extends Component {
    constructor (props){
        super(props);
        this.timer = undefined
        this.state = {
            gateway: ''
        }
    }
    componentDidMount (){
        this.setState({gateway: this.props.gateway}, () => {
            this.gatewayRead()
            this.startTimer()
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.gateway !== this.state.gateway) {
            this.setState({gateway: nextProps.gateway}, () => {
                this.gatewayRead()
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.timer);
    }
    startTimer (){
        this.timer = setInterval(() => {
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
        if (this.state.gateway === undefined || this.state.gateway === '') {
            return
        }
        http.get('/api/gateways_read?name=' + this.state.gateway).then(res=>{
            if (res.ok) {
                if (res.data.sn !== this.state.gateway) {
                    console.log('Delayed data arrived!!', res.data, this.state.gateway)
                    return
                }
                this.props.store.gatewayInfo.updateStatus(res.data);
            }
        });
    }
    render () {
        const { device_status, dev_name, description } = this.props.store.gatewayInfo;
        return (
            <div className="statusWrap">
                <div>
                    <div className="status"></div>
                    &nbsp; <span className={device_status === 'ONLINE' ? 'online' : 'offline'}>{device_status ? device_status : 'OFFLINE'}</span>
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;名称: {dev_name ? dev_name : ''}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;描述: {description ? description : ''}
                </div>
                <div>
                    <div className="positon"><span></span></div>
                    &nbsp;序号: {this.state.gateway}
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