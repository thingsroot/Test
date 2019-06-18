import React, { Component } from 'react';
import { inject, observer} from 'mobx-react';
import { Button, Icon, Timeline, Divider, Tooltip } from 'antd';


@inject('store')
@observer
class GatewayUpgrade extends Component {
    render () {
        const { actionEnable, data } = this.props.store.gatewayInfo;
        const { freeioe_latest_version, skynet_latest_version, upgrading, version_data, skynet_version_data, onUpgrade } = this.props;
        return (
            <div>
                <div className="title">
                    <h2>固件升级</h2>
                    <div>
                        <div className="Icon">
                            <Icon type="setting" />
                        </div>
                        <div>
                            <h3>业务软件(FreeIOE)</h3>
                            <p>
                                <span>
                                {data.version} -> {freeioe_latest_version}
                                </span>
                            </p>
                            <span>
                                {data.version === freeioe_latest_version ? '已经是最新版' : '可升级到最新版'}
                            </span>
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
                                    <Tooltip placement="bottom"
                                        title={data.platform}
                                    > <h3>核心软件(SKYNET)</h3> </Tooltip>
                                    <p>
                                        <span>
                                        {data.skynet_version} -> {skynet_latest_version}
                                        </span>
                                    </p>
                                    <span>
                                    {data.skynet_version === skynet_latest_version ? '已经是最新版' : '可升级到最新版'}
                                    </span>
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
                <Divider/>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    <div style={{width: '50%', padding: 10, boxSizing: 'border-box'}}>
                    <h3>业务软件更新历史</h3>
                        <Divider/>
                        <Timeline>
                        {
                            version_data && version_data.length > 0 && version_data.map((v, i)=>{
                                return (
                                <Timeline.Item color={v.beta === 0 ? 'green' : 'red'}
                                    key={i}
                                >
                                    <p>{v.modified.split('.')[0]}</p>
                                    <p>V{v.version}</p>
                                    <p dangerouslySetInnerHTML={{ __html: v.comment.replace(/\n/g, '<br />') }}></p>
                                </Timeline.Item>
                                )
                            })
                        }
                        </Timeline>
                    </div>
                    <div style={{width: '50%', padding: 10}}>
                    {
                        data.skynet_version < skynet_latest_version
                        ? <Tooltip placement="bottom"
                            title={data.platform}
                          > <h3>核心软件更新历史</h3> </Tooltip>
                        : ''
                    }
                        <Divider/>
                        <Timeline>
                        {
                            skynet_version_data && skynet_version_data.length > 0 && skynet_version_data.map((v, i)=>{
                                return (
                                    <Timeline.Item color={v.beta === 0 ? 'green' : 'red'}
                                        key={i}
                                    >
                                        <p>{v.modified.split('.')[0]}</p>
                                        <p>V{v.version}</p>
                                        <p dangerouslySetInnerHTML={{ __html: v.comment.replace(/\n/g, '<br />') }}></p>
                                    </Timeline.Item>
                                    )
                            })
                        }
                        </Timeline>
                    </div>
                </div>
            </div>
        )
    }
}


export default GatewayUpgrade