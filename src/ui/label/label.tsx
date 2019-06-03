import * as React from 'react';
import { ILabelInheritedProps } from './types';
import { ClassNames } from '../utils';
import '../../../src/ui/label/label.module.scss';

export const Label: React.SFC<ILabelInheritedProps> =
(props) => {
    let {
        className,
        children,
        ...attributes
    } = props;

    className = ClassNames(
        'kui-label',
        className
    );

    return (
        <label
            className={className}
            {...attributes}
        >
            {children}
        </label>
    );
}

Label.displayName = 'Label';
