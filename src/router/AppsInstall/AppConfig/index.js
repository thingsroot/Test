import React, { Component } from 'react';
import Inst from '../Inst';
import {Button, Tabs, message} from 'antd';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
import AppConfigSection from './section';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/monokai';
import './style.scss';

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
        'type': 'string',
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
        'type': 'string'
    },
    {
        'name': 'name',
        'desc': '名称',
        'type': 'string'
    },
    {
        'name': 'ver',
        'desc': '版本',
        'type': 'number'
    }
];
const templates_section = {
    'name': 'tpls',
    'desc': '模板选择',
    'type': 'templates',
    'child': templates_childs
}

@withRouter
@inject('store')
@observer
class AppConfig extends Component {
    constructor (props) {
        super(props);
        this.state = {
            config: [], // 缓存UI配置信息
            appTemplateList: [],  // 应用模板列表（全部）
            app_inst: '', // 应用示例名
            app_info: {}, // 应用信息
            errorCode: false, // 可视化JSON是否有错误
            activeKey: 'json', // Tab Active
            uiEnabled: false, // 可视化是否加载
            configValue: '',
            valueChange: false
        };
    }

    componentDidMount () {
        //this.refreshTemplateList()
        this.setState({
            app_inst: this.props.app_inst,
            app_info: this.props.app_info,
            pre_configuration: this.props.pre_configuration
        }, ()=>{
            const {app_info} = this.state;
            if (app_info !== undefined && app_info.name !== undefined) {
                this.getConfig(app_info)
            } else {
                this.getNoAppConfig()
            }
            console.log(this.state.pre_configuration)
        })
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        let org_app_name = this.state.app_info ? this.state.app_info.name : ''
        let new_app_name = nextProps.app_info ? nextProps.app_info.name : ''
        if (org_app_name === new_app_name && this.state.pre_configuration === nextProps.pre_configuration) {
            return
        }
        this.setState({
            app_inst: nextProps.app_inst,
            app_info: nextProps.app_info,
            pre_configuration: nextProps.pre_configuration
        }, () => {
            const {app_info} = this.state;
            if (app_info !== undefined && app_info.name !== undefined) {
                this.getConfig(app_info)
            } else {
                this.getNoAppConfig()
            }
        });
    }
    prettyJson (str) {
        let data = JSON.parse(str);
        if (!data) {
            message.error('JSON解析错误');
            return str
        }
        return JSON.stringify(data, null, 4)
    }

    refreshTemplateList = () => {
        this.setState({appTemplateList: []})
        let app = this.state.app_info.name
        http.get('/api/store_configurations_list?conf_type=Template&app=' + app)
        .then(res=>{
            let list = this.state.appTemplateList;
            res.data && res.data.length > 0 && res.data.map((tp)=>{
                if (undefined === list.find(item => item.name === tp.name) ) {
                    list.push(tp)
                }
            });
            this.setState({
                appTemplateList: list
            });
        });
        http.get('/api/user_configurations_list?conf_type=Template&app=' + app)
            .then(res=>{
                if (res.ok) {
                    let list = this.state.appTemplateList;
                    res.data && res.data.length > 0 && res.data.map((tp)=>{
                        if (undefined === list.find(item => item.name === tp.name) ) {
                            list.push(tp)
                        }
                    });
                    this.setState({
                        appTemplateList: list
                    });
                }
            });
    }

    getNoAppConfig = () => {
        let pre_configuration = this.state.pre_configuration !== undefined ? this.state.pre_configuration : {};
        this.setState({
            errorCode: false,
            config: [],
            activeKey: 'json',
            configValue: JSON.stringify(pre_configuration, null, 4)
        })
        this.refreshTemplateList()
        this.props.configStore.cleanSetion()
    }

    getConfig = (app)=>{
        let config = [];
        let conf_template = app.conf_template;
        let pre_configuration = this.state.pre_configuration;
        let show_json = false;

        try {
            if (pre_configuration === undefined) {
                let str_pre = app.pre_configuration && app.pre_configuration.length > 0 ? app.pre_configuration : '{}';
                pre_configuration = JSON.parse(str_pre)
            }
        } catch (e) {
            show_json = true
            //message.error(e.message)
            console.log(e.message)
        }

        this.setState({
            errorCode: false
        })
        this.setState({config: config, app: app.name, configValue: JSON.stringify(pre_configuration, null, 4)})

        this.refreshTemplateList()
        this.props.configStore.cleanSetion()

        if (app.has_conf_template === 1 && conf_template && conf_template[0] === '[') {
            config = JSON.parse(conf_template);
            this.setState({
                config: config
            });
            let sections = [];
            let cur_section = {
                name: '__basic__app_settings',
                desc: '应用配置信息',
                type: 'section',
                child: []
            };
            sections.push(cur_section);
            let errorCode = false;
            config && config.length > 0 && config.map((v, key)=>{
                key;
                if (!template_json_type.find(item => item === v.type)) {
                    message.error(`不支持的的可视化类型: ${v.type}`)
                    errorCode = true;
                    return
                }
                let is_section = false;
                if (v.type === 'templates') {
                    v.child = [templates_section]
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
                uiEnabled: !errorCode,
                config: sections
            });
            for (let section of sections) {
                this.props.configStore.addSection(section)
            }
            try {
                this.props.configStore.setValue(pre_configuration)
            } catch ( e ) {
                console.log(e)
                message.error(e)
            }
        } else {
            show_json = true
            this.setState({uiEnabled: false})
        }

        if (show_json) {
            this.setState({activeKey: 'json'})
        } else {
            this.setState({activeKey: 'ui'})
        }
    };

    onSubmit = ()=>{
        const {app_inst, app_info, uiEnabled, configValue} = this.state;
        const {configStore} = this.props;
        if (uiEnabled) {
            this.props.onSubmit(app_inst, app_info, configStore.Value);
        } else {
            let value = undefined
            try {
                value = JSON.parse(configValue)
            } catch (err) {
                message.error('数据格式不正确:' + err)
            }
            if (value !== undefined) {
                this.props.onSubmit(app_inst, app_info, value)
            }
        }
    };

    onTabActiveChange (key){
        this.setState({activeKey: key})
    }

    onJsonChange (value){
        this.setState({configValue: value})

        try {
            let val = JSON.parse(value)
            this.props.configStore.setValue(val)
        } catch (e) {
            //message.error(e.message)
            console.log(e.message)
        }
    }
    onConfigChange (){
        this.setState({configValue: JSON.stringify(this.props.configStore.Value, null, 4)})
    }

    render () {
        const { activeKey, errorCode, app_inst } = this.state;
        const { configStore, gateway_sn, app_info, inst_editable, disabled, pre_configuration } = this.props;
        app_info, pre_configuration;
        return (
            <Tabs
                activeKey={activeKey}
                onChange={(key)=> {
                    this.onTabActiveChange(key)
                }}
                type="card"
            >
                <TabPane
                    tab="可视化编辑"
                    key="ui"
                >
                    <Inst
                        name={name}
                        inst_name={app_inst ? app_inst : ''}
                        editable={inst_editable}
                        gateway_sn={gateway_sn}
                        onChange={(value) =>{
                            this.setState({ app_inst: value })
                        }}
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
                                    app_info={this.state.app_info}
                                    configStore={configStore}
                                    configSection={v}
                                    templatesSource={this.state.appTemplateList}
                                    refreshTemplateList={this.refreshTemplateList}
                                    onChange={()=>{
                                        this.onConfigChange()
                                    }}
                                />
                            )
                        })
                    }
                    </div>
                    <div
                        style={errorCode === false ? none : block}
                        className="message"
                    >
                        数据错误，请使用文本编辑修正错误！
                    </div>
                    <div style={configStore.sections && configStore.sections.length > 0 ? none : block}>
                        <p
                            className="message"
                        >此应用不支持可视化编辑 请使用文本编辑</p>
                    </div>
                    <br/>
                    <Button
                        type="primary"
                        style={errorCode === true || configStore.sections.length === 0 ? none : block}
                        onClick={this.onSubmit}
                        disabled={disabled}
                    >提交</Button>
                </TabPane>
                <TabPane
                    tab="文本编辑(JSON)"
                    key="json"
                >
                    <Inst
                        name={name}
                        inst_name={app_inst}
                        editable={inst_editable}
                        gateway_sn={gateway_sn}
                        onChange={(value) =>{
                            this.setState({ app_inst: value })
                        }}
                    />
                    {console.log('configValueType:', typeof this.state.configValue)}
                    {
                        activeKey === 'json'
                        ? <AceEditor
                            placeholder="Placeholder Text"
                            mode="json"
                            theme="monokai"
                            name="config_json_editor"
                            onChange={(value) => {
                                this.onJsonChange(value)
                            }}
                            fontSize={14}
                            showPrintMargin
                            showGutter
                            highlightActiveLine
                            value={this.state.configValue}
                            style={{width: '100%'}}
                            setOptions={{
                                enableBasicAutocompletion: false,
                                enableLiveAutocompletion: false,
                                enableSnippets: false,
                                showLineNumbers: true,
                                tabSize: 2
                            }}
                          /> : ''
                    }

                    <br/>
                    <Button
                        type="primary"
                        disabled={disabled}
                        onClick={this.onSubmit}
                    >提交</Button>
                </TabPane>
            </Tabs>
        );
    }
}

export default AppConfig;