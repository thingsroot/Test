import React, { Component } from 'react';
import { Table, Switch, Button, Popconfirm, message } from 'antd';
import http from '../../../utils/Server';
import { deviceAppOption } from '../../../utils/Session';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
function confirm (record, sn) {
  console.log(record);
  const hide = message.loading('Action in progress..', 0);
  setTimeout(hide, 2500);
  const data = {
    data: {
      inst: record.info.inst,
      name: record.info.name
    },
    device: sn,
    id: `app_upgrade/${sn}/ ${record.info.inst}/${new Date() * 1}`
  };
  http.postToken('/api/method/iot.device_api.app_upgrade', data).then(res=>{
    if (res.message){
      setTimeout(() => {
        http.get(`/api/method/iot.device_api.get_action_result?id=${res.message}`).then(data=>{
          console.log(data)
          if (data && data.message.result){
            message.success('应用更新成功！')
          } else {
            message.error('应用更新失败，请重试！')
          }
        })
      }, 2000);
    }
  })
}

function cancel (e) {
  console.log(e);
  message.error('You have canceled the update');
}
@withRouter
@inject('store') @observer

class AppsList extends Component {
      state = {
          data: [],
          pagination: {},
          loading: true,
          url: window.location.pathname,
          columns: [{
            title: '',
            dataIndex: 'cloud.icon_image',
            key: 'img',
            width: '100px',
            render: (record)=>{
              return (
              <img src={record}
                  style={{width: 50, height: 50}}
              />
              )
            }
          }, {
            title: '实例名',
            dataIndex: 'info.inst',
            sorter: true,
            //render: name => `${name} ${name}`,
            width: '20%'
          }, {
            title: '版本',
            dataIndex: 'info.version',
            key: 'info.version'
          }, {
            title: '设备数',
            dataIndex: 'info.devs_len',
            key: 'info.devs_len'
          }, {
            title: '状态',
            dataIndex: 'email'
          }, {
            title: '启动时间',
            dataIndex: 'info.running'
          }, {
            title: '开机自启',
            dataIndex: 'info.auto',
            render: (props, record, )=>{
                return (
                <Switch checkedChildren="ON"
                    unCheckedChildren="OFF"
                    defaultChecked={props}
                    onChange={()=>{
                      this.setAutoDisabled(record)
                    }}
                />)
            }
          }, {
            title: '操作',
            dataIndex: '',
            render: (record)=>{
              record
              return (
                <div>
                  <Popconfirm
                      title="Are you sure update this app?"
                      onConfirm={()=>{
                        confirm(record, this.props.match.params.sn)
                      }}
                      onCancel={cancel}
                      okText="Yes"
                      cancelText="No"
                  >
                    <Button>应用升级</Button>
                  </Popconfirm>
                </div>
              )
            }
          }]
      }
      componentDidMount () {
        this.fetch(this.props.match.params.sn);
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
        const sn = nextProps.match.params.sn;
        console.log(sn)
        this.setState({
          loading: true
        }, ()=>{
          this.fetch(sn);
        })
        }
      }
      setAutoDisabled (record){
        const { sn } = this.props.match.params;
        let type = record.info.auto ? 'disabled' : 'enable'
        let value = record.info.auto ? 0 : 1
        console.log(record, this)
        const message = deviceAppOption(record.info.inst, 'auto', value, this.props.store.appStore.status.sn, type, record.sn);
        if (message !== null){
          this.fetch(sn)
        }
      }
      handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
          pagination: pager
        });
        this.fetch({
          results: pagination.pageSize,
          page: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
          ...filters
        });
      }
      fetch = (sn) => {
        http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + sn).then(res=>{
          this.props.store.appStore.setStatus(res.message)
        })
        http.get('/api/method/iot_ui.iot_api.gate_applist?sn=' + sn).then((res) => {
            let data = res.message;
            data && data.length > 0 && data.map((item)=>{
              if (item.cloud){
                item.cloud.icon_image = 'http://cloud.thingsroot.com' + item.cloud.icon_image;
              }
              if (item.info.running){
                  item.info.running = new Date(parseInt(item.info.running) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
              }
              if (item.info.auto === '1'){
                  item.info.auto = true
              } else {
                  item.info.auto = false
              }
              item.sn = item.info.sn;
          })
          const pagination = { ...this.state.pagination };
          // Read total count from server
          // pagination.total = data.totalCount;
          // pagination.total = 200;
          this.setState({
            loading: false,
            data: data,
            pagination
          });
        });
      }
    render () {
      const { loading } = this.state;
        return (
            <div>
                <Table
                    rowKey="sn"
                    columns={this.state.columns}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                    bordered
                />
            </div>
        );
    }
}

export default AppsList;