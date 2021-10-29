import React from 'react';

export interface GlyphProps {
    name: string;
}

export class Glyph extends React.Component<GlyphProps, {}> {
    render() {
        return <span className={`glyphicon glyphicon-${this.props.name}`} />;
    }
}
