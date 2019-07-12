import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import {Link} from 'react-router-dom';
import {Button, Checkbox, Input, Modal, Select, Table, Divider} from 'antd';
import EditableTable from './table';
import EditableTemplates from './templates';
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
            showTemplateSelection: false
        }
    }

    //添加模板
    onAddTemplate = (config, name, conf_name, desc, version)=>{
        this.props.configStore.addTemplate(name, conf_name, desc, version)
        let val = config.Value
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
            showTemplateSelection: true
        })
    };

    onCreateNewTemplate = () => {
        const w = window.open('about: blank');
        w.location.href = '/appdetails/' + this.props.app_info.name + '/new_template'
    }
    onViewTemplate = (conf, version) => {
        const w = window.open('about: blank');
        if (version !== undefined && version !== 0) {
            w.location.href = '/template/' + this.props.app_info.name + '/' + conf + '/' + version
        } else {
            w.location.href = '/template/' + this.props.app_info.name + '/' + conf
        }
    }
    onCloneTemplate = (conf, version) => {
        const w = window.open('about: blank');
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
                        value={config.value}
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
                            return (<Option key={typeof(w) !== 'object' ? w : w.value}>{typeof(w) !== 'object' ? w : w.name}</Option>)
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
        console.log(key, config)
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
        const addTempLists = [
            {
                title: '名称',
                width: '20%',
                dataIndex: 'conf_name',
                key: 'conf_name',
                render: text => <span>{text}</span>
            }, {
                title: '描述',
                width: '30%',
                dataIndex: 'description',
                key: 'description'
            }, {
                title: '模板ID',
                width: '15%',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '版本',
                width: '10%',
                key: 'latest_version',
                dataIndex: 'latest_version'
            }, {
                title: '操作',
                width: '25%',
                render: (record) => (
                    record.latest_version !== undefined && record.latest_version !== 0 ? (
                    <span>
                        {/* <Button>
                            <Link to={`/template/${record.app}/${record.name}/${record.latest_version}`}> 查看 </Link>
                        </Button> */}
                        {/* <span style={{padding: '0 2px'}}> </span>
                        <Button>
                            <Link to={`/template/${record.app}/${record.name}/${record.latest_version}/clone`}> 克隆 </Link>
                        </Button> */}
                        <Button
                            onClick={()=>{
                                this.onViewTemplate(record.name, record.latest_version)
                            }}
                        > 查看 </Button>
                        <span style={{padding: '0 1px'}}> </span>
                        {
                            record.owner !== this.props.store.session.user_id ? (
                            <Button
                                onClick={()=>{
                                    this.onCloneTemplate(record.name, record.latest_version)
                                }}
                            > 克隆 </Button> ) : null
                        }
                        <span style={{padding: '0 1px'}}> </span>
                        <Button
                            type="primary"
                            onClick={()=>{
                                this.onAddTemplate(config, record.name, record.conf_name, record.description, record.latest_version)
                            }}
                        > 添加 </Button>
                    </span>) : (
                    <span>
                        <Button
                            onClick={()=>{
                                this.onViewTemplate(record.name)
                            }}
                        > 查看 </Button>
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
                    选择模板
                </Button>
                <Modal
                    title="选择模板"
                    visible={this.state.showTemplateSelection}
                    onOk={this.handleCancelAddTempList}
                    onCancel={this.handleCancelAddTempList}
                    wrapClassName={'templatesModal'}
                    okText="确定"
                    cancelText="取消"
                >
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            right: 300,
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
                            刷新
                        </Button>
                        <span style={{padding: '0 20px'}}> </span>
                        <Input.Search
                            placeholder="网关名称、描述、序列号"
                            onChange={this.search}
                            style={{ width: 200 }}
                        />
                        <span style={{padding: '0 2px'}}> </span>
                        <Button
                            type="primary"
                            onClick={this.onCreateNewTemplate}
                        >
                            创建新模板
                        </Button>
                    </div>
                    <Table
                        rowKey="key"
                        dataSource={templateStore}
                        columns={addTempLists}
                        pagination={false}
                        scroll={{ y: 240 }}
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
                        if (v.type === 'string') {
                            return this.render_string(key, v)
                        }
                        if (v.type === 'text') {
                            return this.render_text(key, v)
                        }
                        if (v.type === 'dropdown') {
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