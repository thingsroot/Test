import React, { Component } from 'react';
import Inst from '../Inst';
import {Button, Tabs, message} from 'antd';
import AppConfigSection from './section';
import {split as SplitEditor} from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
const TabPane = Tabs.TabPane;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

const template_json_type = [
    'boolean',
    'number',
    'string',
    'dropdown',
    'templates',
    'table',
    'section',
    'serial',
    'tcp_client'
]

const tcp_client_childs = [
    {
        'name': 'host',
        'desc': 'IP地址',
        'type': 'text',
        'default': '127.0.0.1'
    },
    {
        'name': 'port',
        'desc': '端口',
        'type': 'number',
        'default': 502
    },
    {
        'name': 'nodelay',
        'desc': 'Nodelay',
        'type': 'boolean',
        'default': true
    }
];
const serial_childs = [
    {
        'name': 'port',
        'desc': '端口',
        'type': 'dropdown',
        'values': ['ttymcx0', 'ttymcx1']
    },
    {
        'name': 'baudrate',
        'desc': '波特率',
        'type': 'dropdown',
        'values': [4800, 9600, 115200, 19200],
        'defualt': 9600
    },
    {
        'name': 'stop_bits',
        'desc': '停止位',
        'type': 'dropdown',
        'values': [1, 2]
    },
    {
        'name': 'data_bits',
        'desc': '数据位',
        'type': 'dropdown',
        'values': [7, 8],
        'default': 7
    },
    {
        'name': 'flow_control',
        'desc': '流控',
        'type': 'dropdown',
        'values': ['ON', 'OFF'],
        'default': 'OFF'
    },
    {
        'name': 'parity',
        'desc': '校验',
        'type': 'dropdown',
        'values': ['None', 'Even', 'Odd']
    }
];
const templates_childs = [
    {
        'name': 'id',
        'desc': '模板ID',
        'type': 'text'
    },
    {
        'name': 'name',
        'desc': '名称',
        'type': 'text'
    },
    {
        'name': 'version',
        'desc': '端口',
        'type': 'number'
    }
];

@withRouter
@inject('store')
@observer
class AppConfig extends Component {
    constructor (props) {
        super(props);
        this.state = {
            config: [],
            appTemplateList: [],
            keys: [],
            item: {},
            readOnly: false,
            errorCode: false,
            instanceName: '',
            activeKey: '2',
            configValue: ''
        };
    }

    componentDidMount () {
        //this.refreshTemplateList()
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        this.setState({
            item: nextProps.item
        });
        if (nextProps.item !== undefined) {
            if (nextProps.item.name !== undefined) {
                this.getConfig(nextProps.item)
            }
        }
    }
    prettyJson (str) {
        let data = JSON.parse(str)
        if (!data) {
            message.error('JSON解析错误')
            return str
        }
        return JSON.stringify(data, null, 4)
    }


    addNewTemplate (){
        const w = window.open('about: blank');
        const { app } = this.props
        w.location.href = '/myappdetails/' + app + '/3'
    }

    refreshTemplateList () {
        this.setState({appTemplateList: []})
        const { app } = this.props
        http.get('/api/store_configurations_list?conf_type=Template&app=' + app)
        .then(res=>{
            let list = this.state.appTemplateList;
            res.data && res.data.length > 0 && res.data.map((item)=>{
                list.push(item)
            });
            this.setState({
                appTemplateList: list
            });
        });
        http.get('/api/user_configuration_list?conf_type=Template&app=' + app)
            .then(res=>{
                if (res.ok) {
                    let list = this.state.appTemplateList;
                    res.data && res.data.length > 0 && res.data.map((item)=>{
                        list.push(item)
                    });
                    this.setState({
                        appTemplateList: list
                    });
                }
            });
    }

    getConfig = (app)=>{
        let config = [];
        let conf_template = app.conf_template;
        let pre_configuration = app.pre_configuration && app.pre_configuration.length > 0 ? app.pre_configuration : '{}';

        this.setState({
            errorCode: false,
            readOnly: false,
            instanceName: ''
        })
        this.setState({config: config, app: app.name, configValue: pre_configuration})

        this.refreshTemplateList()
        this.props.configStore.cleanSetion()

        if (app.has_conf_template && conf_template && conf_template[0] === '[') {
            this.setState({activeKey: '1'})

            config = JSON.parse(conf_template);
            this.setState({
                config: config
            });
            let sections = [];
            let cur_section = {
                name: '应用配置',
                desc: '应用配置信息',
                type: 'section',
                child: []
            };
            sections.push(cur_section);
            let errorCode = false;
            config && config.length > 0 && config.map((v, key)=>{
                key;
                if (!template_json_type.find(item => item === v.type)) {
                    errorCode = true;
                    return
                }
                let is_section = false;
                if (v.type === 'templates') {
                    v.child = templates_childs
                    is_section = true
                }
                if (v.type === 'section') {
                    v.child = v.child === undefined ? [] : v.child
                    is_section = true
                }
                if (v.type === 'serial') {
                    v.child = serial_childs
                    is_section = true
                }
                if (v.type === 'tcp_client') {
                    v.child = tcp_client_childs
                    is_section = true
                }
                if (is_section) {
                    sections.push(v);
                } else {
                    cur_section.child.push(v);
                }
            });

            this.setState({
                errorCode: errorCode,
                readOnly: !errorCode,
                config: sections
            });
            for (let section of sections) {
                this.props.configStore.addSection(section)
            }
            this.props.configStore.setValue(JSON.parse(pre_configuration))
        } else {
            this.setState({activeKey: '2'})
        }

        if (this.props.match.params.type === '2') {
            this.setState({
                flag: false,
                detail: false
            });
        }
    };

    submitData = ()=>{
        this.props.submitData();
    };

    onTabActiveChange = (key)=>{
        this.setState({activeKey: key})
    };


    onChange = (value)=>{
        //this.props.store.codeStore.setInstallConfiguration(this.prettyJson(value[0]))
        this.props.configStore.setValue(JSON.parse(value))
    };

    render () {
        const { activeKey, errorCode, readOnly } = this.state;
        const { configStore } = this.props;
        return (
            <Tabs
                activeKey={activeKey}
                onChange={this.onTabActiveChange}
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
                        {
                            configStore.sections && configStore.sections.length > 0 && configStore.sections.map((v, key) => {
                                return (
                                    <AppConfigSection
                                        key={key}
                                        configStore={configStore}
                                        configSection={v}
                                        templatesSource={this.state.appTemplateList}
                                    />
                                )
                            })
                        }
                    </div>
                    <div
                        style={errorCode === false ? none : block}
                        className="message"
                    >
                        数据错误，请使用JSON格式配置！
                    </div>
                    <div style={configStore.sections && configStore.sections.length > 0 ? none : block}>
                        <p
                            className="message"
                        >此应用不支持配置界面 请使用JSON格式配置</p>
                    </div>
                    <br/>
                    <Button
                        type="primary"
                        style={errorCode === true || configStore.sections.length === 0 ? none : block}
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
                            <span>{readOnly ? '不可编辑' : '可编辑'}</span>
                        </p>
                    </div>
                        <SplitEditor
                            style={{width: '100%'}}
                            mode="json"
                            theme="github"
                            splits={1}
                            onChange={this.onChange}
                            value={[this.state.configValue]}
                            fontSize={16}
                            readOnly={readOnly}
                            name="UNIQUE_ID_OF_DIV"
                            editorProps={{$blockScrolling: true}}
                        />
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