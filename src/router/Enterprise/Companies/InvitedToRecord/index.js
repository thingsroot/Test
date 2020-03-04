import React, { PureComponent } from 'react'
import http from '../../../../utils/Server';

class InvitedToRecord extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            data: []
        }
    }
    componentDidMount () {
        http.get('/api/user_company_invitations_list').then(res=>{
            if (res.ok && res.data.length > 0) {
                this.setState({
                    data: res.data
                })
            }
        })
    }
    render () {
        return (
            <div></div>
        )
    }
}

export default InvitedToRecord