import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import {Link} from 'react-router-dom';
import {Button, Checkbox, Input, Modal, Select, Table, Divider, message, Tooltip} from 'antd';
import { _getCookie } from '../../../../utils/Session';
import EditableTable from './table';
import EditableTemplates from './templates';
import intl from 'react-intl-universal';

const Option = Select.Option;
const { TextArea } = Input;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};
Link;

@inject('store')
@observer
class AppConfigSection extends Component {
    constructor (props) {
        super(props);
        this.state = {
            showTemplateSelection: false,
            TheBackupappTemplateList: [],
            tempList: []
        }
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (JSON.stringify(nextProps.templatesSource) !== JSON.stringify(this.props.templatesSource)) {
            this.setState({
                TheBackupappTemplateList: nextProps.templatesSource,
                tempList: nextProps.templatesSource
            })
        }
    }
    search = (value) => {
        if (value) {
            const newList = this.state.TheBackupappTemplateList.filter(item=>item.name.toLocaleLowerCase().indexOf(value) !== -1 || item.description.indexOf(value) !== -1 || item.conf_name.toLocaleLowerCase().indexOf(value) !== -1)
            this.setState({
                tempList: newList
            })
        } else {
            this.setState({
                tempList: this.state.TheBackupappTemplateList
            })
        }
    }
    //添加模板
    onAddTemplate = (config, name, conf_name, desc, version)=>{
        let val = config.Value
        if (config.Limit !== 0 && config.Limit <= val.length) {
            message.error(intl.get('appsinstall.the_maximum_number_of_optional_templates_has_been_reached'))
            return
        }
        this.props.configStore.addTemplate(name, conf_name, desc, version)
        let max_key = 0
        val.map(item => max_key < item.key ? max_key = item.key : max_key)
        val.push({
            key: max_key + 1,
            id: name,
            name: conf_name,
            description: desc,
            ver: version
        })
        config.setValue(val)
        this.props.onChange()
    };
    // 删除模板
    onDeleteTemplate =  (name)=>{
        let dataSource = this.state.showTempList;
        dataSource.splice(name, 1);//index为获取的索引，后面的 1 是删除几行
        this.setState({
            showTempList: dataSource
        });
        let a = [];
        dataSource && dataSource.length > 0 && dataSource.map((item)=>{
            a.push(item.conf_name)
        });
        let addTempList = this.state.addTempList;
        this.setState({
            addTempList: addTempList
        })
    };
    templateShow = ()=>{
        this.setState({
            showTemplateSelection: true,
            TheBackupappTemplateList: this.props.templatesSource,
            tempList: this.props.templatesSource
        })
    };

    onCreateNewTemplate = () => {
        const w = window.open('about:blank');
        w.location.href = '/appdetails/' + this.props.app_info.name + '/new_template'
    }
    onViewTemplate = (conf, version) => {
        const w = window.open('about:blank');
        if (version !== undefined && version !== 0) {
            w.location.href = '/template/' + this.props.app_info.name + '/' + conf + '/' + version
        } else {
            w.location.href = '/template/' + this.props.app_info.name + '/' + conf
        }
    }
    onCloneTemplate = (conf, version) => {
        const w = window.open('about:blank');
        w.location.href = '/template/' + this.props.app_info.name + '/' + conf + '/' + version + '/clone'
    }

    handleCancelAddTempList = ()=>{
        this.setState({
            showTemplateSelection: false
        })
    };

    render_boolean (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={{lineHeight: '50px', display: config.hide === true ? 'none' : 'block'}}
            >
                            <span
                                className="spanStyle"
                            >{config.desc}：</span>
                <Checkbox
                    checked={config.value}
                    onChange={
                        () => {
                            config.setValue(event.target.checked)
                            this.props.onChange()
                        }
                    }
                >
                </Checkbox>
                <Input
                    ref={config.name}
                    type="hidden"
                    value={config.value}
                />
            </div>
        )
    }
    render_nubmer (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Input
                        style={{width: '300px'}}
                        type="number"
                        value={config.value}
                        ref={config.name}
                        onChange={()=>{
                            config.setValue(event.target.value)
                            this.props.onChange()
                        }}
                    />
                </div>
            </div>
        )
    }
    render_string (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Input
                        style={{width: '300px'}}
                        type="text"
                        value={config.value}
                        ref={config.name}
                        onChange={()=>{
                            config.setValue(event.target.value)
                            this.props.onChange()
                        }}
                    />
                </div>
            </div>
        )
    }
    render_text (key, config) {
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <TextArea
                        style={{width: '600px'}}
                        rows={4}
                        value={config.value}
                        ref={config.name}
                        onChange={()=>{
                            config.setValue(event.target.value)
                            this.props.onChange()
                        }}
                    />
                </div>
            </div>
        )
    }
    render_dropdown (key, config) {
        if (config.depends !== undefined) {
            for (let [k, v] of Object.entries(config.depends)) {
                this.props.configStore.setHide(v, k !== config.value)
            }
        }
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <div style={{lineHeight: '50px'}}>
                    <span className="spanStyle">{config.desc}：</span>
                    <Select
                        value={typeof(config.value) !== 'object' ? config.value : config.value.value}
                        style={{width: 300}}
                        onChange={(value)=>{
                            config.depends && config.depends.length > 0 && config.depends.map( (dep, dep_key) => {
                                this.props.configStore.setHide(dep, dep_key === value)
                            })
                            config.setValue(value)
                            if (config.depends !== undefined) {
                                for (let [k, v] of Object.entries(config.depends)) {
                                    this.props.configStore.setHide(v, k !== config.value)
                                }
                            }
                            this.props.onChange()
                        }}
                    >
                        {config.values && config.values.length > 0 && config.values.map(w => {
                            return (
                                <Option
                                    key={typeof(w) !== 'object' ? w : w.value}
                                    value={typeof(w) !== 'object' ? w : w.value}
                                >
                                    {typeof(w) !== 'object' ? w : w.name}
                                </Option>
                            )
                        } )}
                    </Select>
                    <Input
                        type="hidden"
                        value={config.default ? config.value[0] : ''}
                        ref={config.name}
                    />
                </div>
            </div>
        )
    }
    render_table (key, config) {
        let tableColumns = [];
        config.cols && config.cols.length && config.cols.map((col, col_key)=>{
            let columnReference = col.reference
            if (columnReference === undefined && col.type === 'template') {
                columnReference = 'tpls'
            }

            tableColumns.push({
                key: col_key,
                id: col.name,
                columnType: col.type,
                columnReference: columnReference,
                title: col.desc,
                dataIndex: col.name,
                default: col.default,
                values: col.values,
                depends: col.depends,
                editable: true
            });
        });
        let rowKey = config.key !== undefined ? config.key : 'index'

        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <p className="sectionName">
                    <span
                        style={{padding: '0 5px'}}
                    >|</span>{config.desc}</p>
                    <EditableTable
                        config={config}
                        rowKey={rowKey}
                        tableColumns={tableColumns}
                        dataSource={config.value}
                        configStore={this.props.configStore}
                        onChange={this.props.onChange}
                    />

            </div>
        )
    }
    render_templates (key, config, templates, templateStore) {
        const developer = this.props.app_info.developer ? this.props.app_info.developer : '';
        templateStore.sort(function (b, a) {
            const id = _getCookie('user_id')
            const order = [developer, id];
            return order.indexOf(a.developer) - order.indexOf(b.developer)
        });
        const addTempLists = [
            {
                title: intl.get('common.name'),
                width: '20%',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <Tooltip title={text}><span className="col_name">{text}</span></Tooltip>
            }, {
                title: intl.get('common.desc'),
                width: '15%',
                dataIndex: 'description',
                key: 'description',
                render: text => <Tooltip title={text}><span className="col">{text}</span></Tooltip>
            }, {
                title: intl.get('appsinstall.owner_ID'),
                width: '15%',
                dataIndex: 'developer',
                key: 'developer',
                render: text => <Tooltip title={text}><span className="col">{text}</span></Tooltip>
            }, {
                title: intl.get('appsinstall.Template_ID'),
                width: '15%',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: intl.get('appdetails.version'),
                width: '10%',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: intl.get('common.operation'),
                width: '25%',
                render: (record) => (
                    record.latest_version !== undefined && record.latest_version !== 0 ? (
                    <span>
                        <Button
                            onClick={()=>{
                                this.onViewTemplate(record.name, record.latest_version)
                            }}
                        > {intl.get('appdetails.see')} </Button>
                        <span style={{padding: '0 1px'}}> </span>
                        {/* {
                            record.developer !== this.props.store.session.user_id ? ( */}
                            <Button
                                onClick={()=>{
                                    this.onCloneTemplate(record.name, record.latest_version)
                                }}
                            > {intl.get('appdetails.clone')} </Button> ) : null
                        }
                        <span style={{padding: '0 1px'}}> </span>
                        <Button
                            disabled={this.props.configStore.templates.filter(item=> item.name === record.name).length > 0 ? true : false}
                            type="primary"
                            onClick={()=>{
                                this.onAddTemplate(config, record.name, record.conf_name, record.description, record.latest_version)
                            }}
                        > {intl.get('appsinstall_add')} </Button>
                    </span>) : (
                    <span>
                        <Button
                            onClick={()=>{
                                this.onViewTemplate(record.name)
                            }}
                        > {intl.get('appdetails.see')} </Button>
                    </span>)
                )
            }
        ]
        return (
            <div
                id={config.name}
                key={key}
                style={config.hide === true ? none : block}
            >
                <EditableTemplates
                    config={config}
                    dataSource={config.value}
                    configStore={this.props.configStore}
                    onChange={this.props.onChange}
                />
                <Button
                    onClick={this.templateShow}
                    style={{margin: '10px 0'}}
                >
                    {intl.get('appsinstall.select_template')}
                </Button>
                <Modal
                    title={intl.get('appsinstall.select_template')}
                    visible={this.state.showTemplateSelection}
                    onOk={this.handleCancelAddTempList}
                    onCancel={this.handleCancelAddTempList}
                    wrapClassName={'templatesModal'}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    maskClosable={false}
                >
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            left: '110px',
                            top: 10,
                            zIndex: 999,
                            lineHeight: '30px'
                        }}
                    >
                        <Button
                            onClick={()=>{
                                this.props.refreshTemplateList()
                            }}
                        >
                            {intl.get('appsinstall.refresh')}
                        </Button>
                        <span style={{padding: '0 20px'}}> </span>
                        <Input.Search
                            placeholder={intl.get('gateway.placeholder_template')}
                            onChange={(e=>{
                                this.search(e.target.value.toLocaleLowerCase())
                            })}
                            style={{ width: 200 }}
                        />
                        <span style={{padding: '0 2px'}}> </span>
                        <Button
                            style={{
                                marginLeft: '670px'
                            }}
                            type="primary"
                            onClick={()=>{
                                this.props.refreshTemplateList()
                            }}
                        >
                            {intl.get('appsinstall.create_a_new_template')}
                        </Button>
                    </div>
                    <Table
                        rowKey="key"
                        dataSource={this.state.tempList}
                        columns={addTempLists}
                        pagination={false}
                        scroll={{ y: 240 }}
                        loading={this.props.loading}
                    />
                </Modal>
            </div>
        )
    }
    render () {
        const { configSection, configStore, templatesSource, app_info } = this.props
        app_info;
        return (
            <div
                id={configSection.name}
                style={configSection.hide === true || configSection.child === undefined || configSection.child.length === 0 ? none : block}
            >
                <Divider orientation="left">{configSection.desc}</Divider>
                {
                    configSection.child && configSection.child.length > 0 && configSection.child.map((v, key) => {
                        if (v.type === 'boolean') {
                            return this.render_boolean(key, v)
                        }
                        if (v.type === 'number') {
                            return this.render_nubmer(key, v)
                        }
                        // if (v.type === 'template') {
                        //     return this.render_template(key, v,  templatesSource)
                        // }
                        if (v.type === 'string') {
                            return this.render_string(key, v)
                        }
                        if (v.type === 'text') {
                            return this.render_text(key, v)
                        }
                        if (v.type === 'dropdown') {
                            // return false
                            return this.render_dropdown(key, v)
                        }
                        if (v.type === 'table') {
                            return this.render_table(key, v)
                        }
                        if (v.type === 'templates') {
                            return this.render_templates(key, v,  configStore.templates, templatesSource)
                        }
                    })
                }
            </div>
        )
    }
}

export default AppConfigSection;