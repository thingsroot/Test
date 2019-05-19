import React from 'react';
import {
    Table,
    Input,
    Button, Form, Select
} from 'antd';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';

const FormItem = Form.Item;
const EditableContext = React.createContext();
const Option = Select.Option;

const EditableRow = ({ form, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
@withRouter
@inject('store')
@observer
class EditableCell extends React.Component {
    state = {
        editing: false
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                // this.input.focus();
            }
        });
    }

    save = (e) => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            handleSave({ ...record, ...values });
        });
    };

    selectSave = (e)=>{
        const { record, handleSave } = this.props;
        let values = e.key;
        record.tpl = values;
        this.toggleEdit();
        handleSave({ ...record, values });
    };

    render () {
        const { editing } = this.state;
        const {
            id,
            editable,
            dataIndex,
            title,
            record,
            // index,
            // handleSave,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? (
                                    <FormItem style={{ margin: 0 }}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: [{
                                                required: true,
                                                message: `${title} is required.`
                                            }],
                                            initialValue: record[dataIndex]
                                        })(
                                            id !== 'template'
                                            ? <Input
                                                ref={node => (this.input = node)}
                                                onPressEnter={this.save}
                                                onBlur={this.save}
                                              />
                                            : <div>
                                                    <Input
                                                        type="hidden"
                                                        ref={node => (this.input = node)}
                                                        onChange={this.save}
                                                        value={this.state.template}
                                                    />
                                                    <Select
                                                        defaultValue="请选择模板"
                                                        style={{width: '95%'}}
                                                    >
                                                        {this.props.store.codeStore.template.map((w)=>{
                                                            return (
                                                                <Option
                                                                    key={w}
                                                                    onClick={this.selectSave}
                                                                >
                                                                    {w}
                                                                </Option>
                                                            )
                                                        })}
                                                    </Select>
                                                </div>
                                        )}
                                    </FormItem>
                                ) : (
                                    <div
                                        className="editable-cell-value-wrap"
                                        style={{ paddingRight: 24 }}
                                        onClick={this.toggleEdit}
                                    >
                                        {restProps.children}
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) : restProps.children}
            </td>
        );
    }
}
@inject('store')
@observer
class EditableTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dataSource: [],
            count: 0
        };
    }

    handleDelete = (key, name) => {
        const dataSource = [...this.state.dataSource];
        this.setState({
            dataSource: dataSource.filter(item => item.key !== key)
        }, ()=>{
            let allTableData = this.props.store.codeStore.allTableData;
            allTableData[name] = this.state.dataSource;
        });
    };

    handleAdd = (name) => {
        const { count, dataSource } = this.state;
        let deviceColumns = this.props.deviceColumns[0];
        const newData = {};
        deviceColumns.map(item => {
            newData[item.dataIndex] = '1';
        });
        newData['key'] = count;
        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1
        }, ()=>{
            let allTableData = this.props.store.codeStore.allTableData;
            allTableData[name] = this.state.dataSource;
        });
    };

    handleSave = (row, name) => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row
        });
        this.setState({
            dataSource: newData
        }, ()=>{
            let allTableData = this.props.store.codeStore.allTableData;
            allTableData[name] = this.state.dataSource;
        });
    };

    render () {
        const { dataSource } = this.state;
        const name = this.props.tableName;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell
            }
        };
        let deviceColumns = this.props.deviceColumns[0];
        let arr = [];
        deviceColumns.map(item => {
            arr.push(item.dataIndex);
        });
        if (arr.indexOf('key') === -1) {
            deviceColumns.push({
                title: '操作',
                dataIndex: 'key',
                render: (text, record) => (
                    this.state.dataSource.length >= 1
                        ? (
                            <Button
                                type="primary"
                                href="javascript:;"
                                onClick={()=>{
                                    this.handleDelete(record.key, name)
                                }}
                            >删除</Button>
                        ) : null
                )
            })
        }
        const columns = deviceColumns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    id: col.id,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: (row)=>{
                        this.handleSave(row, name)
                    }
                })
            };
        });
        return (
            <div>
                <Button
                    onClick={()=>{
                    this.handleAdd(name)
                }}
                    type="primary"
                    style={{ marginBottom: 16 }}
                    disabled={this.props.store.codeStore.template.length === 0 ? true : false}
                >
                    添加行
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                />
            </div>
        );
    }
}
export default EditableTable;

