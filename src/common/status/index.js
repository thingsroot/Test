import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon } from 'antd';
import http from '../../utils/Server';
import { Link, withRouter } from 'react-router-dom';
import './style.scss';
@withRouter
@inject('store')
@observer
class Status extends Component {
    componentDidMount (){
        http.get('/api/gateways_read?name=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res)
          })
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            http.get('/api/gateways_read?name=' + nextProps.match.params.sn).then(res=>{
                this.props.store.appStore.setStatus(res)
              })
        }
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
                <div>
                    <Link to={'/MyGatesLogviewer/' + status.sn}
                        style={{color: 'blue'}}
                    >   <Icon type="ordered-list"
                        style={{color: 'blue'}}
                        />日志</Link>
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