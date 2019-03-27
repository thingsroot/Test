import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import './style.scss'
class PlatformDetails extends PureComponent {
    state = {
        data: {},
        title: ''
    };
    componentDidMount (){
        let name = this.props.match.params.name;
        console.log(name);
        http.postToken('/api/method/iot.user_api.dispose_device_activity?name=' + name + '&disposed=1').then(res=>{
            console.log(res);
        });
        http.postToken('/api/method/iot.user_api.device_activity_detail?name=' + name).then(res=>{
            console.log(res);
            let sub = '';
            if (res.message) {
                let obj = JSON.parse(res.message.message);
                if (obj.hasOwnProperty('device_status')) {
                    if (obj.device_status === 'ONLINE'){
                        sub = '设备上线'
                    } else if (obj.device_status === 'OFFLINE'){
                        sub = '设备离线'
                    }
                    //设备操作
                } else if (obj.hasOwnProperty('action')){
                    if (obj.channel === 'app') {
                        if (obj.action === 'option') {   //开机自启动
                            if (obj.data.value === 1) {
                                sub = '开启应用' + obj.data.inst + '开机自启动'
                            } else if (obj.data.value === 0) {
                                sub = '关闭应用' + obj.data.inst + '开机自启动'
                            }
                        } else if (obj.action === 'restart') {
                            sub = '重启应用' + obj.data.inst
                        } else if (obj.action === 'start') {
                            sub = '启动应用' + obj.data.inst
                        } else if (obj.action === 'stop') {
                            sub = '停止应用' + obj.data.inst
                        } else if (obj.action === 'conf') {
                            sub = '更改应用' + obj.data.inst + '应用配置'
                        } else if (obj.action === 'upload_comm') {
                            if (obj.data.sec === 0) {
                                sub = '停止上传应用' + obj.data.inst + '报文'
                            } else if (obj.data.sec === 120) {
                                sub = '上传应用' + obj.data.inst + '报文'
                            }
                        } else if (obj.action === 'install') {
                            sub = '安装应用' + obj.data.name + '实例名' + obj.data.inst
                        } else if (obj.action === 'uninstall') {
                            sub = '卸载应用' + obj.data.inst
                        } else if (obj.action === 'query_comm') {
                            sub = '应用' + obj.data.inst + '查询报文'
                        } else if (obj.action === 'query_log') {
                            sub = '应用' + obj.data.inst + '查询日志'
                        } else if (obj.action === 'list') {
                            sub = '刷新应用列表'
                        } else if (obj.action === 'upgrade') {
                            sub = '应用' + obj.data.inst + '升级到最新版本'
                        } else if (obj.action === 'rename') {
                            sub = '应用' + obj.data.inst + '重命名为' + obj.data.new_name
                        }
                    } else if (obj.channel === 'sys') {
                        if (obj.action === 'enable/beta') {
                            if (obj.data === 0) {
                                sub = '网关关闭beta模式'
                            } else if (obj.data === 1) {
                                sub = '网关开启beta模式'
                            }
                        } else if (obj.action === 'enable/data') {
                            if (obj.data === 0) {
                                sub = '网关关闭数据上传'
                            } else if (obj.data === 1) {
                                sub = '网关开启数据上传'
                            }
                        } else if (obj.action === 'enable/log') {
                            if (obj.data === '') {
                                sub = '网关关闭日志上送'
                            } else if (obj.data === 120) {
                                sub = '网关开启日志上送'
                            }
                        } else if (obj.action === 'enable/comm') {
                            if (obj.data.sec === 0) {
                                sub = '网关停止报文上送'
                            } else if (obj.data.sec === 120) {
                                sub = '网关开启报文上送'
                            }
                        } else if (obj.action === 'restart') {
                            sub = '网关IOT程序重启'
                        } else if (obj.action === 'reboot') {
                            sub = '网关设备重启'
                        } else if (obj.action === 'cloud_conf') {
                            sub = '网关云中心配置选项更新'
                        } else if (obj.action === 'enable/data_one_short') {
                            if (obj.data.sec === '') {
                                sub = '网关关闭临时上传数据'
                            } else if (obj.data.sec === 120) {
                                sub = '网关开启临时上传数据'
                            }
                        } else if (obj.action === 'ext/upgrade') {
                            sub = '网关更新扩展库' + obj.data.name
                        } else if (obj.action === 'ext/list') {
                            sub = '网关上传扩展库列表'
                        } else if (obj.action === 'cfg/download') {
                            sub = '网关IOT固件配置下载'
                        } else if (obj.action === 'cfg/upload') {
                            sub = '网关IOT固件配置上传'
                        } else if (obj.action === 'upgrade') {
                            sub = '网关升级到最新版本'
                        } else if (obj.action === 'enable/event') {
                            sub = '网关更改事件上传等级'
                        } else if (obj.action === 'enable/stat') {
                            sub = '网关开启统计数据上传'
                        } else if (obj.action === 'batch_script') {
                            sub = '网关执行批量操作'
                        } else if (obj.action === 'upgrade/ack') {
                            sub = '网关IOT固件升级确认'
                        } else if (obj.action === 'data/query') {
                            sub = '网关请求立刻上传数据'
                        }
                    } else if (obj.channel === 'command') {
                        sub = '网关应用设备执行' + obj.data.cmd + '指令'
                    } else if (obj.channel === 'putput') {
                        sub = '网关设备应用' + obj.data.output + '数据输出'
                    }  //output
                }
                console.log(sub)
            }
            this.setState({
                title: sub,
                data: res.message
            })
        })
    }
    render () {
        return (
            <div className="platformDetails">
                <table border="1"
                    collspacing="0"
                >
                    <tr>
                        <td>标题</td>
                        <td>{this.state.title}</td>
                    </tr>
                    <tr>
                        <td>所属设备序列号</td>
                        <td>{this.state.data.device}</td>
                    </tr>
                    <tr>
                        <td>发生时刻设备所属公司</td>
                        <td>{this.state.data.owner_company}</td>
                    </tr>
                    <tr>
                        <td>触发用户用户名</td>
                        <td>{this.state.data.disposed_by}</td>
                    </tr>
                    <tr>
                        <td>发生时间</td>
                        <td>{this.state.data.creation}</td>
                    </tr>
                    <tr>
                        <td>执行结果</td>
                        <td>{this.state.data.operation}</td>
                    </tr>
                    <tr>
                        <td>记录类型</td>
                        <td>{this.state.data.status === 'Success' ? '成功' : '失败'}</td>
                    </tr>
                    <tr>
                        <td>详细信息</td>
                        <td>{this.state.data.message}</td>
                    </tr>
                    <tr>
                        <td>是否确认消息</td>
                        <td>{this.state.data.disposed === '1' ? '已确认消息' : '为确认消息'}</td>
                    </tr>
                    <tr>
                        <td>确认消息用户</td>
                        <td>{this.state.data.user}</td>
                    </tr>
                </table>
            </div>
        );
    }
}

export default PlatformDetails;