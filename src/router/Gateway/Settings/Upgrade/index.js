import React, { Component } from 'react';
import { inject, observer} from 'mobx-react';
import { Button, Icon, Timeline, Tooltip, Switch, Card } from 'antd';
import intl from 'react-intl-universal';


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
                title={intl.get('gateway.firmware_update')}
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
                            <h3>{intl.get('gateway.business_software')}(FreeIOE)</h3>
                            <p>
                                <span> {intl.get('gateway.current_version')}: {data.version}  </span>
                            </p>
                            <span>
                                {freeioe_upgradable ?  `${intl.get('gateway.scalable_to')}: ` + freeioe_latest_version : intl.get('gateway.Its_the_latest_version')}
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
                                > <h3>{intl.get('gateway.core_software')}(SKYNET)</h3> </Tooltip>
                                <p>
                                    <span> {intl.get('gateway.current_version')}: {data.skynet_version} </span>
                                </p>
                                <span>
                                    {skynet_upgradable ? `${intl.get('gateway.scalable_to')}: ` + skynet_latest_version : intl.get('gateway.Its_the_latest_version')}
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
                            freeioe_upgradable && skynet_upgradable ?  ( this.state.with_skynet ? intl.get('gateway.upgrade_software') : intl.get('gateway.upgrade_business_software') ) : null
                        }
                        {
                            freeioe_upgradable && !skynet_upgradable ?  intl.get('gateway.upgrade_software') : null
                        }
                        {
                            !freeioe_upgradable && skynet_upgradable ?  intl.get('gateway.upgrade_core_software') : null
                        }
                        </Button> : <Button onClick={onCheckUpgrade}>{intl.get('gateway.check_update')}</Button>
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
                            title={intl.get('gateway.business_software_update_history')}
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
                                >{intl.get('gateway.core_software_update_history')}</Tooltip>
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