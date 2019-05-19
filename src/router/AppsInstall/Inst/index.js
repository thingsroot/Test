import React from 'react';
import {inject, observer} from 'mobx-react';
import {Input} from 'antd';
import http from '../../../utils/Server';

@inject('store')
@observer
class Inst extends React.Component {
    instBlur = ()=>{
        if (this.props.store.codeStore.instNames === '' || this.props.store.codeStore.instNames === undefined) {
            this.props.store.codeStore.setErrorMessage('实例名不能为空')
        } else {
            this.props.store.codeStore.setErrorMessage('')
        }
    };

    instChange = (e)=>{
        this.props.store.codeStore.instNames = e.target.value;
        setTimeout(this.inst, 1000)
    };

    inst = ()=>{
        let sn = this.props.sn;
        http.post('/api/gateways_applications_refresh', {
            gateway: sn,
            id: 'refresh' + sn
        }).then(res=>{
            if (res.ok === true) {
                http.get('/api/gateways_applications_list?gateway=' + sn).then(res=>{
                    if (res.ok === true) {
                        let names = Object.keys(res.data);
                        names && names.length > 0 && names.map(item=>{
                            if (item === this.props.store.codeStore.instNames) {
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
        return (
            <div className="Inst">
                <p style={{lineHeight: '50px'}}>
                    <span className="spanStyle">实例名：</span>
                    <Input
                        type="text"
                        style={{width: '300px'}}
                        value={this.props.store.codeStore.instNames}
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