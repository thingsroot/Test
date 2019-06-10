import React, { Component } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

class EditorDesc extends Component {

    handleChange = (value)=>{
        this.props.onChange(value);
    };

    render () {
        return (
            <SimpleMDE
                id="your-custom-id"
                value={this.props.value}
                options={{
                    spellChecker: false,
                    toolbar: [
                        'bold',
                        'italic',
                        'heading',
                        '|',
                        'quote',
                        'code',
                        'table',
                        'horizontal-rule',
                        'unordered-list',
                        'ordered-list',
                        '|',
                        'link',
                        'image',
                        '|',
                        'preview'
                    ]
                }}

                onChange={this.handleChange}
            />
        )
    }
}

export default EditorDesc;