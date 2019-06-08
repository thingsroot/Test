import React from 'react';
import {inject, observer} from 'mobx-react';
import {Input} from 'antd';
import {withRouter} from 'react-router-dom'
import http from '../../../utils/Server';
@withRouter
@inject('store')
@observer
class Inst extends React.Component {
    instBlur = ()=>{
        if (this.props.inst_name === '' || this.props.inst_name === undefined) {
            this.props.store.codeStore.setErrorMessage('实例名不能为空')
        } else {
            this.props.store.codeStore.setErrorMessage('')
        }
    };

    instChange = (e)=>{
        this.props.inst_name = e.target.value;
        setTimeout(this.inst, 1000)
    };

    inst = ()=>{
        let gateway_sn = this.props.gateway_sn;
        http.post('/api/gateways_applications_refresh', {
            gateway: gateway_sn,
            id: 'refresh' + gateway_sn
        }).then(res=>{
            if (res.ok === true) {
                http.get('/api/gateways_applications_list?gateway=' + gateway_sn).then(res=>{
                    if (res.ok === true) {
                        let names = Object.keys(res.data);
                        names && names.length > 0 && names.map(item=>{
                            if (item === this.props.inst_name) {
                                this.props.store.codeStore.setErrorMessage('实例名已存在')
                            } else {
                                this.props.store.codeStore.setErrorMessage('')
                            }
                        })

                    }
                })
            }
        })
    };

    render () {
        const { gateway_sn, inst_name, editable } = this.props;
        gateway_sn, inst_name, editable;
        return (
            <div className="Inst">
                <p style={{lineHeight: '50px'}}>
                    <span className="spanStyle">实例名：</span>
                    <Input
                        disabled={editable !== true}
                        type="text"
                        style={{width: '300px'}}
                        value={inst_name}
                        onChange={this.instChange}
                        onBlur={this.instBlur}
                    />
                    <span className="error">{this.props.store.codeStore.errorMessage}</span>
                </p>
            </div>
        )
    }
}
export default Inst;