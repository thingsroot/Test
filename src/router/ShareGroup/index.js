import React, { PureComponent } from 'react';
import './index.scss'
import { Row, Col} from 'antd'
import Edituser from './Edituser';
import Editable from './Editable';
class ShareGroup extends PureComponent {
    constructor (props) {
        super(props)
        this.state = {}
    }
    render () {
        return (
            <div className="share-group">
                <p className="manage">共享组管理</p>
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