import React, { PureComponent } from 'react';
import { Icon, message, Menu, Button, Dropdown } from 'antd';
import { Link, withRouter} from 'react-router-dom';
import { _getCookie, isAuthenticated, authenticateClear } from '../../utils/Session';
import http  from '../../utils/Server';

@withRouter
class Headers extends PureComponent {
    UNSAFE_componentWillReceiveProps () {
        if (!isAuthenticated()) {
            this.props.history.push('/login')
        }
    }
    render () {
        const menu = (
            <Menu style={{padding: 20}}>
                <Menu.Item key="12">
                    <Link to="/account">基本资料</Link>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="13">
                    <Link to="/virtualgateways">虚拟网关</Link>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="14">
                    <Link to="/accesskeys">AccessKey</Link>
                </Menu.Item>
                <Menu.Item key="15"
                    style={{padding: 0, textAlign: 'center'}}
                >
                <span style={{padding: '5px 0'}} />
                    <Button type="danger"
                        block
                        onClick={()=>{
                            authenticateClear()
                            http.post('/api/user_logout').then(res=>{
                                res;
                                message.success('退出成功,即将跳转至登录页', 1.5).then(()=>{
                                    location.href = '/login'
                                })
                            }).catch(err=>{
                                err;
                                message.error('退出失败!!')
                            });
                        }}
                    >退出</Button>
                </Menu.Item>
            </Menu>
        );
        return (
            <div className="headerUser">
              <Dropdown overlay={menu}
                  trigger={['click']}
              >
                <span className="ant-dropdown-link"
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
export default Headers;