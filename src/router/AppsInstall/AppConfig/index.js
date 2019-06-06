import React, { Component } from 'react';
import Inst from '../Inst';
import {Button, Checkbox, Input, Modal, Select, Table, Tabs} from 'antd';
import EditableTable from '../editorTable';
import {split as SplitEditor} from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import {Link, withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
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
    constructor (props) {
        super(props);
        this.state = {
            addTempLists: [
                {
                    title: '名称',
                    width: '20%',
                    dataIndex: 'conf_name',
                    key: 'conf_name',
                    render: text => <span>{text}</span>
                }, {
                    title: '描述',
                    width: '20%',
                    dataIndex: 'description',
                    key: 'description'
                }, {
                    title: '模板ID',
                    width: '20%',
                    dataIndex: 'name',
                    key: 'name'
                }, {
                    title: '版本',
                    width: '20%',
                    key: 'latest_version',
                    dataIndex: 'latest_version'
                }, {
                    title: '操作',
                    width: '20%',
                    render: (record) => (
                        <span>
                        <Button>
                            <Link to={`/myTemplateDetails/${record.app}/${record.name}/${record.latest_version}`}>查看</Link>
                        </Button>
                        <span style={{padding: '0 5px'}}> </span>
                        <Button
                            disabled={record.disabled}
                            onClick={()=>{
                                this.addSingleTemp(record.conf_name, record.description, record.name, record.latest_version)
                            }}
                        >选择</Button>
                    </span>
                    )
                }
            ],
            addTempList: [],
            showTempLists: [
                {
                    title: '名称',
                    dataIndex: 'conf_name',
                    key: 'conf_name',
                    render: text => <span>{text}</span>
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
            showTempList: [],
            selectSection: 'socket',
            isTemplateShow: false,
            config: [],
            deviceColumns: [],
            keys: [],
            readOnly: false,
            item: {}
        };
    }

    componentDidMount () {
        http.get('/api/store_configurations_list?app=' + this.props.match.params.app + '&conf_type=Template')
            .then(res=>{
                this.setState({
                    addTempList: res.data
                });
            });
        http.get('/api/user_configuration_list?app=' + this.props.match.params.app)
            .then(res=>{
                let list = this.state.addTempList;
                res.message && res.message.length > 0 && res.message.map((item)=>{
                    list.push(item)
                });
                this.setState({
                    addTempList: list
                });
            });
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        this.setState({
            item: nextProps.item
        });
        if (nextProps.item !== undefined) {
            this.getConfig(nextProps.item)
        }
    }

    getConfig = (val)=>{
        this.props.store.codeStore.setErrorCode(false);
        this.props.store.codeStore.setInstallConfiguration('');
        this.props.store.codeStore.setInstNames('');
        let config = [];
        if (JSON.stringify(val) !== '{}' && val !== 'undefined') {
            if (val.conf_template && val.conf_template[0] === '[') {
                config = JSON.parse(val.conf_template);
                this.setState({
                    config: config
                });
                let deviceColumns = [];
                let tableName = [];  //存放表名
                let dataSource = {};
                let keys = [];
                config && config.length > 0 && config.map((v, key)=>{
                    keys.push(v);
                    key;
                    if (v.type === 'templates' ||
                        v.type === 'text' ||
                        v.type === 'number' ||
                        v.type === 'dropdown' ||
                        v.type === 'section' &&
                        v.child === undefined
                    ) {
                        this.props.store.codeStore.setActiveKey('1');
                    } else if (v.type === 'table' && v.child !== undefined) {
                        this.props.store.codeStore.setActiveKey('1');
                    } else {
                        this.props.store.codeStore.setInstallConfiguration(val.pre_configuration === null ? '{}' : val.pre_configuration);
                        this.props.store.codeStore.setReadOnly(false);
                        this.props.store.codeStore.setErrorCode(true);
                        this.props.store.codeStore.setActiveKey('2');
                        console.log(this.props.store.codeStore.installConfiguration)
                    }
                    if (v.name === 'device_section') {
                        let tableNameData = {};
                        v.child && v.child.length && v.child.map((w, key1)=>{
                            tableNameData[w.name] = [];
                            key1;
                            let arr = [];
                            w.cols.map((i, key2)=>{
                                key2;
                                arr.push({
                                    key: key2,
                                    name: i.name,
                                    desc: i.desc,
                                    type: i.type
                                });
                            });
                            tableName.push(w.name);
                            deviceColumns.push({
                                [w.name]: arr
                            });
                        });
                        let columnsArr = [];
                        deviceColumns && deviceColumns.length > 0 && deviceColumns.map((v, key)=>{
                            key;
                            let data = [];
                            let name = tableName[key];
                            v[name].map((w, indexW)=>{
                                data.push({
                                    key: indexW,
                                    id: w.type,
                                    title: w.desc,
                                    dataIndex: w.name,
                                    editable: true
                                });
                            });
                            columnsArr.push({[tableName[key]]: data})
                        });
                        let obj = {};
                        columnsArr.map((item)=>{
                            obj[Object.keys(item)] = Object.values(item)
                        });
                        console.log(obj)
                        this.setState({
                            deviceColumns: obj
                        }, ()=>{
                            console.log(this.state.deviceColumns)
                        });
                        this.props.store.codeStore.setAllTableData(tableNameData);
                    }
                });
                //设置store存储数据
                tableName && tableName.length > 0 && tableName.map((w)=>{
                    dataSource[w] = [];
                });
                this.props.store.codeStore.setDataSource(dataSource);
                this.setState({
                    config: config,
                    // deviceColumns: obj,
                    keys: keys
                });
            }
        } else if (val.conf_template === null) {
            this.props.store.codeStore.setInstallConfiguration('{}');
        }

        if (this.props.match.params.type === '2') {
            this.setState({
                flag: false,
                detail: false
            });
            this.props.store.codeStore.setActiveKey('2');
            this.props.store.codeStore.setInstallConfiguration(val.pre_configuration === null ? '{}' : val.pre_configuration);
        }
        this.props.store.codeStore.setInstallConfiguration(val.pre_configuration === null ? '{}' : val.pre_configuration);
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
        let a = [];
        dataSource && dataSource.length > 0 && dataSource.map((item)=>{
            a.push(item.conf_name)
        });
        this.props.store.codeStore.setTemplate(a);
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
        this.refs[refName].state.value = event.target.value
    };

    checkedChange = (refName)=>{
        this.refs[refName].state.value = event.target.checked
    };

    selectChangeValue = (refName)=>{
        this.refs[refName].state.value = event.target.innerText;
    };

    getData = ()=>{
        const { tcp, serial } = this.props.store.codeStore;
        const { selectSection, keys } = this.state;
        let sourceCodeData = {};
        keys && keys.length > 0 && keys.map((item, key)=>{
            key;
            if (item.name === 'Link_type') {
                let data = [];
                if (selectSection === 'socket') {
                    tcp.map((v, key)=>{
                        key;
                        data.push({
                            [v.name]: this.refs[v.name].state.value === undefined ? v.value : this.refs[v.name].state.value
                        })
                    });
                    sourceCodeData['socket'] = data;
                } else if (selectSection === 'serial') {
                    serial.map((v, key)=>{
                        key;
                        if (v.value[0] === undefined) {
                            data.push({
                                [v.name]: this.refs[v.name].state.value === undefined ? v.value : this.refs[v.name].state.value
                            })
                        } else {
                            data.push({
                                [v.name]: this.refs[v.name].state.value === undefined ? v.value[0] : this.refs[v.name].state.value
                            })
                        }
                    });
                    sourceCodeData['serial'] = data;
                }
            } else if (item.type === 'table') {
                sourceCodeData[item.name] = this.props.store.codeStore.allTableData;
            } else if (item.type === 'templates') {
                sourceCodeData[item.name] = {};
            } else if (item.type === 'dropdown') {
                sourceCodeData[item.name] = this.refs[item.name].state.value === undefined ? item.value[0] : this.refs[item.name].state.value;
            } else if (item.type === 'number' || item.type === 'text') {
                sourceCodeData[item.name] = this.refs[item.name].state.value === undefined ? item.value : this.refs[item.name].state.value
            }
        });

        if (JSON.stringify(sourceCodeData) !== '{}') {
            this.props.store.codeStore.setInstallConfiguration(JSON.stringify(sourceCodeData))
        }
    };

    submitData = ()=>{
        if (this.props.store.codeStore.readOnly) {
            this.getData()
        }
        this.props.submitData();
    };

    callback = (key)=>{
        const { errorCode } = this.props.store.codeStore;
        if (key === '1') {
            this.props.store.codeStore.setActiveKey(key);
        } else if (key === '2') {
            this.props.store.codeStore.setActiveKey(key);
        }
        if (errorCode === true) {
            this.props.store.codeStore.setReadOnly(false);
            this.props.store.codeStore.setInstallConfiguration('{}');
        } else if (this.props.config && this.props.config.length > 0 || errorCode === false) {
            this.props.store.codeStore.setReadOnly(true);
            this.getData();
        }
    };

    protocolChange = (val)=>{   //通讯
        if (val === 'serial') {
            this.setState({
                selectSection: 'serial'
            });
        } else if (val === 'socket') {
            this.setState({
                selectSection: val
            });
        }
    };

    templateShow = ()=>{
        this.setState({
            isTemplateShow: true
        })
    };

    handleCancelAddTempList = ()=>{
        this.setState({
            isTemplateShow: false
        })
    };

    addNew = (app)=>{
        const w = window.open('about: blank');
        w.location.href = '/myappdetails/' + app + '/3'
    };

    onChange = (value)=>{
        this.props.store.codeStore.setInstallConfiguration(value[0])
    };

    render () {
        const { config, deviceColumns, addTempLists, showTempLists, showTempList, selectSection, addTempList } = this.state;
        const { errorCode, installConfiguration, serial, tcp, activeKey } = this.props.store.codeStore;
        let { app } = this.props;
        console.log(this.props.item)
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
                        name={name}
                        sn={this.props.match.params.sn}
                    />
                    <div
                        ref="content"
                        style={errorCode === false ? block : none}
                    >
                        {console.log(config)}
                        {
                            config && config.length > 0 && config.map((v, key) => {
                                if (v.type === 'section') {
                                    if (v.name === 'serial_section') {
                                        return (
                                            <div
                                                id={v.name}
                                                key={key}
                                                style={selectSection === 'serial' ? block : none}
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
                                                style={selectSection === 'socket' ? block : none}
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
                                            >
                                                选择模板
                                            </Button>
                                            <Modal
                                                title="选择模板"
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
                                                    scroll={{ y: 240 }}
                                                />
                                                <Button
                                                    type="primary"
                                                    style={{float: 'right', marginTop: '20px'}}
                                                    onClick={()=>{
                                                        this.addNew(app)
                                                    }}
                                                >
                                                    添加模板
                                                </Button>
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
                                                                <EditableTable
                                                                    tableName={w.name}
                                                                    deviceColumns={deviceColumns[w.name]}
                                                                />

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
                        style={errorCode === false ? none : block}
                        className="message"
                    >
                        数据错误，请使用JSON格式配置！
                    </div>
                    <div style={config && config.length > 0 ? none : block}>
                        <p
                            className="message"
                        >此应用不支持配置界面 请使用JSON格式配置</p>
                    </div>
                    <br/>
                    <Button
                        type="primary"
                        style={errorCode === true || config.length === 0 ? none : block}
                        onClick={this.submitData}
                        disabled={this.props.disabled}
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
                    {
                        activeKey === '2'
                            ? <SplitEditor
                                style={{width: '100%'}}
                                mode="json"
                                theme="github"
                                splits={1}
                                onChange={this.onChange}
                                value={typeof installConfiguration === 'string' ? [installConfiguration]
                                    : [JSON.stringify(installConfiguration)]}
                                fontSize={16}
                                readOnly={this.props.store.codeStore.readOnly}
                                name="UNIQUE_ID_OF_DIV"
                                editorProps={{$blockScrolling: true}}
                            />
                            : ''
                    }
                    <br/>
                    <Button
                        type="primary"
                        disabled={this.props.disabled}
                        onClick={this.submitData}
                    >提交</Button>
                </TabPane>
            </Tabs>
        );
    }
}

export default AppConfig;