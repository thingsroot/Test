import React, { Component } from 'react';
import ReactList from 'react-list';
import {Switch, Icon, Button, Tabs} from 'antd';
import './style.scss';
import intl from 'react-intl-universal';

class VserialLogView extends Component {
    constructor (props) {
        super(props)
        this.state = {
            ToHexFlag: true
        }
    }
    render () {
        const { mqtt } = this.props;
        const { ToHexFlag } = this.state;
        const { TabPane } = Tabs;
        const Mt15 = {
            marginTop: '15px'
        }
        const M5 = {
            marginLeft: '5px',
            marginRight: '10px'
        }
        return (
            <div className="vserial_log">
                <div style={Mt15}></div>
                <div className="vserial_log_title parent-relative">
                    <Tabs
                        type="card"
                    >
                        <TabPane
                            tab={intl.get('gateway.surveillance_message')}
                            key="1"
                        >
                        </TabPane>
                    </Tabs>
                    <div className="child-position">
                        <span>
                              ToHex
                            <Switch
                                style={M5}
                                checkedChildren={<Icon type="check" />}
                                unCheckedChildren={<Icon type="close" />}
                                checked={ToHexFlag}
                                onChange={()=>{
                                    this.setState({ToHexFlag: !ToHexFlag})
                                }}
                            />
                        </span>
                        <Button
                            calssName="button-color-gray"
                            onClick={()=>{
                                mqtt.vserial_channel.setLogView(null)
                            }}
                        >{intl.get('gateway.eliminate')}</Button>
                        {
                            mqtt.vserial_channel.LogViewFlag
                                ? <Button
                                    className="button-color-sunset"
                                    onClick={()=>{
                                        mqtt.vserial_channel.setVserialLogFlag(false)
                                    }}
                                  >{intl.get('gateway.suspend')}</Button>
                                : <Button
                                    className="button-color-daybreak"
                                    onClick={()=>{
                                        mqtt.vserial_channel.setVserialLogFlag(true)
                                    }}
                                  >{intl.get('gateway.recovery')}</Button>
                        }
                    </div>
                </div>
                <div
                    style={{height: 600, overflowY: 'auto'}}
                >
                    <div className="tableHeaders">
                        <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('common.time')}</div>
                        <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('gateway.source')}</div>
                        <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('gateway.direction')}</div>
                        <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('appitems.content')}</div>
                    </div>
                    <ReactList
                        pageSize={1}
                        ref="content"
                        axis="y"
                        type="simple"
                        length={mqtt.vserial_channel.LogView.length}
                        itemRenderer={(key)=>{
                            return (<div key={key}>
                                <div className="tableHeaders">
                                    <div>{mqtt.vserial_channel.LogView[key].time}</div>
                                    <div>{mqtt.vserial_channel.LogView[key].type}</div>
                                    <div>{mqtt.vserial_channel.LogView[key].arr}</div>
                                    <div>
                                        {
                                            !ToHexFlag
                                            ? mqtt.base64decode(mqtt.Uint8ArrayToString(mqtt.vserial_channel.LogView[key].content))
                                            : mqtt.strToHexCharCode(mqtt.base64decode(mqtt.Uint8ArrayToString(mqtt.vserial_channel.LogView[key].content)))
                                        }
                                    </div>
                                </div>
                            </div>)
                        }}
                    />
                </div>

            </div>
        );
    }
}

export default VserialLogView;