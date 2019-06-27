import React, { Component } from 'react';
import Editor from 'for-editor'

class EditorDesc extends Component {

    handleChange = (value)=>{
        this.props.onChange(value);
    };

    render () {
        return (
            <Editor
                style={{height: 400}}
                value={this.props.value}
                onChange={this.handleChange}
            />
        )
    }
}

export default EditorDesc;