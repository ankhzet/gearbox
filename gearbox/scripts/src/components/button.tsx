
import * as React from "react";
import DOMAttributes = __React.DOMAttributes;

export interface ButtonProps extends DOMAttributes {
	'class': string;
}

export class Button extends React.Component<ButtonProps, {}> {

	render() {
		let keys = Object.keys(this.props);
		let exclude = ['class'];
		let props = {};
		for (let key of keys)
			if (exclude.indexOf(key) < 0)
				props[key] = this.props[key];

		return (
			<button {...props} type="button" className={ `btn btn-default ${this.props.class}` }>
				{ this.props.children }
			</button>
		);
	}

}
