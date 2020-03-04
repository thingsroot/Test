import React, { Component } from 'react';
import Inst from '../Inst';
import {Button, Tabs, message, Divider} from 'antd';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
import { GetSerialListBySN } from '../../../utils/hardwares';
import AppConfigSection from './section';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/monokai';
import './style.scss';
import intl from 'react-intl-universal';

const TabPane = Tabs.TabPane;

const block = {
    display: 'inline-block'
};
const none = {
    display: 'none'
};

const template_json_type = [
    'boolean',
    'number',
    'string',
    'text',
    'dropdown',
    'templates',
    'table',
    'section',
    'fake_section',
    'serial',
    'tcp_client',
    'tcp_server'
]

const tcp_client_childs = [
    {
        'name': 'host',
        'desc': intl.get('appsinstall.IP_address'),
        'type': 'string',
        'default': '127.0.0.1'
    },
    {
        'name': 'port',
        'desc': intl.get('appsinstall.port'),
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

const tcp_server_childs = [
    {
        'name': 'host',
        'desc': intl.get('appsinstall.binding_address'),
        'type': 'string',
        'default': '0.0.0.0'
    },
    {
        'name': 'port',
        'desc': intl.get('appsinstall.port'),
        'type': 'number',
        'default': 4000
    },
    {
        'name': 'nodelay',
        'desc': 'Nodelay',
        'type': 'boolean',
        'default': true
    }
];

function get_serial_childs (sn) {
    let tty_list = GetSerialListBySN(sn)
    if (tty_list.length === 0) {
        return [
            {
                'name': 'port',
                'desc': intl.get('appsinstall.port'),
                'type': 'string'
            },
            {
                'name': 'baudrate',
                'desc': intl.get('appsinstall.baud_rate'),
                'type': 'dropdown',
                'values': [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
                'default': 9600
            },
            {
                'name': 'stop_bits',
                'desc': intl.get('appsinstall.Stop_bit'),
                'type': 'dropdown',
                'values': [1, 2]
            },
            {
                'name': 'data_bits',
                'desc': intl.get('appsinstall.data_bits'),
                'type': 'dropdown',
                'values': [7, 8],
                'default': 8
            },
            {
                'name': 'flow_control',
                'desc': intl.get('appsinstall.flow_control'),
                'type': 'dropdown',
                'values': ['ON', 'OFF'],
                'default': 'OFF'
            },
            {
                'name': 'parity',
                'desc': intl.get('appsinstall.check'),
                'type': 'dropdown',
                'values': ['None', 'Even', 'Odd']
            }
        ];
    }
    return [
        {
            'name': 'port',
            'desc': intl.get('appsinstall.port'),
            'type': 'dropdown',
            'values': tty_list
        },
        {
            'name': 'baudrate',
            'desc': intl.get('appsinstall.baud_rate'),
            'type': 'dropdown',
            'values': [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
            'default': 9600
        },
        {
            'name': 'stop_bits',
            'desc': intl.get('appsinstall.Stop_bit'),
            'type': 'dropdown',
            'values': [1, 2]
        },
        {
            'name': 'data_bits',
            'desc': intl.get('appsinstall.data_bits'),
            'type': 'dropdown',
            'values': [7, 8],
            'default': 8
        },
        {
            'name': 'flow_control',
            'desc': intl.get('appsinstall.flow_control'),
            'type': 'dropdown',
            'values': ['ON', 'OFF'],
            'default': 'OFF'
        },
        {
            'name': 'parity',
            'desc': intl.get('appsinstall.check'),
            'type': 'dropdown',
            'values': ['None', 'Even', 'Odd']
        }
    ];
}
const templates_childs = [
    {
        'name': 'id',
        'desc': intl.get('appsinstall.Template_ID'),
        'type': 'string'
    },
    {
        'name': 'name',
        'desc': intl.get('common.name'),
        'type': 'string'
    },
    {
        'name': 'ver',
        'desc': intl.get('appdetails.version'),
        'type': 'number'
    }
];
// const templates_section = {
//     'name': 'tpls',
//     'desc': '模板选择',
//     'type': 'templates',
//     'child': templates_childs
// }

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
            valueChange: false,
            loading: true
        };
    }

    componentDidMount () {
        this.setState({
            gateway_sn: this.props.gateway_sn,
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
        })
    }

    UNSAFE_componentWillReceiveProps (nextProps){
        let org_app_name = this.state.app_info ? this.state.app_info.name : ''
        let new_app_name = nextProps.app_info ? nextProps.app_info.name : ''
        if (this.state.gateway_sn === nextProps.gateway_sn && org_app_name === new_app_name && this.state.pre_configuration === nextProps.pre_configuration) {
            return
        }
        this.setState({
            gateway_sn: this.props.gateway_sn,
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
            message.error(intl.get('appsinstall.JSON_parsing_error'));
            return str
        }
        return JSON.stringify(data, null, 4)
    }

    refreshTemplateList = () => {
        this.setState({appTemplateList: [], loading: true})
        let app = this.state.app_info ? this.state.app_info.name : undefined
        console.log(app)
        if (app === undefined) {
            return
        }
        http.get('/api/store_configurations_list?conf_type=Template&app=' + app)
        .then(res=>{
            let list = this.state.appTemplateList;
            res.data && res.data.length > 0 && res.data.map((tp)=>{
                if (undefined === list.find(item => item.name === tp.name) &&
                    tp.latest_version !== undefined && tp.latest_version !== 0 ) {
                    list.push(tp)
                }
            });
            this.setState({
                appTemplateList: list,
                loading: false
            });
            this.props.configStore.setTemplatesList(list)
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
                        appTemplateList: list,
                        loading: false
                    });
                    this.props.configStore.setTemplatesList(list)
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
                name: 'base_section__section',
                desc: intl.get('appsinstall.application_configuration_information'),
                type: 'fake_section',
                child: []
            };
            sections.push(cur_section);
            let errorCode = false;
            config && config.length > 0 && config.map((v, key)=>{
                key;
                if (!template_json_type.find(item => item === v.type)) {
                    message.error(`${intl.get('appsinstall.unsupported_visualization_type')}: ${v.type}`)
                    errorCode = true;
                    return
                }
                if (v.type === 'templates') {
                    v.child = [templates_childs]
                    // if (cur_section.type === 'section') {
                    //     cur_section.child.push(v);
                    // } else {
                    //     cur_section = {
                    //         name: v.name + '__section',
                    //         desc: v.desc,
                    //         type: 'fake_section',
                    //         child: [v]
                    //     }
                    //     sections.push(cur_section);
                    // }
                    cur_section = {
                        name: v.name + '__section',
                        desc: v.desc !== undefined ? v.desc : intl.get('appsinstall.device_template_list'),
                        type: 'fake_section',
                        child: [v]
                    }
                    sections.push(cur_section);
                    console.log(sections, 'sections')
                } else if (v.type === 'table') {
                    v.cols = v.cols === undefined ? [] : v.cols
                    // if (cur_section.type === 'section') {
                    //     cur_section.child.push(v);
                    // } else {
                    //     cur_section = {
                    //         name: v.name + '__section',
                    //         desc: v.desc,
                    //         type: 'fake_section',
                    //         child: [v]
                    //     }
                    //     sections.push(cur_section);
                    // }
                    cur_section = {
                        name: v.name + '__section',
                        desc: v.desc,
                        type: 'fake_section',
                        child: [v]
                    }
                    sections.push(cur_section);
                } else if (v.type === 'section' || v.type === 'fake_section') {
                    v.child = v.child === undefined ? [] : v.child

                    cur_section = v
                    sections.push(v);
                } else if (v.type === 'serial') {
                    v.child = get_serial_childs(this.props.gateway_sn)

                    cur_section = v
                    sections.push(v);
                } else if (v.type === 'tcp_client') {
                    v.child = tcp_client_childs

                    cur_section = v
                    sections.push(v);
                } else if (v.type === 'tcp_server') {
                    v.child = tcp_server_childs

                    cur_section = v
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
            let value = undefined;
            try {
                value = JSON.parse(configValue)
            } catch (err) {
                message.error(`${intl.get('appsinstall.incorrect_data_format')}: ` + err)
            }
            if (value !== undefined) {
                this.props.onSubmit(app_inst, app_info, value)
            }
        }
    };
    onCancel = () =>{
        this.props.onCancel()
    }

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
        const { configStore, gateway_sn, app_info, inst_editable, update_config, disabled, pre_configuration, closeOnSubmit } = this.props;
        app_info, pre_configuration;
        return (
            <div className="appConfig">
                <Tabs
                    activeKey={activeKey}
                    onChange={(key)=> {
                        this.onTabActiveChange(key)
                    }}
                    type="card"
                >
                    <TabPane
                        tab={intl.get('appsinstall.visual_editing')}
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
                                        config={this.state}
                                        app_info={this.state.app_info}
                                        configStore={configStore}
                                        configSection={v}
                                        templatesSource={this.state.appTemplateList}
                                        refreshTemplateList={this.refreshTemplateList}
                                        loading={this.state.loading}
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
                            {intl.get('appsinstall.data_error')}
                        </div>
                        <div style={configStore.sections && configStore.sections.length > 0 ? none : block}>
                            <p
                                className="message"
                            >{intl.get('appsinstall.visual_editing_is_not_supported_in_this_app_please_use_text_editing')}</p>
                        </div>
                    </TabPane>
                    <TabPane
                        tab={intl.get('appsinstall.text_editing')}
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
                    </TabPane>
                </Tabs>
                <Divider/>
                {
                    update_config
                    ? <div>
                        <Button
                            type="primary"
                            onClick={()=>{
                                this.onSubmit()
                            }}
                            disabled={disabled}
                        > {intl.get('appsinstall.save')} </Button>
                        <span style={{padding: '0 10px'}}> </span>
                        <Button
                            type="primary"
                            onClick={()=>{
                                if (closeOnSubmit) {
                                    closeOnSubmit(true)
                                }
                                this.onSubmit()
                            }}
                            disabled={disabled}
                        > {intl.get('appsinstall.save_&_return')} </Button>
                        <span style={{padding: '0 10px'}}> </span>
                        <Button
                            onClick={()=>{
                                this.onCancel()
                            }}
                            disabled={disabled}
                        > {intl.get('common.cancel')} </Button>
                    </div>
                    : <div>
                        <Button
                            type="primary"
                            onClick={()=>{
                                this.onSubmit()
                            }}
                            disabled={disabled}
                        > {intl.get('appsinstall.install')} </Button>
                        <span style={{padding: '0 10px'}}> </span>
                        <Button
                            onClick={()=>{
                                this.onCancel()
                            }}
                            disabled={disabled}
                        > {intl.get('common.cancel')} </Button>
                    </div>
                }
            </div>
        );
    }
}

export default AppConfig;