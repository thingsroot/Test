import React, { Component } from 'react';
import { inject, observer} from 'mobx-react';
import { Button, Icon, Timeline, Tooltip, Switch, Card } from 'antd';


@inject('store')
@observer
class GatewayUpgrade extends Component {
    state = {
        with_skynet: true
    }
    render () {
        const { actionEnable, data } = this.props.store.gatewayInfo;
        const { freeioe_latest_version, skynet_latest_version, upgrading, version_data, skynet_version_data } = this.props;
        const { onCheckUpgrade, onUpgrade, onClose } = this.props;
        let freeioe_upgradable = data.version !== undefined && freeioe_latest_version !== undefined && data.version < freeioe_latest_version;
        let skynet_upgradable = data.skynet_version !== undefined && skynet_latest_version !== undefined && data.skynet_version < skynet_latest_version;
        return (
            <Card
                title="固件升级"
                bordered={false}
                extra={
                    <Button
                        onClick={onClose}
                    >X</Button>}
                style={{ width: '100%' }}
            >
                <div className="title">
                    <div>
                        <div className="Icon">
                            <Icon type="setting" />
                        </div>
                        <div>
                            <h3>业务软件(FreeIOE)</h3>
                            <p>
                                <span> 当前版本: {data.version}  </span>
                            </p>
                            <span>
                                {freeioe_upgradable ? '可升级至: ' + freeioe_latest_version : '已经是最新版'}
                            </span>
                        </div>
                        <div style={{display: 'flex'}}>
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
                                    <span> 当前版本: {data.skynet_version} </span>
                                </p>
                                <span>
                                    {skynet_upgradable ? '可升级至: ' + skynet_latest_version : '已经是最新版'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {
                        freeioe_upgradable || (skynet_upgradable && (parseInt(data.version) > 1204))
                        ? <Button
                            type="primary"
                            disabled={upgrading || !actionEnable}
                            onClick={()=>{
                                if (freeioe_upgradable) {
                                    let skynet_version = skynet_upgradable && this.state.with_skynet ? skynet_latest_version : undefined
                                    onUpgrade(freeioe_latest_version, skynet_version)
                                } else {
                                    if (skynet_upgradable) {
                                        onUpgrade(undefined, skynet_latest_version)
                                    }
                                }
                            }}
                          >
                        {
                            freeioe_upgradable && skynet_upgradable ?  ( this.state.with_skynet ? '升级软件' : '升级业务软件' ) : null
                        }
                        {
                            freeioe_upgradable && !skynet_upgradable ?  '升级软件' : null
                        }
                        {
                            !freeioe_upgradable && skynet_upgradable ?  '升级核心软件' : null
                        }
                        </Button> : <Button onClick={onCheckUpgrade}>检查更新</Button>
                    }
                    {
                        freeioe_upgradable && skynet_upgradable
                        ? <Switch
                            style={{marginLeft: 140}}
                            checkedChildren="ON&nbsp;"
                            unCheckedChildren="OFF"
                            checked={this.state.with_skynet}
                            onChange={()=>{
                                this.setState({with_skynet: !this.state.with_skynet})
                            }}
                          /> : null
                    }
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', paddingTop: '5px'}}>
                    {
                        freeioe_upgradable
                        ? <Card
                            title="业务软件更新历史"
                            bordered={false}
                            style={{width: '50%'}}
                          >
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
                        </Card> : <div style={{width: '50%', padding: 10, boxSizing: 'border-box'}}></div>
                    }
                    {
                        skynet_upgradable
                        ? <Card
                            title={
                                <Tooltip placement="bottom"
                                    title={data.platform}
                                >核心软件更新历史</Tooltip>
                            }
                            bordered={false}
                            style={{width: '50%'}}
                          >
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
                        </Card> : null
                    }
                </div>
            </Card>
        )
    }
}


export default GatewayUpgrade