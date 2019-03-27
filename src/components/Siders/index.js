import React, { PureComponent } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
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
class Siders extends PureComponent {
    constructor (props){
        super(props)
        this.state = {
            collapsed: this.props.collapsed
        }
    }
    UNSAFE_componentWillReceiveProps (props){
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
                                transition: 'background 0.3s, width 0.2s'}}
                          >
                              <b>冬笋云</b>
                          </div>
                        : <div className="logo"
                            style={{width: '80px',
                                transition: 'background 0.3s, width 0.2s'}}
                          >
                              <b>冬</b>
                          </div>
                }
                <Menu theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                >
                    <Menu.Item key="1">
                    <Link to="/Home">
                        <Icon
                            type="dashboard"
                            theme="twoTone"
                        />
                        <span>Dashboard</span>
                    </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                    <Link to="/MyGates">
                        <Icon type="desktop" />
                        <span>我的网关</span>
                    </Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/MyApps">
                        <Icon type="table" />
                        <span>我的应用</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Link to="/PlatformMessage">
                            <Icon type="desktop" />
                            <span>平台消息</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                        <Link to="/DeviceMessage">
                            <Icon type="message" />
                            <span>设备消息</span>
                        </Link>
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
export default Siders;