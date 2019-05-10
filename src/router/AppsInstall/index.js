import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Select, Input, Rate, Icon, Button, Tabs, Table, Modal, Checkbox, message, notification  } from 'antd';
import { inject, observer} from 'mobx-react';
import Status from '../../common/status';
import http from '../../utils/Server';
import marked from 'marked';
import highlight from 'highlight.js';
import 'highlight.js/styles/github.css';
import './style.scss';
import Nav from './Nav';
import { split as SplitEditor} from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import EditableTable from './editorTable';
import Inst from './Inst';
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const Option = Select.Option;
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};
const block = {
    display: 'block'
};
const none = {
    display: 'none'
};
@withRouter
@inject('store')
@observer
class MyGatesAppsInstall extends Component {
    state = {
        error: false,
        app: '',
        vendor: [],
        agreement: [],
        type: [],
        data: [],
        flag: true,
        item: {},
        detail: true,
        filter: {
            ventor: '',
            agreement: '',
            type: ''
        },
        instName: null,
        config: [],
        isTemplateShow: false,
        addTempList: [],
        showTempList: [],
        deviceList: [],
        object: {},
        editingKey: '',
        selectSection: 'socket',   //socket :false     serial: true
        deviceColumns: [],
        deviceSource: [],
        SourceCode: [],
        dataSourceCode: [],
        errorMessage: '',
        addTempLists: [{
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
        }],
        showTempLists: [{
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
        }],
        tcp: [
            {
                'name': 'ip',
                'desc': 'IP地址',
                'type': 'text',
                'value': '192.168.1.132'
            },
            {
                'name': 'port',
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
        keys: [],
        configuration: '',
        activeKey: '1'
    };

    componentDidMount (){
        if (this.props.match.params.type === '1') {
            http.get('/api/store_list').then(res=>{
                this.setState({
                    data: res.data,
                    filterdata: res.data
                })
            });
            marked.setOptions({
                renderer: new marked.Renderer(),
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false,
                xhtml: false,
                highlight: (code) =>  highlight.highlightAuto(code).value // 这段代码
            });
        } else if (this.props.match.params.type === '2') {
            http.get('/api/applications_details?name=' + this.props.match.params.app).then(res=>{
                this.getConfig(res.data)
            })

        }
    }

    shouldComponentUpdate (nextProps, nextState){
        if (nextState.item.description && nextState.item.description !== null){
            document.getElementById('box').innerHTML = marked(nextState.item.description)
        }
        return true;
    }

    searchApp (value){
        let { filterdata } = this.state;
        let newdata = [];
        newdata = filterdata.filter((item)=>item.app_name.indexOf(value) !== -1);
        this.setState({
            data: newdata
        })
    }

    onChange = (newValue)=>{
        this.setState({
            configuration: newValue[0]
        })
    };
    //添加模板
    templateShow = ()=>{
        this.setState({
            isTemplateShow: true
        });
    };

    handleCancelAddTempList = ()=>{
        this.setState({
            isTemplateShow: false
        })
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

    //添加模板
    addSingleTemp = (conf, desc, name, version)=>{
        let single = {
            conf_name: conf,
            description: desc,
            name: name,
            latest_version: version
        };
        let template = this.props.store.codeStore.template;
        template.push(conf)
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

    getConfig = (val)=>{
        this.setState({
            error: false,
            configuration: '',
            activeKey: '1'
        });
        this.props.store.codeStore.setInstNames('');
        let config = [];
        if (val.conf_template) {
            let con = val.conf_template.replace(/[\r\n]/g, '');
            let cons = con.replace(/\s+/g, '');
            config = JSON.parse(cons);
        }
        let deviceColumns = [];
        let tableName = [];  //存放表名
        let dataSource = {};
        let keys = [];
        config && config.length > 0 && config.map((v, key)=>{
            keys.push(v);
            key;
            if (v.type !== 'templates' ||
                v.type !== 'table' ||
                v.type !== 'text' ||
                v.type !== 'number' ||
                v.type !== 'dropdown'
            ) {
                this.setState({
                    error: true
                });
                this.props.store.codeStore.setReadOnly(false)
            }
            if (v.child === undefined) {
                this.setState({
                    error: true
                });
                this.props.store.codeStore.setReadOnly(false)
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
                    })
                });
                this.props.store.codeStore.setAllTableData(tableNameData);
            }
        });
        //设置store存储数据
        tableName && tableName.length > 0 && tableName.map((w)=>{
            dataSource[w] = [];
        });
        this.props.store.codeStore.setDataSource(dataSource);
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
        http.get('/api/application_configurations_list?app=' + val.name + '&conf_type=Template').then(res=>{
            this.setState({
                addTempList: res.data
            })
        });
        this.setState({
            flag: false,
            item: val,
            configuration: val.pre_configuration,
            detail: true,
            config: config,
            deviceColumns: obj,
            keys: keys,
            app: val.name
        });
        if (this.props.match.params.type === '2') {
            this.setState({
                flag: false,
                detail: false
            })
        }
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

    getData = ()=>{
        const { tcp, serial, selectSection, keys } = this.state;
        let sourceCodeData = {};
        keys.map((item, key)=>{
            key;
            if (item.name === 'Link_type') {
                let data = [];
                if (selectSection === 'socket') {
                    tcp.map((v, key)=>{
                        key;
                        data.push({
                            [v.name]: this.refs[v.name].value === undefined ? v.value : this.refs[v.name].value
                        })
                    });
                    sourceCodeData['socket'] = data;
                } else if (selectSection === 'serial') {
                    serial.map((v, key)=>{
                        key;
                        if (v.value[0] === undefined) {
                            data.push({
                                [v.name]: this.refs[v.name].value === undefined ? v.value : this.refs[v.name].value
                            })
                        } else {
                            data.push({
                                [v.name]: this.refs[v.name].value === undefined ? v.value[0] : this.refs[v.name].value
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
                sourceCodeData[item.name] = this.refs[item.name].value === undefined ? item.value[0] : this.refs[item.name].value;
            } else if (item.type === 'number' || item.type === 'text') {
                sourceCodeData[item.name] = this.refs[item.name].value === undefined ? item.value : this.refs[item.name].value
            }
        });
        if (JSON.stringify(sourceCodeData) !== '{}') {
            this.setState({
                configuration: JSON.stringify(sourceCodeData)
            })
        }

    };

    submitData = ()=>{
        this.getData();
        let { configuration, app } = this.state;
        let sn = this.props.match.params.sn;
        let version = 0;
        http.get('/api/applications_versions_latest?app=' + app).then(res=>{
            version = res.data;
            if (version > 0) {
                let params = {
                    gateway: sn,
                    inst: this.props.store.codeStore.instNames,
                    app: app,
                    version: version,
                    conf: configuration,
                    id: 'app_install/' + sn + '/' + this.props.store.codeStore.instNames + '/' + app
                };
                if (this.props.store.codeStore.instNames === '' || this.props.store.codeStore.instNames === undefined) {
                    message.error('实例名不能为空！')
                }
                http.post('/api/gateways_applications_install', params).then(res=>{
                    openNotification('提交任务成功', '网关' + sn + '安装' + this.props.store.codeStore.instNames + '应用.');
                    let max = 18000;
                    let min = 0;
                    if (res.ok === true) {
                        if (min > max) {
                            openNotification('安装应用' + this.props.store.codeStore.instNames + '失败', '错误：' + res.data.message)
                        } else {
                            let timer = setInterval(()=>{
                                min += 5000;
                                setTimeout(()=>{
                                    http.get('/api/gateways_exec_result?id=' + res.data.data)
                                        .then(res=>{
                                            if (JSON.stringify(res) !== '{}') {
                                                if (res.data.result === true) {
                                                    openNotification('安装应用' + this.props.store.codeStore.instNames + '成功', '' + res.data.id);
                                                    clearInterval(timer);
                                                } else if (res.data.result === false) {
                                                    openNotification('安装应用' + this.props.store.codeStore.instNames + '失败', '' + res.data.message);
                                                    clearInterval(timer);
                                                }
                                            }
                                        })
                                }, 1000)
                            }, 5000)
                        }
                    } else {
                        openNotification('安装应用' + this.refs.inst.value + '失败', '' + res.data.message);
                    }
                })
            } else {
                message.error('应用暂时没有正式版本，无法安装！')
            }
        });
    };

    callback = (key)=>{
        if (key === '1') {
            this.setState({
                activeKey: '1'
            })
        } else {
            this.setState({
                activeKey: '2'
            })
        }
        if (this.state.error === true || this.state.config.length === 0) {
            this.props.store.codeStore.setReadOnly(false);
        } else if (this.state.config && this.state.config.length > 0 || this.state.error === false) {
            this.getData();
        }
    };

    render () {
        const { data, flag, item, detail, showTempLists, serial, tcp, error,
            addTempLists, showTempList, config, addTempList} = this.state;
        return (<div>
            <Status />
                <div className="AppInstall">
                    <Nav />
                    <div className={flag ? 'hide appsdetail' : 'show appsdetail'}>
                    <Button
                        className="installbtn"
                        type="primary"
                        onClick={()=>{
                            this.setState({detail: !detail})
                        }}
                    >
                        {
                            detail ? '安装到网关' : '查看应用描述'
                        }
                    </Button>
                        <Icon
                            type="rollback"
                            className="back"
                            onClick={()=>{
                                this.setState({
                                    flag: true
                                })
                        }}
                        />
                        <h2 style={{borderBottom: '1px solid #ccc', padding: 10}}>{item.app_name}</h2>
                        <div className={detail ? 'show' : 'hide'}>
                            <div style={{display: 'flex' }}>
                                {
                                    item.icon_image
                                    ? <img src={'http://ioe.thingsroot.com/' + item.icon_image}
                                        alt=""
                                        style={{width: 128, height: 128}}
                                      />
                                    : ''
                                }
                                <div style={{display: 'flex', paddingTop: 20, paddingLeft: 20}}>
                                    <div style={{width: 500}}
                                        className="detail"
                                    >
                                        <p>发布者： {item.app_name_unique}</p>
                                        <p>通讯协议: {item.protocol}</p>
                                        <p>适配型号： {item.device_serial}</p>
                                    </div>
                                    <div  className="detail">
                                        <p>应用分类： {item.category}</p>
                                        <p>设备厂家: {item.device_supplier}</p>
                                        <p>应用价格： 免费</p>
                                    </div>
                                </div>
                            </div>
                            <div id="box"
                                style={{marginTop: 20}}
                            >
                                markdown
                            </div>
                        </div>
                        <div className={detail ? 'installapp hide' : 'installapp show'}>
                        <Tabs
                            defaultActiveKey={this.state.activeKey}
                            onChange={this.callback}
                            type="card"
                        >
                            <TabPane tab="配置面板"
                                key="1"
                            >
                                <Inst
                                    sn={this.props.match.params.sn}
                                    onChange={this.instChange}
                                    onBlur={this.instBlur}
                                />
                                <div
                                    style={this.state.error ? none : block}
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
                                                                        <EditableTable
                                                                            tableName={w.name}
                                                                            deviceColumns={this.state.deviceColumns[w.name]}
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
                                    style={this.state.error ? block : none}
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
                                    style={error === true || config.length <= 0 ? none : block}
                                    onClick={this.submitData}
                                >提交</Button>
                            </TabPane>
                            <TabPane tab="JSON源码"
                                key="2"
                            >
                                <Inst
                                    sn={this.props.match.params.sn}
                                    onChange={this.instChange}
                                    onBlur={this.instBlur}
                                />
                                <div className="editorInfo">
                                    <p style={{lineHeight: '40px'}}>
                                        编辑器状态：
                                        <span>{this.props.store.codeStore.readOnly ? '不可编辑' : '可编辑'}</span>
                                    </p>
                                </div>
                                {console.log(this.state.configuration)}
                                <SplitEditor
                                    style={{width: '100%'}}
                                    mode="json"
                                    theme="github"
                                    splits={1}
                                    autoFocus="true"
                                    onChange={this.onChange}
                                    value={[this.state.configuration === null ? '{}' : this.state.configuration]}
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

                        </div>
                    </div>
                    <div className={flag ? 'show' : 'hide'}>
                        <div className="installheader">
                           <div className="searchlist">
                               <Search
                                   key="33"
                                   placeholder="搜索应用名"
                                   onSearch={(value)=>{
                                       this.searchApp(value)
                                   }}
                                   style={{ width: 200 }}
                               />
                           </div>
                       </div>
                       <div className="installcontent">
                           {
                               data && data.length > 0 && data.map((val, ind)=>{
                                   return (
                                       <div key={ind}
                                           className="item"
                                       >
                                           <img src={`http://ioe.thingsroot.com/${val.icon_image}`}
                                               alt="logo"
                                               onClick={()=>{
                                                   this.getConfig(val)
                                               }}
                                           />
                                           <div className="apptitle">
                                               <p>{val.app_name}</p>
                                               <div>
                                                   <Rate disabled
                                                       defaultValue={val.star}
                                                       size="small"
                                                   />
                                                   <span onClick={()=>{
                                                       this.setState({
                                                           flag: false,
                                                           detail: false,
                                                           item: val
                                                       })
                                                   }}
                                                   ><Icon type="cloud-download" /></span>
                                               </div>
                                           </div>
                                        </div>)
                               })
                           }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MyGatesAppsInstall;