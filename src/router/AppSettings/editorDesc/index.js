import React, { Component } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
class EditorDesc extends Component {

    handleChange = (value)=>{
        this.props.store.codeStore.setDescription(value);
        console.log(value)
    };

    render () {
        return (
            <SimpleMDE
                id="your-custom-id"
                value={this.props.store.codeStore.settingData.description}
                options={{
                    autofocus: true,
                    spellChecker: false
                }}
                onChange={this.handleChange}
            />
        )
    }
}

export default EditorDesc;