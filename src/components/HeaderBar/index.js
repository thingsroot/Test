import React, { PureComponent } from 'react';
import { Icon, message, Menu, Button, Dropdown } from 'antd';
import { Link, withRouter} from 'react-router-dom';
import { _getCookie, _setCookie } from '../../utils/Session';
const menu = (
    <Menu style={{padding: 20}}>
      <Menu.Item key="12">
        <Link to="/UserSettings">基本资料</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="13">
        <Link to="/MyVirtualGates">虚拟网关</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="14">
        <Link to="/MyAccessKey">AccessKey</Link>
      </Menu.Item>
      <Menu.Item key="15"
          style={{padding: 0, textAlign: 'center'}}
      >
        <Button type="danger"
            block
            onClick={()=>{
              _setCookie('T&R_auth_token', '');
              message.success('退出成功,即将跳转至登录页', 1.5).then(()=>{
                location.href = '/';
              })
            }}
        >退出</Button>
      </Menu.Item>
    </Menu>
  );
  @withRouter
class Headers extends PureComponent {
    UNSAFE_componentWillReceiveProps () {
      if (_getCookie('sid') === 'Guest') {
        this.history.push('/login')
      }
    }
    render () {
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