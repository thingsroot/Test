import React, { Component } from 'react';
import { inject, observer} from 'mobx-react';
import { Card, Button, Icon } from 'antd';


@inject('store')
@observer
class GatewayUpgrade extends Component {
    render () {
        const { actionEnable, data } = this.props.store.gatewayInfo;
        const { freeioe_latest_version, skynet_latest_version, title, upgrading, version_data, skynet_version_data, onUpgrade } = this.props;
        return (
            <div>
                <div className="title">
                    <p>固件升级</p>
                    <div>
                        <div className="Icon">
                            <Icon type="setting" />
                        </div>
                        <div>
                            <h3>FreeIOE</h3>
                            <p>
                                <span>
                                {data.version < freeioe_latest_version  ? data.version : 0} -> {freeioe_latest_version}
                                </span>
                            </p>
                        </div>
                        {
                            skynet_latest_version && data.skynet_version && data.skynet_version >= skynet_latest_version
                            ? ''
                            : <div style={{display: 'flex'}}>
                                    <div className="Icon"
                                        style={{marginLeft: 100}}
                                    >
                                    <Icon type="setting" />
                                </div>
                                <div>
                                    <h3>openwrt x86_64_skynet</h3>
                                    <p>
                                        <span>
                                        {data.skynet_version < skynet_latest_version  ? data.skynet_version : 0} -> {skynet_latest_version}
                                        </span>
                                    </p>
                                    <span>
                                    {title === 'FreeIOE'
                                        ? data.version === freeioe_latest_version
                                            ? '已经是最新版' : '可升级到最新版'
                                        : data.skynet_version === skynet_latest_version
                                            ? '已经是最新版' : '可升级到最新版'
                                    }</span>
                                </div>
                            </div>
                        }
                    </div>
                    {
                        data.version < freeioe_latest_version
                        ? <Button
                            type="primary"
                            disabled={upgrading || !actionEnable}
                            onClick={onUpgrade}
                          >升级更新</Button> : <Button>检查更新</Button>
                    }
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    <div style={{width: '50%', padding: 10, boxSizing: 'border-box'}}>
                    <h1>FreeIOE</h1>
                        {
                            version_data && version_data.length > 0 && version_data.map((v, i)=>{
                                return (
                                    <Card
                                        title={`应用名称：${v.app_name}`}
                                        key={i}
                                        style={{marginTop: 10, lineHeight: '30px'}}
                                    >
                                        <p>版本号：{v.version}</p>
                                        <p>更新时间：{v.modified.split('.')[0]}</p>
                                        <p dangerouslySetInnerHTML={{ __html: '更新内容: ' + v.comment.replace(/\n/g, '<br />') }}></p>
                                    </Card>
                                )
                            })
                        }
                    </div>
                    <div style={{width: '50%', padding: 10}}>
                    {
                        data.skynet_version < skynet_latest_version
                        ? <h1>{data.platform}_skynet</h1>
                        : ''
                    }
                        {
                            skynet_version_data && skynet_version_data.length > 0 && skynet_version_data.map((v, i)=>{
                                return (
                                    <Card
                                        title={`应用名称：${v.app_name}`}
                                        key={i}
                                        style={{marginTop: 10, lineHeight: '30px'}}
                                    >
                                        <p>版本号：{v.version}</p>
                                        <p>更新时间：{v.modified.split('.')[0]}</p>
                                        <p dangerouslySetInnerHTML={{ __html: '更新内容: ' + v.comment.replace(/\n/g, '<br />') }}></p>
                                    </Card>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}


export default GatewayUpgrade