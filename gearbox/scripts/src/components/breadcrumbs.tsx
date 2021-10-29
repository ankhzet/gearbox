import React from 'react';
import { Link } from 'react-router-dom';

interface Crumb {
    title: string;
    link: string;
}

export interface BreadcrumbsProps {
    crumbs: Crumb[];
}

export class Breadcrumbs extends React.Component<BreadcrumbsProps, {}> {
    render() {
        return (
            <ol className="breadcrumb">
                {this.props.crumbs.map((crumb, idx) =>
                    idx < this.props.crumbs.length - 1 ? (
                        <li key={crumb.link}>
                            <Link to={crumb.link}>{crumb.title}</Link>
                        </li>
                    ) : (
                        <li key={crumb.link} className="active">
                            {crumb.title}
                        </li>
                    ),
                )}
            </ol>
        );
    }
}
