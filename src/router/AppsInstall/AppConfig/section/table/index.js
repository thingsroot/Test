import React from 'react';
import './style.scss';
import { Table, Input, Select, Button, Form } from 'antd';

const EditableContext = React.createContext();

const EditableRow = ({ form, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);


class EditableCell extends React.Component {
    state = {
        editing: false
    };

    getInput = () => {
        const {columnReference, columnType, dataIndex, configStore} = this.props;

        let colRef = columnReference ? configStore.Value[columnReference] : []
        if (colRef === undefined) {
            colRef = []
        }

        if (columnType === 'number') {
            return (
            <Input ref={node => (this.input = node)}
                type="number"
                value={this.props.value}
                onPressEnter={this.save}
                onBlur={this.save}
            />)
        }
        if (columnType === 'template') {
            return (
            <div>
                <Input ref={node => (this.input = node)}
                    type="hidden"
                    value={this.props.value}
                    onChange={this.save}
                />
                <Select
                    defaultValue="请选择模板"
                    style={{width: '95%'}}
                >
                    {colRef.map((item)=>{
                        return (
                            <Select.Option
                                key={item.name}
                                onClick={(e) => {
                                    this.selectSave(e, dataIndex)
                                }}
                            >
                                {item.name}
                            </Select.Option>
                        )
                    })}
                </Select>
            </div>)
        }
        if (columnType === 'dropdown') {
            return (
            <div>
                <Input ref={node => (this.input = node)}
                    type="hidden"
                    onChange={this.save}
                />
                <Select
                    value={this.props.value}
                    style={{width: '95%'}}
                >
                    {this.props.values.map((item)=>{
                        return (
                            <Select.Option
                                key={typeof(item) !== 'object' ? item : item.value}
                                onClick={(e) => {
                                    this.selectSave(e, dataIndex)
                                }}
                            >
                                {typeof(item) !== 'object' ? item : item.name}
                            </Select.Option>
                        )
                    })}
                </Select>
            </div>)
        }
        return (
        <Input ref={node => (this.input = node)}
            onPressEnter={this.save}
            value={this.props.value}
            onBlur={this.save}
        /> )
    };
    selectSave = (e, dataIndex)=>{
        const { record, handleSave } = this.props;
        record[dataIndex] = e.key;
        this.toggleEdit();
        handleSave({ ...record });
    }
    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
        if (editing) {
            this.input.focus();
        }
        });
    };

    save = e => {
        const { record, handleSave } = this.props;
        this.form.validateFields((error, values) => {
        if (error && error[e.currentTarget.id]) {
            return;
        }
        this.toggleEdit();
        handleSave({ ...record, ...values });
        });
    };

    renderCell = form => {
        this.form = form;
        const { columnType, children, dataIndex, record, title } = this.props;
        columnType;
        const { editing } = this.state;
        return editing ? (
        <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
            rules: [
                {
                    required: true,
                    message: `${title} is required.`
                }
            ],
            initialValue: record[dataIndex]
            })(this.getInput())}
        </Form.Item>
        ) : (
        <div
            className="editable-cell-value-wrap"
            style={{ paddingRight: 24 }}
            onClick={this.toggleEdit}
        >
            {children}
        </div>
        );
    };

    render () {
        const {configStore, columnReference, columnType, editable, dataIndex, title, record, handleSave, children, ...restProps} = this.props;
        configStore, columnReference, columnType, dataIndex, title, record, handleSave

        return (
        <td {...restProps}>
            {editable ? (
            <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
            ) : (
            children
            )}
        </td>
        );
    }
}

class EditableTable extends React.Component {
    constructor (props) {
        super(props);

        this.columns = []

        this.state = {
            count: 0
        };
    }

    componentDidMount () {
        const {dataSource, tableColumns} = this.props
        if (dataSource !== undefined) {
            let max_key = 0
            dataSource.map(item => max_key < item.key ? max_key = item.key : max_key)
            this.setState({count: max_key + 1})
        } else {
            this.props.config.setValue([])
        }

        if (tableColumns === undefined) {
            return
        }
        let copy_columns = []
        tableColumns.map( (col, index) => {
            index;
            copy_columns.push({
                id: col.id,
                title: col.title,
                dataIndex: col.dataIndex,
                editable: col.editable,
                columnType: col.columnType,
                columnReference: col.columnReference,
                values: col.values,
                depends: col.depends,
                configStore: this.props.configStore
            })
        })
        copy_columns.push({
            title: '操作',
            dataIndex: '___operation',
            render: (text, record) =>
                this.props.dataSource.length >= 1 ? (
                    <Button
                        type="primary"
                        onClick={()=>{
                            this.handleDelete(record.key)
                        }}
                    >删除</Button>
                ) : null
        })
        this.columns = copy_columns
    }

    handleDelete = key => {
        let newData = [...this.props.dataSource];
        newData = newData.filter(item => item.key !== key)
        this.props.config.setValue(newData)
        this.props.onChange()
    };


    handleAdd = () => {
        const { count } = this.state;
        const { tableColumns, dataSource } = this.props;

        const newData = {key: count};
        if (tableColumns !== undefined && tableColumns.length > 0) {
            tableColumns.map( (col, index) => {
                index;
                if (col.default !== undefined) {
                    newData[col.dataIndex] = col.default
                } else {
                    if (col.columnType === 'template') {
                        newData[col.dataIndex] = '请选择模板'
                    } else if (col.columnType === 'number') {
                        newData[col.dataIndex] = 0
                    } else {
                        newData[col.dataIndex] = ''
                    }
                }
            })
        }
        this.setState({count: count + 1})
        this.props.config.setValue([...dataSource, newData])
        this.props.onChange()
    };

    handleSave = row => {
        let newData = [...this.props.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row
        });
        this.props.config.setValue(newData)
        this.props.onChange()
    };

    render () {
        const { config, tableColumns, onChange, dataSource } = this.props;
        config, tableColumns, onChange

        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell
            }
        };
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    columnType: col.columnType,
                    columnReference: col.columnReference,
                    values: col.values,
                    depends: col.depends,
                    configStore: col.configStore,
                    handleSave: this.handleSave
                })
            };
        });
        return (
        <div>
            <Button onClick={this.handleAdd}
                type="primary"
                style={{ marginBottom: 16 }}
            >
                Add
            </Button>
            <Table
                rowKey="key"
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

