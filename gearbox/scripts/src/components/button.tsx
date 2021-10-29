import React, { ComponentProps } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
    class: string;
}

export class Button extends React.Component<ButtonProps> {
    render() {
        const keys = Object.keys(this.props);
        const exclude = ['class'];
        const props = {};
        for (const key of keys) if (exclude.indexOf(key) < 0) props[key] = this.props[key];

        return (
            <button {...props} type="button" className={`btn btn-default ${this.props.class}`}>
                {this.props.children}
            </button>
        );
    }
}
