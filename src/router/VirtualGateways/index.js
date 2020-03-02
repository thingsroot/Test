import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Icon } from 'antd';
import http from '../../utils/Server';
import './style.scss';
import intl from 'react-intl-universal';

class MyVirtualGates extends React.Component {
    state = {
        columns: [
            {
                title: intl.get('virtualgateways.virtual_gateway_serial_number'),
                dataIndex: 'sn'
            }, {
                title: intl.get('common.state'),
                dataIndex: 'device_status',
                render: (props)=>{
                    if (props === 'ONLINE'){
                        return (
                            <span className="online"><b></b>&nbsp;&nbsp;{intl.get('gateway.online')}</span>
                        )
                    } else {
                        return (
                            <span className="offline"><b></b>&nbsp;&nbsp;{intl.get('virtualgateways.unconnected')}</span>
                        )
                    }
                }
            }, {
                title: intl.get('sharegroup.gateway_name'),
                dataIndex: 'name'
            }, {
                title: intl.get('virtualgateways.gateway_description'),
                dataIndex: 'description',
                width: '400px'
            }, {
                title: intl.get('common.operation'),
                dataIndex: 'action',
                render: (props, record)=>{
                    if (record.device_status !== 'ONLINE') {
                        return (
                            <span>--/--</span>
                        )
                    } else {
                        return (
                            <span>
                                <Link to={`/gateways/${record.sn}/devices`}>{intl.get('gateway.equipment')}</Link>/
                                <Link to={`/gateways/${record.sn}/apps`}>{intl.get('common.applications')}</Link>
                            </span>
                        )
                    }
                }
            }
        ],
        data: []
    }
    componentDidMount (){
        this.virtual_gateways_list()
    }
    virtual_gateways_list = ()=>{
        http.get('/api/user_virtual_gateways_list').then(res=>{
            if (res.ok) {
                this.setState({
                    data: res.data
                })
            }
        })
    }
    render () {
        const { columns, data } = this.state;
        return (
            <div>
                <div
                    style={{position: 'relative', height: 40, textAlign: 'right'}}
                >
                    <Button
                        type="primary"
                        style={{
                            position: 'absolute',
                            right: 30,
                            top: 0,
                            zIndex: 999
                        }}
                        onClick={()=>{
                            http.post('/api/user_virtual_gateways_create').then(res=>{
                                if (res.ok) {
                                    this.virtual_gateways_list()
                                }
                            })
                        }}
                    >
                        {intl.get('virtualgateways.request_virtual_gateway')}
                    </Button>
                    <Icon
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 6,
                            zIndex: 999
                        }}
                        className="rollback"
                        type="rollback"
                        onClick={()=>{
                            this.props.history.go(-1)
                        }}
                    />
                </div>
                <Table
                    rowKey="name"
                    columns={columns}
                    dataSource={data}
                />
                <section>
                    <h2># {intl.get('virtualgateways.virtual_gateway_User_Guide')}</h2>
                    <p>{intl.get('virtualgateways.click_to_download')}：<a href="http://thingscloud.oss-cn-beijing.aliyuncs.com/download/freeioe.zip">FreeIOE{intl.get('header.virtual_gateway')}</a>  MD5:24E3C9D773BCA05F292D7BF78402A8F6</p>
                    <h3>{intl.get('virtualgateways.running_FreeIOE_virtual_gateway')}</h3>
                    <p>{intl.get('virtualgateways.Unzip_the_downloaded_freeioe.zip_and_open')}
                    </p>
                    <h3>{intl.get('virtualgateways.instructions_for_running_freeioe_with_VMware_Workstation')}</h3>
                    <ol>
                        <li>{intl.get('virtualgateways.double_click')}：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/01.jpg"
                            />
                        </li>
                        <br/>
                        <li>{intl.get('virtualgateways.Freeioe_virtual_machine')}<span>{intl.get('virtualgateways.It_can_be_modified')}</span></li>
                        <br/>
                        <li>{intl.get('virtualgateways.start_the_virtual_machine')}<span>{intl.get('virtualgateways.press_enter_in_the')}</span>{intl.get('virtualgateways.as_shown_in_the_figure_below')}：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/02.jpg"
                            />
                        </li>
                        <br/>
                        <li>{intl.get('virtualgateways.after_the_freeioe_virtual_machine_runs')}<span>{intl.get('virtualgateways.the_IP_address')}</span>{intl.get('virtualgateways.use_a_browser_to_log_in_to_freeioe_system')}：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/03.jpg"
                                style={{width: '80%'}}
                            />
                        </li>
                        <br/>
                        <li>{intl.get('virtualgateways.log_in_to_freeioe_system')}，<span>{intl.get('virtualgateways.default_user_name_password')}：admin/admin1</span></li>
                        <br/>
                        <li>{intl.get('virtualgateways.after_logging_in')}<span>{intl.get('virtualgateways.serial_number_modification')}</span>，{intl.get('virtualgateways.as_shown_in_the_figure_below')}：
                        <br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/04.jpg"
                                style={{width: '80%'}}
                            />
                        </li>
                        <br/>
                        <li>{intl.get('virtualgateways.put_the')}<span>{intl.get('virtualgateways.select_a_virtual_gateway')}</span>，{intl.get('virtualgateways.copy_and_fill_in_the_cloud_ID_text_box')}</li>
                        <br/>
                        <li>{intl.get('virtualgateways.after_logging_in_to_the_platform')}</li>
                    </ol>
                </section>
            </div>
        )
    }
}
export default MyVirtualGates;