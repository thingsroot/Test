import React from 'react';
import './index.scss'
import { Row, Col} from 'antd'
import Editable from './Editable/index'
import Edituser from './Edituser/index'
class ShareGroup extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
        }
    }
    render () {
        return (
            <div className="share-device">
                <p className="manage">成员管理</p>
                <Row>
                    <Col span={6}>
                        <Edituser/>
                    </Col>
                    <Col span={1}/>
                    <Col span={17}>
                            <Editable/>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default ShareGroup