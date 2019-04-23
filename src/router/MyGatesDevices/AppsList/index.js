import React, { Component } from 'react';
import { Table, Switch, Button, Popconfirm, message, Icon } from 'antd';
import http from '../../../utils/Server';
// import { deviceAppOption } from '../../../utils/Session';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
function confirm (record, name, type, sn) {
  // name 是应用市场ID
  // record.device_name 是网关应用名称
  const update = {
    gateway: sn,
    app: name,
    inst: record.device_name,
    version: record.latestVersion,
    conf: {},
    id: `upgrade/${sn}/${name}/${record.name}/${new Date() * 1}`
  };
  if (type === 'update'){
    http.post('/api/gateways_applications_upgrade', update).then(res=>{
      console.log(res);
    })
    return false;
  }
  const data = {
    gateway: sn,
    inst: record.name,
    id: `app_upgrade/${sn}/ ${record.device_name}/${new Date() * 1}`
  }
  http.postToken('/api/applications_remove', data).then(res=>{
    console.log(res)
  })
  // const hide = message.loading('Action in progress..', 0);
  // setTimeout(hide, 2500);
  // const data = {
  //   data: {
  //     inst: record.info.inst,
  //     name: record.info.name
  //   },
  //   device: sn,
  //   id: `app_upgrade/${sn}/ ${record.info.inst}/${new Date() * 1}`
  // };
  // http.postToken('/api/method/iot.device_api.app_upgrade', data).then(res=>{
  //   if (res.message){
  //     setTimeout(() => {
  //       http.get(`/api/method/iot.device_api.get_action_result?id=${res.message}`).then(data=>{
  //         console.log(data)
  //         if (data && data.message.result){
  //           message.success('应用更新成功！')
  //         } else {
  //           message.error('应用更新失败，请重试！')
  //         }
  //       })
  //     }, 2000);
  //   }
  // })
}

function cancel () {
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
            dataIndex: 'data.data.icon_image',
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
            dataIndex: 'device_name',
            sorter: true,
            //render: name => `${name} ${name}`,
            width: '20%'
          }, {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
            render: (props, record)=>{
              if (record.latestVersion > props) {
                return (
                  <Popconfirm
                      title="Are you sure update this task?"
                      onConfirm={()=>{
                        confirm(record, record.name, 'update', this.props.match.params.sn)
                      }}
                      onCancel={cancel}
                      okText="Yes"
                      cancelText="No"
                  >
                    <a
                        href="#"
                        style={{color: 'blue'}}
                    >{props}  <Icon type="arrow-up"/></a>
                  </Popconfirm>
                )
              } else {
                return <span>{props}</span>
              }
            }
          }, {
            title: '设备数',
            dataIndex: 'devs_len',
            key: 'devs_len'
          }, {
            title: '状态',
            dataIndex: 'status',
            render: record=>{
              return (
                <span style={{background: '#00a65a', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
              )
            }
          }, {
            title: '启动时间',
            dataIndex: 'running'
          }, {
            title: '开机自启',
            dataIndex: 'auto',
            render: (props, record, )=>{
                return (
                <Switch checkedChildren="ON"
                    unCheckedChildren="OFF"
                    defaultChecked={props === 1 ? true : false}
                    onChange={()=>{
                      this.setAutoDisabled(record, props)
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
                    <Button>应用卸载</Button>
                  </Popconfirm>
                </div>
              )
            }
          }]
      }
      componentDidMount () {
        // http.get('/api/gateways_app_dev_len?name=da7f421dbd').then(res=>{
        //   console.log(res)
        // })
        http.post('/api/gateways_applications_start', {
          gateway: this.props.match.params.sn,
          inst: 'ioe_frpc',
          id: `start${this.props.match.params.sn}/ioe_frpc/${new Date() * 1}`
        }).then(res=>{
            http.get('/api/gateways_exec_result?id=' + res.data)
        })
        this.fetch(this.props.match.params.sn);
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
        const sn = nextProps.match.params.sn;
        this.setState({
          loading: true
        }, ()=>{
          this.fetch(sn);
        })
        }
      }
      setAutoDisabled (record, props){
        const { sn } = this.props.match.params;
        let type = props ? 0 : 1
        // let value = record.info.auto ? 0 : 1
        const data = {
          gateway: sn,
          inst: record.device_name,
          option: 'auto',
          value: type,
          id: `option/${sn}/${record.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_option', data).then(res=>{
          console.log(res)
          if (res.data){
            setTimeout(() => {
              http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                console.log(result)
              })
            }, 1000);
          }
        })
        // const message = deviceAppOption(record.info.inst, 'auto', value, this.props.store.appStore.status.sn, type, record.sn);
        // if (message !== null){
        //   this.fetch(sn)
        // }
        // http.post('/api/gateways_applications_' + type, data).then(res=>{
        //   console.log(res)
        // })
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
        http.postToken('/api/gateways_applications_refresh', {
          gateway: sn,
          id: `/gateways/refresh/${sn}/${new Date() * 1}`
        })
        const pagination = { ...this.state.pagination };
        http.get('/api/gateways_app_list?gateway=' + sn).then(res=>{
          // const keys = Object.keys(res)
          // const values = Object.values(res)
          // values.map((item, key)=>{
          //   if (item.running){
          //       item.status = 'running';
          //       item.running = new Date(parseInt(item.running) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
          //   }
          //   item.device_name = keys[key]
          // })
          this.props.store.appStore.setApplen(res.message.length)
          this.setState({
            data: res.message,
            loading: false,
            pagination
          })
          //this.props.store.appStore.setStatus(res.message)
        })
        // http.get('/api/method/iot_ui.iot_api.gate_applist?sn=' + sn).then((res) => {
        //     let data = res.message;
        //     data && data.length > 0 && data.map((item)=>{
        //       if (item.cloud){
        //         item.cloud.icon_image = 'http://cloud.thingsroot.com' + item.cloud.icon_image;
        //       }
        //       if (item.info.running){
        //           item.info.running = new Date(parseInt(item.info.running) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
        //       }
        //       if (item.info.auto === '1'){
        //           item.info.auto = true
        //       } else {
        //           item.info.auto = false
        //       }
        //       item.sn = item.info.sn;
        //   })
          // Read total count from server
          // pagination.total = data.totalCount;
          // pagination.total = 200;
        //});
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