import React, { PureComponent } from 'react';
import { Icon, message, Menu, Dropdown, Select } from 'antd';
import { withRouter, Link} from 'react-router-dom';
import { _getCookie, isAuthenticated, authenticateClear } from '../../utils/Session';
import {emit} from '../../emit';
import intl from 'react-intl-universal';
import http  from '../../utils/Server';
import OEM from '../../assets/OEM';
const { Option } = Select;

@withRouter
class HeaderBar extends PureComponent {
    state = {
        page: ''
    }
    componentDidMount () {
        // this.handleChange('zh-CN')
        this.handleChange()
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.location.pathname.indexOf('appstore') === -1 && nextProps.location.pathname.indexOf('enterprise') === -1) {
            this.setState({
                page: ''
            })
        }
        if (nextProps.location.pathname.indexOf('appitems') !== -1) {
            this.setState({
                page: 'appstore'
            })
        }
        if (!isAuthenticated()) {
            this.props.history.push('/login')
        }
    }
    handleChange (val) {
        // 发送消息
        if (!val) {
            if (!localStorage.getItem('i18n')) {
                localStorage.setItem('i18n', 'zh-CN')
            }
            emit.emit('change_language', localStorage.getItem('i18n'));
        } else {
            if (localStorage.getItem('i18n') !== val) {
                localStorage.setItem('i18n', val)
                location.reload()
            } else {
                return false;
            }
        }
        emit.emit('change_language', val);
    }
    render () {
        const {page} = this.state;
        const menu1 = (
            <Menu>
                <Menu.Item
                    key="16"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/quick_start/', '_blank')
                        }
                    }
                >
                    <Icon type="monitor" />
                    <span>
                        {intl.get('header.quick_guide')}
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="17"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        产品介绍
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="18"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/user_guide/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        用户指南
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="19"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/guide/admin_guide/ ', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        管理员指南
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="20"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            window.open('http://help.cloud.thingsroot.com/app_api_book/', '_blank')
                        }
                    }
                >
                    <Icon type="read" />
                    <span>
                        {intl.get('header.app_manual')}
                    </span>
                </Menu.Item>

            </Menu>
        )
        const menu = (
            <Menu style={{width: 160}}>
                <Menu.Item
                    key="12"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            this.props.history.push('/account')
                        }
                    }
                >
                    <Icon type="setting"/>
                    <span>
                        {intl.get('header.personal_settings')}
                    </span>
                </Menu.Item>
                <Menu.Item
                    key="13"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            this.props.history.push('/virtualgateways')
                        }
                    }
                >
                    <Icon type="laptop" />
                    <span>
                        {intl.get('header.virtual_gateway')}
                    </span>
                </Menu.Item>

                <Menu.Item
                    key="14"
                    style={{lineHeight: '30px'}}
                    onClick={
                        ()=>{
                            this.props.history.push('/accesskeys')
                        }
                    }
                >
                    <Icon type="key" />
                    <span>
                        Accesskeys
                    </span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    key="15"
                    style={{lineHeight: '30px'}}
                    onClick={()=>{
                        http.post('/api/user_logout').then(res=>{
                            res;
                            authenticateClear();
                            message.success(intl.get('header.log_out_success'), 1.5).then(()=>{
                                location.href = '/'
                            })
                        }).catch(err=>{
                            err;
                            message.error(intl.get('header.log_out_fail'))
                        });
                    }}
                >
                    <Icon type="poweroff" />
                    <span>
                        {intl.get('header.log_out')}
                    </span>
                </Menu.Item>
            </Menu>
        );
        // const menu2 = (
        //     <Menu style={{width: 160}}>
        //         <Menu.Item
        //             key="18"
        //             style={{lineHeight: '30px'}}
        //             onClick={
        //                 ()=>{
        //                     this.props.history.push('/member')
        //                 }
        //             }
        //         >
        //             <Icon type="team" />
        //             <span>
        //             {intl.get('header.Members_of_the_management')}
        //             </span>
        //         </Menu.Item>
        //         <Menu.Item
        //             key="19"
        //             style={{lineHeight: '30px'}}
        //             onClick={
        //                 ()=>{
        //                     this.props.history.push('/sharegroup')
        //                 }
        //             }
        //         >
        //             <Icon type="share-alt"/>
        //             <span>
        //             {intl.get('header.Shared_group_management')}
        //             </span>
        //         </Menu.Item>
        //     </Menu>
        // )
        return (
            <div className="headerUser">
                <Select
                    // defaultValue="中文"
                    value={localStorage.getItem('i18n') === 'en-US' ? 'English' : '中文'}
                    onChange={(val)=>{
                        this.handleChange(val)
                    }}
                    style={{marginRight: '20px'}}
                >
                    <Option value="zh-CN">中文</Option>
                    <Option value="en-US">English</Option>
                </Select>
                <Link
                    to="/appstore"
                    style={{marginRight: '15px'}}
                    className={page === 'appstore' ? 'the_selected' : ''}
                    onClick={()=>{
                        this.setState({
                            page: 'appstore'
                        })
                    }}
                ><Icon type="appstore"/>&nbsp;&nbsp;{intl.get('header.app_store')}</Link>
                <Link
                    to="/enterprise/shared"
                    className={page === 'enterprise' ? 'the_selected' : ''}
                    onClick={()=>{
                        this.setState({
                            page: 'enterprise'
                        })
                    }}
                >
                    <span
                        className="ant-dropdown-link"
                        style={{padding: '10px', cursor: 'pointer'}}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="global"
                        />
                        {intl.get('header.enterprise')}
                    </span>
                </Link>
                {
                    OEM.Title === '冬笋云'
                    ? <span>
                        <Dropdown
                            overlay={menu1}
                            placement="bottomRight"
                        >
                        <span
                            className="ant-dropdown-link"
                            style={{padding: '10px', cursor: 'pointer'}}
                        >
                            <Icon
                                style={{padding: '0 4px', fontWeight: 800}}
                                type="question-circle"
                            />{intl.get('header.help')}
                        </span>
                    </Dropdown>
                    <span style={{padding: '0 5px'}}> </span>
                    <a onClick={()=>{
                        window.open('https://freeioe.org/', '_blank')
                    }}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="message"
                        />

                        {intl.get('header.discuss')}
                    </a>
                    <span style={{padding: '0 5px'}}> </span>

                    <span style={{padding: '0 5px'}}> </span>
                    <a onClick={()=>{
                        window.open('https://wiki.freeioe.org/', '_blank')
                    }}
                    >
                        <Icon
                            style={{padding: '0 4px', fontWeight: 800}}
                            type="book"
                        />
                        {intl.get('header.the_knowledge_base')}
                    </a>
                    <span style={{padding: '0 5px'}}> </span>
                    </span>

                    : ''
                }
                <Dropdown
                    overlay={menu}
                    placement="bottomRight"
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