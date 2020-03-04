import React, { PureComponent } from 'react';
import { Menu, Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import intl from 'react-intl-universal';
import OEM from '../../assets/OEM';
const maxSider = {
    width: '200px',
    height: '100%',
    backgroundColor: '#001529',
    zIndex: 1999,
    transition: 'background 0.3s, left 0.2s'
};
const minSider = {
    width: '80px',
    height: '100%',
    backgroundColor: '#001529',
    zIndex: 1999,
    transition: 'background 0.3s, left 0.2s'
}
@withRouter
class Siders extends PureComponent {
    constructor (props){
        super(props)
        this.state = {
            collapsed: this.props.collapsed,
            key: '0'
        }
    }
    UNSAFE_componentWillMount () {
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('/dashboard') !== -1){
            this.setState({
                key: '1'
            })
        } else if (pathname.indexOf('/gateways') !== -1 || pathname.indexOf('/gateway/') !== -1 || pathname.indexOf('/appsinstall') !== -1) {
            this.setState({
                key: '2'
            })
        } else if (pathname.indexOf('/platformevents') !== -1) {
            this.setState({
                key: '4'
            })
        } else if (pathname.indexOf('/gatewayevents') !== -1 || pathname.indexOf('/gatewayevent') !== -1) {
            this.setState({
                key: '5'
            })
        } else if (pathname.indexOf('/appeditorcode') !== -1 || pathname.indexOf('/appedit') !== -1 || pathname.indexOf('/appnew') !== -1 || pathname.indexOf('/appdetails') !== -1 || pathname.indexOf('/developer') !== -1 || pathname.indexOf('template') !== -1) {
            this.setState({
                key: '3'
            })
        } else {
            this.setState({
                key: '0'
            })
        }
    }
    componentDidMount () {
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('/appstore') !== -1 || pathname.indexOf('/enterprise') !== -1){
            this.setState({
                key: '0'
            })
        }
    }
    UNSAFE_componentWillReceiveProps (props){
        const pathname = props.location.pathname.toLowerCase();
        if (pathname.indexOf('/appstore') !== -1 || pathname.indexOf('/enterprise') !== -1){
            this.setState({
                key: '0'
            })
        }
        if (pathname.indexOf('/dashboard') !== -1 && this.state.key !== '1'){
            this.setState({
                key: '1'
            })
        }
        this.setState({
            collapsed: props.collapsed
        })
    }
    render (){
        return (
            <div className="siders"
                style={this.props.collapsed ? minSider : maxSider}
            >
                {
                    !this.props.collapsed
                        ? <div className="logo"
                            style={{width: '200px',
                                transition: 'background 0.3s, width 0.2s'
                            }}
                          >
                              <b>{OEM.Title}</b>
                          </div>
                        : <div className="logo"
                            style={{width: '80px',
                                transition: 'background 0.3s, width 0.2s'
                            }}
                          >
                              <b>{OEM.MiniTitle}</b>
                          </div>
                }
                <Menu theme="dark"
                    mode="inline"
                    selectedKeys={this.state.key}
                    onClick={(val)=>{
                        this.setState({key: val.key})
                    }}
                >
                    <Menu.Item key="1">
                    <Link to="/dashboard">
                        <Icon
                            type="dashboard"
                            // theme="twoTone"
                        />
                        <span>Dashboard</span>
                    </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                    <Link to="/gateways">
                        <Icon type="laptop" />
                            <span>{intl.get('sider.my_gateway')}</span>
                    </Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/developer">
                            <Icon type="appstore" />
                        {/* <span>开发者中心</span> */}
                            <span>{intl.get('sider.my_app')}</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Link to="/platformevents">
                            <Icon type="bell" />
                            <span>{intl.get('sider.platform_event')}</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                        <Link to="/gatewayevents">
                            <Icon type="notification" />
                            <span>{intl.get('sider.device_events')}</span>
                        </Link>
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
export default Siders;