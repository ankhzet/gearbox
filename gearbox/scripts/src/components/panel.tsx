import React from 'react';

export class Panel extends React.Component<{}, {}> {
    render() {
        return (
            <div className="col-lg-12">
                <div className="panel panel-default">{this.props.children}</div>
            </div>
        );
    }
}

export class PanelHeader extends React.Component<{}, {}> {
    render() {
        return (
            <div className="panel-heading">
                <h3 className="panel-title">{this.props.children}</h3>
            </div>
        );
    }
}

export class PanelBody extends React.Component<{}, {}> {
    render() {
        return <div className="panel-body">{this.props.children}</div>;
    }
}

export class PanelList extends React.Component<{}, {}> {
    render() {
        return <ul className="list-group">{this.props.children}</ul>;
    }
}

export class PanelFooter extends React.Component<{}, {}> {
    render() {
        return <div className="panel-footer">{this.props.children}</div>;
    }
}
