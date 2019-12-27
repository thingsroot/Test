import React, { PureComponent } from 'react'
import { _getCookie } from '../../utils/Session'
import CreateCompanies from './CreateCompanies';
import Companies from './Companies';
class enterprise extends PureComponent {
    render () {
        return (
            <div>
                {
                    _getCookie('companies') !== 'undefined'
                    ? <Companies />
                    : <CreateCompanies />
                }
            </div>
        )
    }
}

export default enterprise