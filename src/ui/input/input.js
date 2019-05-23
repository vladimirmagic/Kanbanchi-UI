import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { PropTypes, ClassNames, ClassVariants } from '../utils';
import {default as autosizeLibray} from './autosize';
import { Icon, Label } from '../../ui';
import '../../../src/ui/input/input.module.scss';

export const Input = forwardRef((props, ref) => {
    let {
        autosize,
        className,
        disabled,
        icon,
        label,
        value,
        variants,
        onBlur,
        onFocus,
        onChange,
        onEnter,
        onKeyDown,
        ...attributes
    } = props,
        labelItem = null,
        inputBefore = null,
        inputAfter = null;

    const [isFilled, setIsFilled] = useState(!!value);
    const [isFocusedHook, setIsFocusedHook] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [timeoutHook, setTimeoutHook] = useState(null);
    const textarea = useRef(null);
    
    className = ClassNames(
        'kui-input',
        (disabled) ? 'kui-input--disabled' : null,
        (isFilled) ? 'kui-input--filled' : null,
        (isFocusedHook) ? 'kui-input--focus' : null,
        (!autosize) ? 'kui-input--noresize' : null,
        ClassVariants({variants, prefix: 'kui-input--variant_'}),
        className
    );

    attributes.className = 'kui-input__item';
    if (disabled) {
        attributes.disabled = true;
    }

    attributes.onChange = e => {
        setIsFilled(!!e.target.value);
        setInputValue(e.target.value);
        if (onChange) onChange(e);
    };

    attributes.onKeyDown = e => {
        if (e && e.which === 13) {
            if (!autosize) e.preventDefault();
            if (onEnter) onEnter(e);
        }
        if (onKeyDown) onKeyDown(e);
    };

    /**
     * Проблема: при клике на иконку инпут получает одновременно onBlur и onFocus
     */

    attributes.onBlur = (e) => {
        e.persist();
        setTimeoutHook(setTimeout(() => {
            if (isFocusedHook) {
                setIsFocusedHook(false);
                if (onBlur) onBlur(e);
            }
        }, 200));
    }

    attributes.onFocus = (e) => {
        clearTimeout(timeoutHook);
        setTimeoutHook(setTimeout(() => {
            if (!isFocusedHook) {
                setIsFocusedHook(true);
                if (onFocus) onFocus(e);
            }
        }, 100));
    }

    if (label) {
        labelItem = (<div className="kui-label__item">{label}</div>);
    }

    const clearInput = (e) => {
        e.preventDefault();
        setIsFilled(false);
        setInputValue('');
    };

    if (variants.includes('arrow')) {
        inputAfter = <Icon
            xlink="arrow-down"
            size={24}
            className="kui-input__icon kui-input__icon--arrow"
        />;
    }

    if (variants.includes('search')) {
        inputBefore = (<span className="kui-input-search">
            <Icon
                xlink="search"
                size={24}
                className="kui-input-search__icon"
            />
            <span className="kui-input-search__placeholder">
                Search
            </span>
        </span>);
        inputAfter = <Icon
            xlink="clear"
            size={24}
            className="kui-input__icon kui-input__icon--clear"
            onClick={clearInput} />;
    }

    if (icon && variants.includes('withicon')) {
        inputAfter = <Icon
            xlink={icon}
            size={24}
            className="kui-input__icon"
        />;
    }

    if (variants.includes('datepicker')) {
        autosize = false;
        icon = icon || 'calendar';
        attributes.readOnly = true;
        const iconCalendar = <Icon
            xlink={icon}
            size={24}
            className="kui-input__icon"
        />;
        const iconClear = <Icon
            xlink="clear"
            size={24}
            className="kui-input__icon kui-input__icon--clear"
            onClick={clearInput}
        />;
        inputAfter = (isFilled) ? iconClear : iconCalendar;
    }

    const Tag = (autosize) ? 'textarea' : 'input';

    useEffect(() => {
        if (autosize) autosizeLibray(textarea.current);
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutHook);
        };
    }, [timeoutHook]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useImperativeHandle(ref, () => ({
        setIsFilled(value) {
            setIsFilled(!!value);
        }
    }));

    return (
        <Label className={className}>
            {labelItem}
            {inputBefore}
            <Tag 
                rows={1}
                ref={textarea}
                value={inputValue}
                {...attributes}
            ></Tag>
            {inputAfter}
        </Label>
    );
});

Input.variants = [
    'arrow',
    'datepicker',
    'grey',
    'withicon',
    'search'
];

Input.propTypes = {
    autosize: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    variants: PropTypes.arrayOf(PropTypes.string)
};

Input.defaultProps = {
    autosize: true,
    disabled: false,
    icon: null,
    label: null,
    value: '',
    variants: []
};

export default Input;