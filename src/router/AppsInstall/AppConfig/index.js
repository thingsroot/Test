import React, { Component } from 'react';
import Inst from '../Inst';
import {Button, Checkbox, Input, Modal, Select, Table, Tabs} from 'antd';
// import EditableTable from '../editorTable';
import {split as SplitEditor} from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import {Link, withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

@withRouter
@inject('store')
@observer

class AppConfig extends Component {
    state = {
        selectSection: 'socket',
        tcp: [
            {
                'name': 'ip',
                'desc': 'IP地址',
                'type': 'text',
                'value': '192.168.1.132'
            },
            {
                'name': 'host',
                'desc': '端口',
                'type': 'number',
                'value': 502
            },
            {
                'name': 'nodelay',
                'desc': 'Nodelay',
                'type': 'boolean',
                'value': true
            }
        ],
        serial: [
            {
                'name': 'tty',
                'desc': '端口',
                'type': 'dropdown',
                'value': ['ttymcx0', 'ttymcx1']
            },
            {
                'name': 'baudrate',
                'desc': '波特率',
                'type': 'dropdown',
                'value': [4800, 9600, 115200, 19200]
            },
            {
                'name': 'stop_bits',
                'desc': '停止位',
                'type': 'dropdown',
                'value': [1, 2]
            },
            {
                'name': 'data_bits',
                'desc': '数据位',
                'type': 'dropdown',
                'value': [8, 7]
            },
            {
                'name': 'flow_control',
                'desc': '流控',
                'type': 'boolean',
                'value': false
            },
            {
                'name': 'parity',
                'desc': '校验',
                'type': 'dropdown',
                'value': ['None', 'Even', 'Odd']
            }
        ],
        error: false,
        addTempLists: [
            {
                title: '名称',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <a href="javascript:;">{text}</a>
            }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
            }, {
                title: '模板ID',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '版本',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: '操作',
                render: (record) => (
                    <div>
                        <Button>
                            <Link to={`/myTemplateDetails/${record.app}/${record.name}/${record.latest_version}`}>查看</Link>
                        </Button>
                        <span style={{padding: '0 5px'}}> </span>
                        <Button
                            disabled={record.disabled}
                            onClick={()=>{
                                this.addSingleTemp(record.conf_name, record.description, record.name, record.latest_version)
                            }}
                        >添加</Button>
                    </div>
                )
            }
        ],
        addTempList: [],
        showTempLists: [
            {
                title: '名称',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <a href="javascript:;">{text}</a>
            }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
            }, {
                title: '模板ID',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '版本',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: '操作',
                key: 'app',
                render: (record) => (
                    <Button
                        onClick={()=>{
                            this.onDelete(`${record.name}`)
                        }
                        }
                    >删除</Button>
                )
            }
        ],
        showTempList: []
    };

    //添加模板
    addSingleTemp = (conf, desc, name, version)=>{
        let single = {
            conf_name: conf,
            description: desc,
            name: name,
            latest_version: version
        };
        let template = this.props.store.codeStore.template;
        template.push(conf);
        this.props.store.codeStore.setTemplate(template);
        let source = this.state.addTempList;
        source && source.length > 0 && source.map((v)=>{
            if (v.name === name) {
                v.disabled = true
            }
        });
        let data = this.state.showTempList;
        data.push(single);
        this.setState({
            showTempList: data,
            addTempList: source,
            template: template
        })
    };

    onDelete =  (name)=>{
        let dataSource = this.state.showTempList;
        dataSource.splice(name, 1);//index为获取的索引，后面的 1 是删除几行
        this.setState({
            showTempList: dataSource
        });
        let addTempList = this.state.addTempList;
        addTempList && addTempList.length > 0 && addTempList.map((v)=>{
            if (v.name === name) {
                v.disabled = false;
            }
        });
        this.setState({
            addTempList: addTempList
        })
    };

    inputChange = (refName)=>{
        this.refs[refName].value = event.target.value
    };

    checkedChange = (refName)=>{
        this.refs[refName].value = event.target.checked
    };

    selectChangeValue = (refName)=>{
        this.refs[refName].value = event.target.innerText
    };

    callback = (key)=>{
        const { errorCode } = this.props.store.codeStore;
        if (key === '1') {
            this.props.store.codeStore.setActiveKey(key);
        } else if (key === '2') {
            this.props.store.codeStore.setActiveKey(key);
        }

        if (errorCode === true || this.state.config === 0) {
            this.props.store.codeStore.setReadOnly(false);
        } else if (this.state.config && this.state.config > 0 || errorCode === false) {
            this.getData();
        }
    };

    render () {
        const { serial, tcp, addTempLists, showTempLists, showTempList, addTempList } = this.state;
        const { errorCode, installConfiguration } = this.props.store.codeStore;
        let { config, deviceColumns } = this.props;
        console.log(config);
        console.log(deviceColumns);

        return (
            <Tabs
                activeKey={this.props.store.codeStore.activeKey}
                onChange={this.callback}
                type="card"
            >
                <TabPane
                    tab="配置面板"
                    key="1"
                >
                    <Inst
                        sn={this.props.match.params.sn}
                    />
                    <div
                        style={errorCode ? none : block}
                    >
                        {
                            config && config.length > 0 && config.map((v, key) => {
                                if (v.type === 'section') {
                                    if (v.name === 'serial_section') {
                                        return (
                                            <div
                                                id={v.name}
                                                key={key}
                                                style={this.state.selectSection === 'serial' ? block : none}
                                            >
                                                <p className="sectionName">
                                                                <span
                                                                    style={{padding: '0 5px'}}
                                                                >|</span>{v.desc}</p>
                                                {
                                                    serial && serial.length > 0 && serial.map((a, index) => {
                                                        if (a.type === 'dropdown') {
                                                            return (
                                                                <div
                                                                    style={{lineHeight: '50px'}}
                                                                    key={index}
                                                                >
                                                                                <span
                                                                                    className="spanStyle"
                                                                                >{a.desc}</span>
                                                                    <Select
                                                                        defaultValue={a.value ? a.value[0] : ''}
                                                                        style={{width: 300}}
                                                                        onChange={() => {
                                                                            this.selectChangeValue(a.name)
                                                                        }}
                                                                    >
                                                                        {a.value && a.value.length > 0 && a.value.map(b => {
                                                                            return (
                                                                                <Option
                                                                                    key={b}
                                                                                >{b}</Option>
                                                                            )
                                                                        })}
                                                                    </Select>
                                                                    <Input
                                                                        ref={a.name}
                                                                        type="hidden"
                                                                        value={a.value ? a.value[0] : ''}
                                                                    />
                                                                </div>
                                                            )
                                                        } else {
                                                            return (
                                                                <div
                                                                    style={{lineHeight: '50px'}}
                                                                    key={index}
                                                                >
                                                                                <span
                                                                                    className="spanStyle"
                                                                                >{a.desc}</span>
                                                                    <Checkbox
                                                                        defaultChecked={a.value}
                                                                        onChange={
                                                                            () => {
                                                                                this.checkedChange(a.name)
                                                                            }
                                                                        }
                                                                    >
                                                                    </Checkbox>
                                                                    <Input
                                                                        ref={a.name}
                                                                        type="hidden"
                                                                        value={a.value}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    })
                                                }
                                            </div>
                                        )
                                    } else if (v.name === 'tcp_section') {
                                        return (
                                            <div
                                                id={v.name}
                                                key={key}
                                                style={this.state.selectSection === 'socket' ? block : none}
                                            >
                                                <p className="sectionName">
                                                                <span
                                                                    style={{padding: '0 5px'}}
                                                                >|</span>{v.desc}</p>
                                                {
                                                    tcp && tcp.length > 0 && tcp.map((a, index) => {
                                                        if (a.type === 'boolean') {
                                                            return (
                                                                <div
                                                                    style={{lineHeight: '50px'}}
                                                                    key={index}
                                                                >
                                                                                <span
                                                                                    className="spanStyle"
                                                                                >{a.desc}</span>
                                                                    <Checkbox
                                                                        defaultChecked={a.value}
                                                                        onChange={
                                                                            () => {
                                                                                this.checkedChange(a.name)
                                                                            }
                                                                        }
                                                                    >
                                                                    </Checkbox>
                                                                    <Input
                                                                        ref={a.name}
                                                                        type="hidden"
                                                                        value={a.value}
                                                                    />
                                                                </div>
                                                            )
                                                        } else {
                                                            return (
                                                                <div
                                                                    style={{lineHeight: '50px'}}
                                                                    key={index}
                                                                >
                                                                                <span
                                                                                    className="spanStyle"
                                                                                >{a.desc}</span>

                                                                    <Input
                                                                        style={{width: 320}}
                                                                        ref={a.name}
                                                                        type={a.type}
                                                                        defaultValue={a.value}
                                                                        onChange={()=>{
                                                                            this.inputChange(a.name)
                                                                        }}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    })
                                                }
                                            </div>
                                        )
                                    }
                                } else if (v.type === 'templates') {
                                    return (
                                        <div
                                            id={v.name}
                                            key={key}
                                        >
                                            <p className="sectionName">
                                                                <span
                                                                    style={{padding: '0 5px'}}
                                                                >|</span>{v.desc}</p>
                                            <Table
                                                rowKey="name"
                                                dataSource={showTempList}
                                                columns={showTempLists}
                                                pagination={false}
                                                style={showTempList.length > 0 ? block : none}
                                            />
                                            <Button
                                                onClick={this.templateShow}
                                                style={{margin: '10px 0'}}
                                                disabled={addTempList && addTempList.length > 0 ? false : true}
                                            >
                                                {addTempList && addTempList.length > 0 ? '添加模板' : '此应用下暂时没有模板'}
                                            </Button>
                                            <Modal
                                                title="添加模板"
                                                visible={this.state.isTemplateShow}
                                                onOk={this.handleCancelAddTempList}
                                                onCancel={this.handleCancelAddTempList}
                                                wrapClassName={'tableModal'}
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <Table
                                                    rowKey="name"
                                                    dataSource={addTempList ? addTempList : []}
                                                    columns={addTempLists}
                                                    pagination={false}
                                                />
                                            </Modal>
                                        </div>
                                    )
                                } else if ( v.type === 'table') {
                                    return (
                                        <div
                                            id={v.name}
                                            key={key}
                                        >
                                            {
                                                v.child && v.child.length > 0 && v.child.map((w, index)=>{
                                                    return (
                                                        <div
                                                            id={w.name}
                                                            key={index}
                                                        >
                                                            <p className="sectionName">
                                                                                <span
                                                                                    style={{padding: '0 5px'}}
                                                                                >|</span>{w.desc}</p>
                                                            {console.log(w.name)}
                                                            {console.log(deviceColumns[w.name])}
                                                            {/*<EditableTable*/}
                                                            {/*    tableName={w.name}*/}
                                                            {/*    deviceColumns={deviceColumns[w.name]}*/}
                                                            {/*/>*/}
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                } else if (v.type === 'dropdown') {
                                    return (
                                        <div
                                            id={v.name}
                                            key={key}
                                        >
                                            <div style={{lineHeight: '50px'}}>
                                                <span className="spanStyle">{v.desc}：</span>
                                                <Select
                                                    defaultValue={v.value ? v.value[0] : ''}
                                                    style={{width: 300}}
                                                    onChange={this.protocolChange}
                                                >
                                                    {console.log(v.value)}
                                                    {v.value && v.value.length > 0 && v.value.map(w => <Option key={w}>{w}</Option>)}
                                                </Select>
                                                <Input
                                                    type="hidden"
                                                    value={v.value ? v.value[0] : ''}
                                                    ref={v.name}
                                                />
                                            </div>
                                        </div>
                                    )
                                } else if (v.type === 'text' || v.type === 'number') {
                                    return (
                                        <div
                                            id={v.name}
                                            key={key}
                                        >
                                            <div style={{lineHeight: '50px'}}>
                                                <span className="spanStyle">{v.desc}：</span>
                                                <Input
                                                    style={{width: '300px'}}
                                                    type={v.type}
                                                    defaultValue={v.value === undefined ? '' : v.value}
                                                    ref={v.name}
                                                    onChange={()=>{
                                                        this.inputChange(v.name)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                    <div
                        style={errorCode ? block : none}
                        className="message"
                    >
                        数据错误，请使用JSON格式配置！
                    </div>
                    <div style={config && config.length > 0 ? none : block}>
                        <p
                            className="message"
                        >此应用不支持配置界面 请使用JSON格式配置</p>
                    </div>
                    <Button
                        type="primary"
                        style={errorCode === true || config.length <= 0 ? none : block}
                        onClick={this.submitData}
                    >提交</Button>
                </TabPane>
                <TabPane
                    tab="JSON源码"
                    key="2"
                >
                    <Inst
                        sn={this.props.match.params.sn}
                    />
                    <div className="editorInfo">
                        <p style={{lineHeight: '40px'}}>
                            编辑器状态：
                            <span>{this.props.store.codeStore.readOnly ? '不可编辑' : '可编辑'}</span>
                        </p>
                    </div>
                    <SplitEditor
                        style={{width: '100%'}}
                        mode="json"
                        theme="github"
                        splits={1}
                        autoFocus="true"
                        onChange={this.onChange}
                        value={typeof installConfiguration === 'string' ? [installConfiguration]
                            : [JSON.stringify(installConfiguration)]}
                        fontSize={16}
                        readOnly={this.props.store.codeStore.readOnly}
                        name="UNIQUE_ID_OF_DIV"
                        editorProps={{$blockScrolling: true}}
                    />
                    <Button
                        type="primary"
                        onClick={this.submitData}
                    >提交</Button>
                </TabPane>
            </Tabs>
        );
    }
}

export default AppConfig;