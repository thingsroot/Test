import React, { PureComponent } from 'react';
import http from '../../utils/Server';
class MyAccessKey extends PureComponent {
    state = {
        data: ''
    }
    componentDidMount () {
        http.get('/api/user_token_read').then(res=>{
            if (res.ok){
                this.setState({
                    data: res.data
                })
            }
        })
    }
    render () {
        return (
            <div>
                {
                    this.state.data
                }
            </div>
        );
    }
}

export default MyAccessKey;