import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Icon } from 'antd';
import http from '../../utils/Server';
import './style.scss';
class MyVirtualGates extends React.Component {
    state = {
        columns: [
            {
                title: '虚拟网关序列号',
                dataIndex: 'sn'
            }, {
                title: '状态',
                dataIndex: 'device_status',
                render: (props)=>{
                    if (props === 'ONLINE'){
                        return (
                            <span className="online"><b></b>&nbsp;&nbsp;在线</span>
                        )
                    } else {
                        return (
                            <span className="offline"><b></b>&nbsp;&nbsp;未连接</span>
                        )
                    }
                }
            }, {
                title: '网关名称',
                dataIndex: 'name'
            }, {
                title: '网关描述',
                dataIndex: 'description',
                width: '400px'
            }, {
                title: '操作',
                dataIndex: 'action',
                render: (props, record)=>{
                    if (record.device_status !== 'ONLINE') {
                        return (
                            <span>--/--</span>
                        )
                    } else {
                        return (
                            <span>
                                <Link to={`/gateways/${record.sn}/devices`}>设备</Link>/
                                <Link to={`/gateways/${record.sn}/apps`}>应用</Link>
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
                        申请虚拟网关
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
                    <h2># 虚拟网关使用指南</h2>
                    <p>点击下载：<a href="http://thingscloud.oss-cn-beijing.aliyuncs.com/download/freeioe.zip">FreeIOE虚拟网关</a>  MD5:24E3C9D773BCA05F292D7BF78402A8F6</p>
                    <h3>运行FreeIOE虚拟网关</h3>
                    <p>将下载的FreeIOE.zip解压，使用虚拟机软件(VMware Workstation 或者 VirtualBox)打开
                    </p>
                    <h3>使用VMware Workstation运行FreeIOE说明</h3>
                    <ol>
                        <li>在解压后的目录下双击freeioe.ovf文件，在Windows系统在会自动使用VMware Workstation打开并弹出导入界面，如下图所示：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/01.jpg"
                            />
                        </li>
                        <br/>
                        <li>FreeIOE虚拟机基于OPEWRT系统，默认带2块网卡，第一块网卡是LAN口，连接主机的虚拟网卡1；第二块网卡是WAN口，连接到主机的物理网卡。<span>可根据自己的网络环境修改。</span></li>
                        <br/>
                        <li>启动虚拟机，等待十几秒FreeIOE启动完成后，<span>在虚拟机中按回车键查看虚拟机的IP地址，</span>如下图所示：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/02.jpg"
                            />
                        </li>
                        <br/>
                        <li>FreeIOE虚拟机运行后，登录地址为上一条所说的<span>虚拟机运行起来后看到的IP地址，</span>使用浏览器登录到FreeIOE系统，http://xxx.xxx.xxx.xxx:8808，登录后界面如下图所示：<br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/03.jpg"
                                style={{width: '80%'}}
                            />
                        </li>
                        <br/>
                        <li>登录FreeIOE系统，<span>默认的用户名/密码：admin/admin1</span></li>
                        <br/>
                        <li>登录后，在左侧导航中点击云，进行FreeIOE连接平台的<span>序列号修改</span>，如下图所示：
                        <br/>
                            <img
                                alt=""
                                src="http://yun.thingsroot.com/img/freeioe/04.jpg"
                                style={{width: '80%'}}
                            />
                        </li>
                        <br/>
                        <li>将自己账户下的<span>虚拟网关序列号选择一个（在本页面的上面表格中，如没有，申请即可）</span>，复制并填入云ID文本框中，点击修改后，再点击下方的重启按钮重启FreeIOE即可。 </li>
                        <br/>
                        <li>登录平台后，在自己的名下就出现了刚增加的FreeIOE虚拟网关，给它改个名称，接下来就开始体验吧。</li>
                    </ol>
                </section>
            </div>
        )
    }
}
export default MyVirtualGates;