import React, { Component } from 'react';
import { Table, Switch, Button, Popconfirm, message, Icon, Modal } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { exec_result } from '../../../utils/Session';
import MyGatesAppsUpgrade from '../../Upgrade';
let timer;
const confirm = (record, sn, _this)=>{
  console.log(_this)
  const data = {
    gateway: sn,
    inst: record.device_name,
    id: `app_remove/${sn}/${record.device_name}/${new Date() * 1}`
  }
  http.postToken('/api/gateways_applications_remove', data).then(res=>{
    console.log(res)
    if (res.data){
      timer = setInterval(() => {
        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
          if (result.data) {
            if (result.data.result) {
              message.success('应用卸载成功')
              clearInterval(timer)
              http.post('/api/gateways_applications_refresh', {
                gateway: sn,
                id: `gateways/refresh/${sn}/${new Date() * 1}`
              })
              console.log(this)
              _this.fetch(_this.props.match.params.sn)
            } else if (result.data.result === false) {
              message.error('应用卸载失败，请重试')
              clearInterval(timer)
            }
          }
        })
      }, 1000);
    }
  })
}

function cancel () {
  message.error('You have canceled the update');
}
@withRouter
@inject('store') @observer
class AppsList extends Component {
      constructor (props){
        super(props)
        this.state = {
          data: [],
          pagination: {},
          loading: true,
          visible: false,
          url: window.location.pathname,
          record: {},
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
                  // <Link
                  //     to={`/MyGatesAppsUpgrade/${this.props.match.params.sn}/${record.device_name}/${props}/${record.name}`}
                  //     style={{color: 'blue'}}
                  // >
                    // {props} <Icon type="arrow-up"/>
                    <Button
                        type="primary"
                        onClick={()=>{
                          this.setState({
                            record
                          }, ()=>{
                            this.showModal()
                          })
                        }}
                    >
                     {props} <Icon type="arrow-up"/>
                    </Button>
                  // </Link>
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
              if (record === 'running'){
                return (
                  <span style={{background: '#00a65a', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              } else {
                return (
                  <span style={{background: '#f39c12', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                )
              }
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
                    defaultChecked={Number(props) === 0 ? false : true}
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
                        this.confirm(record, this.props.match.params.sn, this)
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
        this.confirm = confirm.bind(this)
      }
      componentDidMount () {
        this.fetch(this.props.match.params.sn);
        timer = setInterval(() => {
          this.fetch(this.props.match.params.sn)
        }, 10000);
      }
      UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.location.pathname !== this.props.location.pathname){
        clearInterval(timer);
        timer = setInterval(() => {
          this.fetch(nextProps.match.params.sn)
        }, 10000);
        this.setState({
          loading: true
        }, ()=>{
          this.fetch(nextProps.match.params.sn);
        })
        }
      }
      componentWillUnmount (){
        clearInterval(timer)
      }
      showModal = (record) => {
        console.log(record)
        this.setState({
          visible: true
        });
      }
      handleOk = () => {
        const {record} = this.state;
        console.log(record)
        this.setState({ loading: true });
        const data = {
          gateway: this.props.match.params.sn,
          app: record.name,
          inst: record.device_name,
          version: record.latestVersion,
          conf: {},
          id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
      }
      console.log(data)
      http.postToken('/api/gateways_applications_upgrade', data).then(res=>{
          timer = setInterval(() => {
              http.get('/api/gateways_exec_result?id=' + res.data).then(res=>{
                  if (res.ok){
                      message.success('应用升级成功')
                      clearInterval(timer)
                      // http.post('/api/gateways_applications_refresh', {
                      //     gateway: this.props.sn,
                      //     id: `gateways/refresh/${this.props.match.params.sn}/${new Date() * 1}`
                      // }).then(()=>{
                      //     this.props.history.go(-1)
                      // })
                  } else if (res.ok === false){
                      message.error('应用升级操作失败，请重试');
                      clearInterval(timer)
                  }
              })
          }, 1000);
      })
        setTimeout(() => {
          this.setState({ loading: false, visible: false });
        }, 3000);
      }
      handleCancel = () => {
        this.setState({ visible: false });
      }
      setAutoDisabled (record, props){
        const { sn } = this.props.match.params;
        let type = props ? 0 : 1;
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
            exec_result(res.data)
          }
        })
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
        const pagination = { ...this.state.pagination };
        http.get('/api/gateways_app_list?gateway=' + sn).then(res=>{
          this.props.store.appStore.setApplen(res.message.length)
          this.setState({
            data: res.message,
            loading: false,
            pagination
          })
        })
      }
    render () {
      const { loading, visible, record } = this.state;
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
                <Modal
                    visible={visible}
                    title="应用升级详情"
                    onOk={this.handleOk}
                    destroyOnClose
                    onCancel={this.handleCancel}
                    footer={[
                      <Button
                          key="back"
                          onClick={this.handleCancel}
                      >
                        取消
                      </Button>,
                      <Button
                          key="submit"
                          type="primary"
                          loading={loading}
                          onClick={this.handleOk}
                      >
                        升级
                      </Button>
                    ]}
                >
                  <MyGatesAppsUpgrade
                      version={record.version}
                      inst={record.device_name}
                      sn={this.props.match.params.sn}
                      app={record.name}
                  />
                </Modal>
            </div>
        );
    }
}

export default AppsList;