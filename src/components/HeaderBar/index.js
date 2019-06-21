import React, { PureComponent } from 'react';
import { Icon, message, Menu, Dropdown } from 'antd';
import { withRouter} from 'react-router-dom';
import { _getCookie, isAuthenticated, authenticateClear } from '../../utils/Session';
import http  from '../../utils/Server';

@withRouter
class HeaderBar extends PureComponent {
    UNSAFE_componentWillReceiveProps () {
        if (!isAuthenticated()) {
            this.props.history.push('/login')
        }
    }
    render () {
        const menu = (
            <Menu style={{width: 160, padding: 20}}>
                <Menu.Item key="12">
                    <Icon type="setting"/>
                    <span onClick={
                        ()=>{
                            window.location.href = '/account'
                        }
                    }>个人设置</span>
                </Menu.Item>
                <Menu.Item key="13">
                    <Icon type="laptop" />
                    <span onClick={
                        ()=>{
                            window.location.href = '/virtualgateways'
                        }
                    }>虚拟网关</span>
                </Menu.Item>

                <Menu.Item key="14">
                    <Icon type="key" />
                    <span onClick={
                        ()=>{
                            window.location.href = '/accesskeys'
                        }
                    }>Accesskeys</span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="15">
                    <Icon type="poweroff" />
                    <span
                        onClick={()=>{
                            authenticateClear();
                            http.post('/api/user_logout').then(res=>{
                                res;
                                message.success('退出成功,即将跳转至登录页', 1.5).then(()=>{
                                    location.href = '/'
                                })
                            }).catch(err=>{
                                err;
                                message.error('退出失败!!')
                            });
                        }}
                    >
                        退出登录
                    </span>
                </Menu.Item>
            </Menu>
        );
        return (
            <div className="headerUser">
                <Dropdown overlay={menu}>
                    <span
                        className="ant-dropdown-link"
                        href="#"
                        style={{display: 'block', padding: '0 10px', cursor: 'pointer'}}
                    >
                        <Icon type="user"/>
                        {
                            decodeURI(_getCookie('full_name').split(' ')[0])
                        }
                    </span>
                </Dropdown>
            </div>
        );
    }
}
export default HeaderBar;