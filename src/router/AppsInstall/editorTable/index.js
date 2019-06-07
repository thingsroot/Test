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
            })(
                columnType === 'number' ? (
                    <Input ref={node => (this.input = node)}
                        type="number"
                        onPressEnter={this.save}
                        onBlur={this.save}
                    />
                ) : columnType === 'template' ? (
                    <div>
                        <Input
                            type="hidden"
                            ref={node => (this.input = node)}
                            onChange={this.save}
                        />
                        <Select
                            defaultValue="请选择模板"
                            style={{width: '95%'}}
                        >
                            {this.props.configStore.templates.map((item)=>{
                                return (
                                    <Select.Option
                                        key={item.name}
                                        onClick={this.selectSave}
                                    >
                                        {item.name}
                                    </Select.Option>
                                )
                            })}
                        </Select>
                    </div>
                ) : (
                    <Input ref={node => (this.input = node)}
                        onPressEnter={this.save}
                        onBlur={this.save}
                    />
                )
            )}
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
        const {columnType, editable, dataIndex, title, record, handleSave, children, ...restProps} = this.props;
        columnType, dataIndex, title, record, handleSave

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
            dataSource: [],
            count: 0
        };
    }

    componentDidMount () {
        const {dataSource, tableColumns} = this.props
        if (dataSource !== undefined) {
            this.setState({dataSource: dataSource})
        } else {
            this.setState({dataSource: []})
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
                columnType: col.columnType
            })
        })
        copy_columns.push({
            title: '操作',
            dataIndex: '___operation',
            render: (text, record) =>
            this.state.dataSource.length >= 1 ? (
                <Button
                    type="primary"
                    href="javascript:;"
                    onClick={()=>{
                        this.handleDelete(record.key)
                    }}
                >删除</Button>
            ) : null
        })
        this.columns = copy_columns
    }

    handleDelete = key => {
        const dataSource = [...this.state.dataSource];
        this.setState({
            dataSource: dataSource.filter(item => item.key !== key)
        }, ()=>{
            this.props.config.setValue(this.state.dataSource)
            this.props.onChange()
        });
    };


    handleAdd = () => {
        const { count, dataSource } = this.state;
        const { tableColumns } = this.props;

        const newData = {key: count};
        if (tableColumns !== undefined && tableColumns.length > 0) {
            tableColumns.map( (col, index) => {
                index;
                newData[col.dataIndex] = col.default !== undefined ? col.default : ''
            })
        }

        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1
        }, ()=>{
           this.props.config.setValue(this.state.dataSource)
           this.props.onChange()
        });
    };

    handleSave = row => {
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
            this.props.config.setValue(this.state.dataSource)
            this.props.onChange()
        });
    };

    render () {
        const { dataSource } = this.state;
        const { config, tableColumns, onChange } = this.props;
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
                    id: col.id,
                    columnType: col.columnType,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                    configStore: this.props.configStore
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

