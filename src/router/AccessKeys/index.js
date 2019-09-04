import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Table, Popconfirm, message } from 'antd';

class AccessKeys extends PureComponent {
    state = {
        columns: [
            {
                key: 'value',
                dataIndex: 'value',
                title: 'AccessKey',
                width: '50%'
            },
            {   key: 'action',
                dataIndex: 'action',
                title: '操作',
                width: '50%',
                render: (records, val)=>{
                        const record = val.value;
                    return (
                        <Popconfirm
                            title={record ? '更换AccessKey会导致使用原有AccessKey的应用工作不正常,是否确认更新?' : '是否创建AccessKey'}
                            onConfirm={()=>{
                                this.confirm(record)
                            }}
                            onCancel={()=>{
                                this.cancel(record)
                            }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <span
                                style={{color: 'blue', cursor: 'pointer'}}
                            >{record ? '更新' : '创建'}</span>
                        </Popconfirm>
                    )
                }
            }
        ],
        dataSource: [
            {
                value: ''
            }
        ]
    }
    componentDidMount () {
        http.get('/api/user_token_read').then(res=>{
            if (res.ok){
                this.setState({
                    dataSource: [{value: res.data}]
                })
            }
        })
    }
    confirm = (record)=> {
        if (record) {
            http.post('/api/user_token_update').then(res=>{
                if (res.ok) {
                    this.setState({
                        dataSource: [{value: res.data}]
                    }, ()=>{
                        message.success('AccessKey更新成功');
                    })
                }
            })
        } else {
            http.post('/api/user_token_create').then(res=>{
                if (res.ok) {
                    this.setState({
                        dataSource: [{value: res.data}]
                    }, ()=>{
                        message.success('AccessKey创建成功');
                    })
                }
            })
        }
      }
    cancel = (record)=> {
        const action = record ? '更新' : '创建'
        message.error('取消' + action + 'AccessKey');
      }
    render () {
        const { columns, dataSource } = this.state;
        return (
            <div style={{boxSizing: 'border-box', padding: '0 20px'}}>
                <Table
                    pagination={false}
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="value"
                />
            </div>
        );
    }
}

export default AccessKeys;