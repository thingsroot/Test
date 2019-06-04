import React, { Component } from 'react';
import { Button, Switch, Popconfirm, message, Modal, Input } from 'antd';
import http from '../../../../utils/Server';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import MyGatesAppsUpgrade from '../../../Upgrade';
import { _getCookie } from '../../../../utils/Session';
let timer;
function cancel () {
    message.error('You have canceled the update');
  }
@withRouter
@inject('store')
@observer
class Action extends Component {
    state = {
        visible: false,
        upgradeLoading: false,
        setName: false,
        setNameConfirmLoading: false,
        appdebug: false
    }
    componentWillUnmount (){
      clearInterval(this.t1);
      clearInterval(timer)
    }
    confirm = (record, sn)=>{
       if (!this.props.store.appStore.actionSwi) {
        const data = {
          gateway: sn,
          inst: record.inst_name,
          id: `app_remove/${sn}/${record.inst_name}/${new Date() * 1}`
        }
        http.postToken('/api/gateways_applications_remove', data).then(res=>{
          if (res.data){
            timer = setInterval(() => {
              http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                if (result.ok) {
                  if (result.data) {
                    if (result.data.result) {
                      message.success('应用卸载成功,请稍后...')
                      clearInterval(timer)
                      this.props.update_app_list()
                    } else if (result.data.result === false) {
                      message.error('应用卸载失败，请重试')
                      clearInterval(timer)
                    }
                  }
                }
              })
            }, 1000);
          }
        })
       }
      }
      handleCancel = () => {
        this.setState({
          visible: false
        });
      };
      showModal = (type) => {
        this.setState({
          [type]: true
        });
      }
      setAutoDisabled (record, props){
        const { sn } = this.props.match.params;
        let type = props ? 0 : 1;
        const data = {
          gateway: sn,
          inst: record.inst_name,
          option: 'auto',
          value: type,
          id: `option/${sn}/${record.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_option', data).then(res=>{
          if (res.ok){
            timer = setInterval(() => {
              http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                if (result.ok) {
                  if (result.data.result){
                    message.success((type === '1' ? '开启应用开机自启' : '禁止应用开机自启') + '成功，请稍后...')
                    clearInterval(timer)
                  } else {
                    clearInterval(timer)
                    message.error(result.data.message)
                  }
                }
              })
            }, 3000);
          }
        })
      }
      handleOk = () => {
        const {record} = this.props;
        this.setState({ visible: true });
        const data = {
          gateway: this.props.match.params.sn,
          app: record.name,
          inst: record.inst_name,
          version: record.latestVersion,
          conf: {},
          id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.postToken('/api/gateways_applications_upgrade', data).then(res=>{
          timer = setInterval(() => {
              http.get('/api/gateways_exec_result?id=' + res.data).then(res=>{
                  if (res.ok){
                      message.success('应用升级成功')
                      clearInterval(timer)
                      this.props.update_app_list()
                  } else if (res.ok === false){
                      message.error('应用升级操作失败，请重试');
                      clearInterval(timer)
                  }
              })
          }, 3000);
      })
        setTimeout(() => {
          this.setState({ upgradeLoading: false, visible: false });
        }, 3000);
      }
      appSwitch = (type) =>{
        let action = '';
        if (type === 'stop'){
          action = '关闭'
        } else if (type === 'start'){
          action = '开启'
        } else {
          action = '重启'
        }
          const data = type === 'stop' || type === 'restart' ? {
            gateway: this.props.match.params.sn,
            inst: this.props.record.inst_name,
            reason: 'reason',
            id: `gateways/${type}/${this.props.match.params.sn}/${new Date() * 1}`
        } : {
            gateway: this.props.match.params.sn,
            inst: this.props.record.inst_name,
            id: `gateways/${type}/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_' + type, data).then(res=>{
            if (res.ok) {
              this.t1 = setInterval(() => {
                http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                  if (result.ok) {
                    if (result.data.result){
                      message.success(action + '应用成功，请稍后...')
                      clearInterval(this.t1)
                    } else {
                      clearInterval(this.t1)
                      message.error(result.data.message)
                    }
                  }
                  this.props.update_app_list()
                })
              }, 3000);
            }
        })
      }
      sendForkCreate (record){
        http.post('/api/applications_forks_create', {
          name: record.name,
          version: Number(record.version)
        }).then(res=>{
          if (res.ok){
            if (res.message){
              this.props.history.push('/AppEditorCode/' + res.message.name + '/' + res.message.app_name);
              this.setState({appdebug: false})
            }
          } else {
            if (res.error && res.error.indexOf('已经克隆过') !== -1){
              http.get('/api/applications_forks_list?name=' + record.name + '&version=' + record.version).then(result=>{
                if (result.ok){
                  if (result.data && result.data.length > 0){
                    this.props.history.push('/AppEditorCode/' + result.data[0].name + '/' + result.data[0].app_name);
                    this.setState({appdebug: false})
                  } else {
                    this.setState({appdebug: false})
                  }
                }
              })
            } else {
              message.error(res.error)
              this.setState({appdebug: false})
            }
          }
        })
      }
      isfork (record){
        if (record.data){
          if (record.data.data.owner !== _getCookie('user_id')){
            this.setState({appdebug: false})
          } else {
            this.sendForkCreate(record)
          }
        }
      }
    render () {
        const { actionSwi } = this.props.store.appStore;
        const { record } = this.props;
        const { upgradeLoading, visible, setName, setNameConfirmLoading, nameValue, appdebug } = this.state;
        return (
            <div style={{position: 'relative', paddingBottom: 50}}>
              <div style={{lineHeight: '30px', paddingLeft: 20}}>
                <div>
                  应用名称:{record.data && record.data.data.name || '本地应用'}
                </div>
                <div>
                  应用开发者：{record.data && record.data.data.owner || _getCookie('companies')}
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20, minWidth: 840, position: 'absolute', right: 20, bottom: 15}}>
                <Button
                    disabled={actionSwi}
                    onClick={()=>{
                        this.showModal('setName')
                    }}
                >
                    更改名称
                </Button>
                  <Button
                      disabled={!this.props.record.data}
                      onClick={()=>{
                          if (this.props.record.data){
                            this.props.store.appStore.apppage = this.props.record.data.data
                            this.props.getconfig(this.props.record.name, this.props.record.conf)
                            this.props.store.codeStore.instNames = this.props.record.inst_name
                            this.props.store.codeStore.instflag = false;
                          }
                          this.props.store.appStore.toggle = false;
                      }}
                  >
                      应用配置
                  </Button>
                <Button
                    onClick={()=>{
                      this.showModal('appdebug')
                    }}
                >
                    应用调试
                </Button>
                <Button
                    disabled={record.latestVersion <= record.version || actionSwi}
                    onClick={()=>{
                        this.showModal('visible')
                    }}
                >
                    更新版本
                </Button>
                    <Button
                        onClick={()=>{
                          this.appSwitch('start')
                        }}
                        disabled={actionSwi}
                    >
                        启动应用
                      </Button>
                    <Button
                        disabled={actionSwi}
                        onClick={()=>{
                          this.appSwitch('stop')
                        }}
                    >
                        关闭应用
                      </Button>
                      <Button
                          onClick={()=>{
                            this.appSwitch('restart')
                          }}
                      >
                        重启应用
                      </Button>
                <div style={{paddingTop: 5}}>
                    <span>开机自启:</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Switch checkedChildren="ON"
                        unCheckedChildren="OFF"
                        defaultChecked={Number(record.auto) === 0 ? false : true}
                        disabled={actionSwi}
                        onChange={()=>{
                            this.setAutoDisabled(record, record.auto)
                        }}
                    />
                </div>
                <Popconfirm
                    disabled={actionSwi}
                    title="Are you sure update this app?"
                    onConfirm={()=>{
                        this.confirm(record, this.props.match.params.sn, this)
                    }}
                    onCancel={cancel}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button
                        disabled={actionSwi}
                        type="danger"
                    >应用卸载</Button>
                  </Popconfirm>
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
                            loading={upgradeLoading}
                            onClick={this.handleOk}
                        >
                            升级
                        </Button>
                        ]}
                    >
                    <MyGatesAppsUpgrade
                        version={record.version}
                        inst={record.inst_name}
                        sn={this.props.match.params.sn}
                        app={record.name}
                    />
                    </Modal>
                    <Modal
                        visible={appdebug}
                        title="应用调试"
                        onOk={()=>{
                            this.sendForkCreate(record)
                        }}
                        destroyOnClose
                        onCancel={()=>{
                            this.setState({appdebug: false})
                        }}
                    >
                        您不是{record.data && record.data.data.app_name}的应用所有者，如要继续远程调试，会将此应用当前版本克隆一份到您的账户下，而且在代码调试页面编辑的是您克隆的代码，在代码调试页面下载应用会将克隆到你名下的应用覆盖网关中的应用！
                        如要继续，点击"继续"按钮！
                    </Modal>
                    <Modal
                        visible={setName}
                        confirmLoading={setNameConfirmLoading}
                        title="更改实例名"
                        onOk={()=>{
                          this.setState({setNameConfirmLoading: true})
                          http.post('/api/gateways_applications_rename', {
                              gateway: this.props.match.params.sn,
                              inst: record.inst_name,
                              new_name: nameValue,
                              id: `gateway/rename/${nameValue}/${new Date() * 1}`
                          }).then(result=>{
                            if (result.ok) {
                              timer = setInterval(() => {
                                message.success('更改实例名成功请求发送成功，请稍后...')
                                this.setState({setName: false})
                                http.get('/api/gateways_exec_result?id=' + result.data).then(result=>{
                                  if (result.ok) {
                                    if (result.data.result){
                                      message.success('更改实例名成功!!!')
                                      clearInterval(timer)
                                    } else {
                                      clearInterval(timer)
                                      message.error(result.data.message)
                                    }
                                    this.props.update_app_list();
                                  }
                                })
                              }, 3000);
                            } else {
                              message.error(result.error)
                              this.setState({setNameConfirmLoading: false})
                            }
                          })
                        }}
                        destroyOnClose
                        onCancel={()=>{
                          this.setState({setName: false})
                        }}
                        afterClose={()=>{
                          this.setState({setNameConfirmLoading: false})
                        }}
                    >
                        <span>实例名: </span>
                        <Input
                            defaultValue={record.inst_name}
                            onChange={(e)=>{
                                this.setState({nameValue: e.target.value})
                            }}
                        />
                    </Modal>
              </div>
            </div>
        );
    }
}

export default Action;