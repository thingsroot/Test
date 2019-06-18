import React, { Component } from 'react';
import http from '../../../../utils/Server';
import { Icon, Timeline, Divider } from 'antd';
import './style.scss';
import { inject, observer } from 'mobx-react';
let  timer;
@inject('store')
@observer
class AppUpgrade extends Component {
    state = {
        newdata: [],
        title: '',
        version: '',
        app: '',
        loading: true
    }
    componentDidMount (){
        const {gatewayInfo} = this.props.store
        let enable_beta = gatewayInfo.data.enable_beta
        http.get('/api/applications_versions_list?app=' + this.props.app + '&beta=' + enable_beta).then(res=>{
            const data = []
            if (res.data[0].version >= this.props.version){
                res.data.map(item=>{
                    if (item.version > this.props.version) {
                        data.push(item)
                    }
                })
                if (data.length > 0 ){
                    this.setState({newdata: data, title: data[0].app_name, version: data[0].version, app: data[0].app, loading: false})
                }
            } else {
                this.refs.version.innerHTML = '已经是最新版，无需升级'
            }
        })
    }
    componentWillUnmount (){
        clearInterval(timer)
    }
    render () {
        const {newdata, title, version, loading} = this.state;
        const {gatewayInfo} = this.props.store
        let enable_beta = gatewayInfo.data.enable_beta
        return (
            <div
                style={{overflow: 'hidden', position: 'relative', height: 500}}
            >
                <div className="update show"
                    style={{position: 'absolute', left: 0, top: 0, right: '-17px', bottom: 0, overflow: 'auto'}}
                >
                    <div>
                        <div className="title">
                            <div>
                                <div className="Icon">
                                    <Icon type="setting" />
                                </div>
                                <div>
                                    <h3>{title}</h3>
                                    <p>v{this.props.version} -> v{version}</p>
                                    <span>可升级到最新版</span>
                                </div>
                            </div>
                        </div>
                        <Divider/>
                        <div ref="version">
                            <Timeline>
                            {
                                newdata && newdata.length > 0 && newdata.map((v, i)=>{
                                    return (
                                        v.beta === 0 || enable_beta
                                        ? <Timeline.Item color={v.beta === 0 ? 'green' : 'red'}
                                            key={i}
                                            loading={loading}
                                          >
                                            <p>{v.modified.split('.')[0]}</p>
                                            <p>V{v.version}</p>
                                            <p dangerouslySetInnerHTML={{ __html: v.comment.replace(/\n/g, '<br />') }}></p>
                                        </Timeline.Item> : null
                                    )
                                })
                            }
                            </Timeline>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default AppUpgrade;