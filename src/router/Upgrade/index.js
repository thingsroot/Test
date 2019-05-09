import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Button, Icon, Card, message } from 'antd';
import './style.scss';
let  timer;
class upgrade extends PureComponent {
    state = {
        newdata: [],
        title: '',
        version: '',
        app: ''
    }
    componentDidMount (){
        http.get('/api/applications_versions_list?app=' + this.props.match.params.app).then(res=>{
            const data = []
            res.data.map(item=>{
                if (item.version > this.props.match.params.version) {
                    data.push(item)
                }
            })
            this.setState({newdata: data, title: data[0].app_name, version: data[0].version, app: data[0].app})
        })
    }
    componentWillUnmount (){
        clearInterval(timer)
    }
    render () {
        const {newdata, title, version} = this.state;
        return (
            <div>
                <div className="update show">
                                <Button
                                    onClick={()=>{
                                        this.props.history.go(-1)
                                    }}
                                >X</Button>
                    <div>
                        <div className="title">
                                    <p>应用升级</p>
                                    <div>
                                        <div className="Icon">
                                            <Icon type="setting" />
                                        </div>
                                        <div>
                                            <h3>{title}</h3>
                                            <p>v{this.props.match.params.version} -> v{version}</p>
                                            <span>可升级到最新版</span>
                                        </div>
                                    </div>
                                    {
                                        <Button
                                            onClick={()=>{
                                                const data = {
                                                    gateway: this.props.match.params.sn,
                                                    app: this.props.match.params.app,
                                                    inst: this.props.match.params.inst,
                                                    version: version,
                                                    conf: {},
                                                    id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
                                                }
                                                http.postToken('/api/gateways_applications_upgrade', data).then(res=>{
                                                    timer = setInterval(() => {
                                                        http.get('/api/gateways_exec_result?id=' + res.data).then(res=>{
                                                            if (res.ok){
                                                                message.success('应用升级成功')
                                                                clearInterval(timer)
                                                                http.post('/api/gateways_applications_refresh', {
                                                                    gateway: this.props.match.params.sn,
                                                                    id: `gateways/refresh/${this.props.match.params.sn}/${new Date() * 1}`
                                                                }).then(()=>{
                                                                    this.props.history.go(-1)
                                                                })
                                                            } else if (res.ok === false){
                                                                message.error('应用升级操作失败，请重试');
                                                                clearInterval(timer)
                                                            }
                                                        })
                                                    }, 1000);
                                                })
                                            }}
                                        >升级更新</Button>
                                    }
                        </div>
                        <h1>{title}版本信息</h1>
                        {
                            newdata && newdata.length > 0 && newdata.map((v, i)=>{
                                return (
                                    <Card
                                        title={`应用名称：${v.app_name}`}
                                        key={i}
                                        style={{marginTop: 10}}
                                    >
                                        <p>版本号：{v.version}</p>
                                        <p>更新内容：{v.comment}</p>
                                        <p>更新时间：{v.modified.split('.')[0]}</p>
                                    </Card>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

        );
    }
}

export default upgrade;