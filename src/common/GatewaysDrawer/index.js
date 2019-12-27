import React, { Component } from 'react';
import http from '../../utils/Server';
import { withRouter, Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Drawer, Input } from 'antd';  //
import './style.scss';
// import {Drawer} from "antd";

@withRouter
@inject('store')
@observer
class GatewaysDrawer extends Component {
    state = {
        url: window.location.pathname,
        gateways: []
    };
    componentDidMount (){
        this.updateGatewayList()
        this.startTimer()
    }
    componentWillUnmount (){
        clearInterval(this.timer);
    }
    startTimer (){
        this.timer = setInterval(() => {
            this.updateGatewayList()
        }, 10000);
    }

    updateGatewayList = () => {
        // FIXME: Save localStorage about user accessed gateways..
        http.get('/api/gateways_list?status=online').then(res=>{
            if (res.ok) {
                this.setState({
                    gateways: res.data,
                    filterDataSource: res.data
                })
            }
        })
    };
    setUrl = (sn) => {
        let arr = location.pathname.split('/');
        arr[2] = sn;
        return arr.join('/')
    };
    onClose = () => {
        this.updateGatewayList()
        this.props.store.timer.setGateStatusLast(0) // Force to update gateway status
        setTimeout( ()=> {
            this.props.onChange()
            this.props.onClose()
        }, 500)
    }
    filterGateway = (e) => {
        const value = e.target.value.toLowerCase();
        const data = this.state.filterDataSource.filter(item=> item.description.toLowerCase().indexOf(value) !== -1 || item.dev_name.toLowerCase().indexOf(value) !== -1 || item.name.indexOf(value) !== -1)
        this.setState({
            gateways: data
        })
    }
    render () {
        const { gateways, status, gateway_sn } = this.state;
        status, gateway_sn;
        const { onClose, onChange, visible, gateway } = this.props;
        onClose, onChange;
        return (
            <Drawer
                className="gateways_drawer"
                title="网关列表"
                placement="left"
                closable={false}
                onClose={this.onClose}
                visible={visible}
                width="500"
            >
                <Input.Search
                    placeholder="请输入网关序列号，名称，描述"
                    onChange={this.filterGateway}
                    style={{
                        width: '70%',
                        marginLeft: '15%'
                    }}
                />
                <ul>
                    {
                        gateways && gateways.length > 0 && gateways.map((v, i)=>{
                            return (
                                <Link
                                    key={i}
                                    to={
                                        this.setUrl(v.sn)
                                    }
                                >
                                    <li onClick={this.onClose}
                                        className={gateway === v.sn ? 'gateslist gateslistactive' : 'gateslist'}
                                    >
                                        <span></span>
                                        <p>{v.dev_name}&nbsp;(&nbsp;<i>{v.description}</i>&nbsp;)<br />&nbsp;序列号:{v.name}</p>
                                    </li>
                                </Link>
                            )
                        })
                    }
                </ul>
            </Drawer>
        );
    }
}

export default GatewaysDrawer;