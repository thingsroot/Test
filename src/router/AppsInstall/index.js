import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Select, Input, Rate, Icon, Button, Tabs, Table, Modal, Checkbox } from 'antd';
import { inject, observer} from 'mobx-react';
import Status from '../../common/status';
import http from '../../utils/Server';
import marked from 'marked';
import highlight from 'highlight.js';
import 'highlight.js/styles/github.css';
import './style.scss';
import Nav from './Nav';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/github';
import EditableTable from './editorTable';
const TabPane = Tabs.TabPane;
const Search = Input.Search;
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
class MyGatesAppsInstall extends Component {
    state = {
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
        tcp: [
            {
                'name': 'ip',
                'desc': 'IP地址',
                'type': 'text'
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
                    }}>添加</Button>
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
                }>删除</Button>
            )
        }],
        deviceColumns: [],
        deviceSource: [],
        SourceCode: [],
        dataSourceCode: []
    };
    componentDidMount (){
        http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res.message)
          });
        http.get('/api/method/app_center.api.app_suppliers').then(res=>{
            this.setState({
                vendor: res.message
            })
        });
        http.get('/api/method/app_center.api.app_protocols').then(res=>{
            this.setState({
                agreement: res.message
            })
        });
        http.get('/api/method/app_center.api.app_categories').then(res=>{
            this.setState({
                type: res.message
            })
        });
        http.get('/api/method/iot_ui.iot_api.appslist_bypage?count=100&page=1').then(res=>{
            res.message.result.length > 0 && this.setState({
                data: res.message.result,
                filterdata: res.message.result
            })
        });
        http.get('/api/method/conf_center.api.list_app_conf_pri?app=APP00000040&limit=100')
            .then(res=>{
                let data = res.message;
                data && data.length > 0 && data.map((v)=>{
                    v['disabled'] = false;
                });
                this.setState({
                    addTempList: data
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
    }
    shouldComponentUpdate (nextProps, nextState){
        if (nextState.item.description !== undefined){
            document.getElementById('box').innerHTML = marked(nextState.item.description)
        }
        return true;
    }
    setFilter (){
        let { filterdata, filter } = this.state;
        let newdata = [];
            if (filter.vendor === '' && filter.type !== '' && filter.agreement !== ''){
                newdata = filterdata.filter((item)=>item.protocol === filter.agreement && item.category === filter.type)
            } else if (filter.agreement === '' && filter.vendor !== '' && filter.type !== ''){
                newdata = filterdata.filter((item)=>item.device_supplier === filter.vendor && item.category === filter.type)
            } else if (filter.type === '' && filter.agreement !== '' && filter.vendor !== ''){
                newdata = filterdata.filter((item)=>item.device_supplier === filter.vendor && item.protocol === filter.agreement)
            } else if (filter.vendor === '' && filter.agreement === '' && filter.type !== ''){
                newdata = filterdata.filter((item)=>item.category === filter.type)
            } else if (filter.vendor === '' && filter.type === '' && filter.agreement !== ''){
                newdata = filterdata.filter((item)=>item.protocol === filter.agreement)
            } else if (filter.type === '' && filter.agreement === '' && filter.vendor !== ''){
                newdata = filterdata.filter((item)=>item.device_supplier === filter.vendor)
            } else if (filter.vendor !== '' && filter.type !== '' && filter.agreement !== ''){
                newdata = filterdata.filter((item)=>item.protocol === filter.agreement && item.device_supplier === filter.vendor && item.category === filter.type)
            } else {
                newdata = filterdata
            }
        this.setState({
            data: newdata
        })
    }
    handleChangevendor () {
        const value = event.target.innerHTML
        if (value === '全部'){
            this.setState({
                filter: {
                    vendor: '',
                    agreement: this.state.filter.agreement,
                    type: this.state.filter.type
                }
            }, ()=>{
                this.setFilter()
            })
            return
        }
        this.setState({
            filter: {
                vendor: value,
                agreement: this.state.filter.agreement,
                type: this.state.filter.type
            }
        }, ()=>{
            this.setFilter()
        })
    }
    handleChangeagreement () {
        const value = event.target.innerHTML
        if (value === '全部'){
            this.setState({
                filter: {
                    vendor: this.state.filter.vendor,
                    agreement: '',
                    type: this.state.filter.type
                }
            }, ()=>{
                this.setFilter()
            });
            return
        }
        this.setState({
            filter: {
                vendor: this.state.filter.vendor,
                agreement: value,
                type: this.state.filter.type
            }
        }, ()=>{
            this.setFilter()
        })
    }
    handleChangetype () {
        const value = event.target.innerHTML
        if (value === '全部'){
            this.setState({
                filter: {
                    vendor: this.state.filter.vendor,
                    agreement: this.state.filter.agreement,
                    type: ''
                }
            }, ()=>{
                this.setFilter()
            })
            return
        }
        this.setState({
            filter: {
                vendor: this.state.filter.vendor,
                agreement: this.state.filter.agreement,
                type: value
            }
        }, ()=>{
            this.setFilter()
        })
    }
    searchApp (value){
        let { filterdata } = this.state;
        let newdata = [];
        newdata = filterdata.filter((item)=>item.app_name.indexOf(value) !== -1)
        this.setState({
            data: newdata
        })
    }
    setInstName = ()=>{
        this.setState({
            instName: event.target.value
        });
    };  //实例名
    onChange = (newValue)=>{
        this.props.store.codeStore.setEditorValue(newValue)
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
        console.log(val);
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
        let config = JSON.parse(val.conf_template);
        let deviceColumns = [];
        let object = {};
        config && config.length > 0 && config.map((v, key)=>{
            key;
            if (v.name === 'device_section') {
                v.child.map((w, key1)=>{
                    key1;
                    w.cols.map((i, key2)=>{
                        key2;
                        console.log(i);
                        deviceColumns.push({
                            key: key2,
                            name: i.name,
                            desc: i.desc,
                            type: i.type
                        });
                    })

                });
            }
        });
        console.log(deviceColumns)
        this.setState({
            flag: false,
            item: val,
            detail: true,
            config: config,
            object: object,
            deviceColumns: deviceColumns
        })
    };
    checkedChange = (refName)=>{
        this.refs[refName].value = event.target.checked
    };
    selectChangeValue = (refName)=>{
        this.refs[refName].value = event.target.innerText
    };

    getData = ()=>{
        const { tcp, serial, showTempList, selectSection } = this.state;
        let sourceCodeData = {
            protocol: this.refs.protocol.value,
            Link_type: this.refs.Link_type.value
        };
        let data = [];
        let showList = [];
        if (selectSection === 'socket') {
            tcp.map((v, key)=>{
                key;
                data.push({
                    [v.name]: this.refs[v.name].value
                })
            });
            sourceCodeData['socket'] = data;
        } else if (selectSection === 'serial') {
            serial.map((v, key)=>{
                key;
                data.push({
                    [v.name]: this.refs[v.name].value
                })
            });
            sourceCodeData['serial'] = data;
        }
        showTempList.length > 0 && showTempList.map((v, key)=>{
            key;
            showList.push({
                name: v.conf_name,
                desc: v.description,
                id: v.name,
                ver: v.latest_version
            })
        });
        sourceCodeData['tpls'] = showList;
        const { dataSource } = this.props.store.codeStore;
        if (dataSource.length > 0) {
            dataSource.map((v)=>{
                console.log(v);
                delete v['key']
            });
            sourceCodeData['devs'] = this.props.store.codeStore.dataSource
        }
        console.log(sourceCodeData);
        this.setState({
            dataSourceCode: JSON.stringify(sourceCodeData)
        });
    };
    submitData = ()=>{
        this.getData();
    };
    callback = (key)=>{
        key;
        if (this.state.config && this.state.config.length > 0) {
            console.log('不可编辑');
            this.getData();
        } else {
            console.log('可编辑')
            this.props.store.codeStore.setReadOnly(true);
        }

    };

    render () {
        const { vendor, agreement, type, data, flag, item, detail, showTempLists, serial, tcp,
            addTempLists, instName, showTempList, config, addTempList} = this.state;
        return (<div>
            <Status />
                <div className="AppInstall">
                    <Nav />
                    <div className={flag ? 'hide appsdetail' : 'show appsdetail'}>
                    <Button className="installbtn"
                        type="primary"
                        onClick={()=>{
                            this.setState({detail: !detail})
                        }}
                    >
                        {
                            detail ? '安装到网关' : '查看应用描述'
                        }
                    </Button>
                        <Icon type="rollback"
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
                                <img src={'http://cloud.thingsroot.com' + item.icon_image}
                                    alt=""
                                />
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
                        <Tabs onChange={this.callback}
                            type="card"
                        >
                            <TabPane tab="配置面板"
                                key="1"
                            >
                                <p style={{lineHeight: '50px'}}>
                                    <span className="spanStyle">实例名：</span>
                                    <Input
                                        type="text"
                                        style={{width: '300px'}}
                                        defaultValue={instName}
                                        onChange={this.setInstName}
                                    />
                                    <span>{instName}</span>
                                </p>
                                <div>
                                    {console.log(config)}
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
                                                            <p className="sectionName"><span
                                                                style={{padding: '0 5px'}}>|</span>{v.desc}</p>
                                                            {
                                                                serial && serial.length > 0 && serial.map((a, index) => {
                                                                    if (a.type === 'dropdown') {
                                                                        return (
                                                                            <div
                                                                                style={{lineHeight: '50px'}}
                                                                                key={index}
                                                                            >
                                                                                <span
                                                                                    className="spanStyle">{a.desc}</span>
                                                                                <Select
                                                                                    defaultValue={a.value[0]}
                                                                                    style={{width: 300}}
                                                                                    onChange={() => {
                                                                                        this.selectChangeValue(a.name)
                                                                                    }}
                                                                                >
                                                                                    {a.value.map(b => <Option
                                                                                        key={b}>{b}</Option>)}
                                                                                </Select>
                                                                                <input
                                                                                    ref={a.name}
                                                                                    type="hidden"
                                                                                    value={a.value[0]}
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
                                                                                    className="spanStyle">{a.desc}</span>
                                                                                <Checkbox
                                                                                    defaultChecked={a.value}
                                                                                    onChange={
                                                                                        () => {
                                                                                            this.checkedChange(a.name)
                                                                                        }
                                                                                    }
                                                                                >
                                                                                </Checkbox>
                                                                                <input
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
                                                            <p className="sectionName"><span
                                                                style={{padding: '0 5px'}}>|</span>{v.desc}</p>
                                                            {
                                                                tcp && tcp.length > 0 && tcp.map((a, index) => {
                                                                    if (a.type === 'boolean') {
                                                                        return (
                                                                            <div
                                                                                style={{lineHeight: '50px'}}
                                                                                key={index}
                                                                            >
                                                                                <span
                                                                                    className="spanStyle">{a.desc}</span>
                                                                                <Checkbox
                                                                                    defaultChecked={a.value}
                                                                                    onChange={
                                                                                        () => {
                                                                                            this.checkedChange(a.name)
                                                                                        }
                                                                                    }
                                                                                >
                                                                                </Checkbox>
                                                                                <input
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
                                                                                    className="spanStyle">{a.desc}</span>
                                                                                <Input
                                                                                    style={{width: 320}}
                                                                                    name={a.name}
                                                                                    type={a.type}
                                                                                    defaultValue={a.value}
                                                                                />
                                                                                <input
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
                                                } else if (v.name === 'template_section') {
                                                    return (
                                                        <div id={v.name} key={key}>
                                                            <p className="sectionName"><span
                                                                style={{padding: '0 5px'}}>|</span>{v.desc}</p>
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
                                                                添加模板
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
                                                } else if (v.name === 'device_section') {
                                                    return <div id={v.name} key={key}>
                                                        <p className="sectionName"><span
                                                            style={{padding: '0 5px'}}>|</span>{v.desc}</p>
                                                        <EditableTable
                                                            deviceColumns={this.state.deviceColumns}
                                                            deviceSource={this.state.deviceSource}
                                                        />
                                                    </div>
                                                }
                                            } else {
                                                return (
                                                    <div
                                                        id={v.name}
                                                        key={key}
                                                    >
                                                        <div style={{lineHeight: '50px'}}>
                                                            <span className="spanStyle">{v.desc}：</span>
                                                            <Select
                                                                defaultValue={v.value[0]}
                                                                style={{width: 300}}
                                                                onChange={this.protocolChange}
                                                            >
                                                                {v.value.map(w => <Option key={w}>{w}</Option>)}
                                                            </Select>
                                                            <input
                                                                type="hidden"
                                                                value={v.value[0]}
                                                                ref={v.name}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                                <div style={config && config.length > 0 ? none : block}>
                                    <p
                                        style={{
                                            winth: '100%',
                                            lineHeight: '100px',
                                            fontSize: '22px',
                                            fontWeight: 600,
                                            textAlign: 'center'
                                        }}
                                    >此应用不支持配置界面 请使用JSON格式配置</p>


                                </div>

                            </TabPane>
                            <TabPane tab="JSON源码"
                                key="2"
                            >
                                <div className="editorInfo">
                                    <p style={{lineHeight: '50px'}}>
                                        <span className="spanStyle">实例名：</span>
                                        <Input
                                            type="text"
                                            style={{width: '300px'}}
                                            defaultValue={instName}
                                            onChange={this.setInstName}
                                        />
                                    </p>
                                    <p style={{lineHeight: '40px'}}>
                                        编辑器状态：
                                        <span>{this.props.store.codeStore.readOnly ? '不可编辑' : '可编辑'}</span>
                                    </p>
                                </div>
                                <AceEditor
                                    style={{width: '100%'}}
                                    mode="java"
                                    theme="github"
                                    onChange={this.onChange}
                                    // value={this.state.item.pre_configuration}
                                    value={JSON.stringify(this.state.dataSourceCode) === '[]' ? this.state.item.pre_configuration : JSON.stringify(this.state.dataSourceCode)}
                                    fontSize={16}
                                    readOnly={this.props.store.codeStore.readOnly}
                                    name="UNIQUE_ID_OF_DIV"
                                />
                                <Button onClick={this.submitData}>提交</Button>
                            </TabPane>
                        </Tabs>
                        </div>
                    </div>
                    <div className={flag ? 'show' : 'hide'}>
                        <div className="installheader">
                           <div className="selectlist">
                               <div>
                                   设备厂商:
                                   <Select defaultValue="设备厂商"
                                       style={{ width: 120 }}
                                       onChange={()=>{
                                           this.handleChangevendor()
                                       }}
                                       size="small"
                                       key="44"
                                   >
                                       <Option
                                           value="全部"
                                           key="99"
                                       >全部</Option>
                                               {
                                                   vendor && vendor.length > 0 && vendor.map((val, ind) => {
                                                       return (
                                                           <Option
                                                               value={val.name}
                                                               key={ind}
                                                           >{val.name}</Option>
                                                       )
                                                   })
                                               }
                                           </Select>
                               </div>
                               <div>
                                   通讯协议:
                                   <Select defaultValue="通讯协议"
                                       style={{ width: 120 }}
                                       onChange={()=>{
                                           this.handleChangeagreement()
                                       }}
                                       size="small"
                                       key="11"
                                   >
                                       <Option
                                           value="全部"
                                           key="99"
                                       >全部</Option>
                                               {
                                                   agreement && agreement.length > 0 && agreement.map((val, ind) => {
                                                       return (
                                                           <Option
                                                               value={val.name}
                                                               key={ind}
                                                           >{val.name}</Option>
                                                       )
                                                   })
                                               }
                                           </Select>
                               </div>
                               <div>
                                   应用类型:
                                   <Select defaultValue="应用类型"
                                       style={{ width: 120 }}
                                       onChange={()=>{
                                           this.handleChangetype()
                                       }}
                                       size="small"
                                       key="22"
                                   >
                                       <Option
                                           value="全部"
                                           key="99"
                                       >全部</Option>
                                               {
                                                   type && type.length > 0 && type.map((val, ind) => {
                                                        return (
                                                           <Option
                                                               value={val.name}
                                                               key={ind}
                                                           >{val.name}</Option>
                                                       )
                                                   })
                                               }
                                   </Select>
                               </div>
                           </div>
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
                                           <img src={`http://cloud.thingsroot.com${val.icon_image}`}
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