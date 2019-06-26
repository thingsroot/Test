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
        const menu1 = (
            <Menu>
                <Menu.Item key="16">
                    <Icon type="monitor" />
                    <span onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/quick_start/', '_blank')
                        }
                    }
                    >
                        快速指南
                    </span>
                </Menu.Item>
                <Menu.Item key="16">
                    <Icon type="read" />
                    <span onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/app_api_book/', '_blank')
                        }
                    }
                    >
                        应用开发手册
                    </span>
                </Menu.Item>

            </Menu>
        )
        const menu = (
            <Menu style={{width: 160, padding: 20}}>
                <Menu.Item key="12">
                    <Icon type="setting"/>
                    <span onClick={
                            ()=>{
                                window.location.href = '/account'
                            }
                        }
                    >
                        个人设置
                    </span>
                </Menu.Item>
                <Menu.Item key="13">
                    <Icon type="laptop" />
                    <span
                        onClick={
                            ()=>{
                                window.location.href = '/virtualgateways'
                            }
                        }
                    >
                        虚拟网关
                    </span>
                </Menu.Item>

                <Menu.Item key="14">
                    <Icon type="key" />
                    <span
                        onClick={
                            ()=>{
                                window.location.href = '/accesskeys'
                            }
                        }
                    >
                        Accesskeys
                    </span>
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
                <Dropdown
                    overlay={menu1}
                    placement="bottomLeft"
                >
                    <span
                        className="ant-dropdown-link"
                        style={{padding: '10px', cursor: 'pointer'}}
                    >
                        <Icon type="question-circle" />
                    </span>
                </Dropdown>
                <Dropdown
                    overlay={menu}
                    placement="bottomLeft"
                    style={{marginRight: 20}}
                >
                    <span
                        className="ant-dropdown-link"
                        style={{padding: '10px', cursor: 'pointer'}}
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