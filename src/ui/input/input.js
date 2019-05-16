import React, { useState, useEffect, useRef } from 'react';
import { PropTypes, ClassNames, ClassVariants } from '../utils';
import {default as autosizeLibray} from './autosize';
import { Icon, Label } from '../../ui';
import '../../../src/ui/input/input.module.scss';

export const Input = (props) => {
    let {
        autosize,
        className,
        disabled,
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
    const textarea = useRef(null);
    
    className = ClassNames(
        'kui-input',
        (disabled) ? 'kui-input--disabled' : null,
        (isFilled) ? 'kui-input--filled' : null,
        (!autosize) ? 'kui-input--noresize' : null,
        ClassVariants({variants, prefix: 'kui-input--variant_'}),
        className
    );

    attributes.type = 'text';
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
        if (e && (e.which === 10 || e.which === 13)) {
            if (!autosize) e.preventDefault();
            if (onEnter) onEnter(e);
        }
        if (onKeyDown) onKeyDown(e);
    };

    let blurTimeout; 

    /**
     * Проблема: при клике на иконку инпут получает одновременно onBlur и onFocus
     */

    attributes.onBlur = (e) => {
        blurTimeout = setTimeout(() => {
            if (isFocusedHook) {
                setIsFocusedHook(false);
                if (onBlur) onBlur(e);
            }
        }, 200);
    }

    attributes.onFocus = (e) => {
        clearTimeout(blurTimeout);
        setTimeout(() => {
            if (!isFocusedHook) {
                setIsFocusedHook(true);
                if (onFocus) onFocus(e);
            }
        }, 100);
    }

    if (label) {
        labelItem = (<div className="kui-label__item">{label}</div>);
    }

    useEffect(() => {
        if (autosize) autosizeLibray(textarea.current);
    }, []);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const clearSearch = () => {
        setIsFilled(false);
        setInputValue('');
        setTimeout(() => {
            if (isFocusedHook) textarea.current.blur();
        }, 100);
    };

    if (variants.includes('arrow')) {
        inputAfter = <Icon
            xlink="arrow-down"
            size={24}
            className="kui-input__icon-arrow"
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
            className="kui-input__icon-clear"
            onClick={clearSearch} />;
    }

    const Tag = (autosize) ? 'textarea' : 'input';

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
};

Input.propTypes = {
    autosize: PropTypes.bool,
    disabled: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    variants: PropTypes.arrayOf(PropTypes.string)
};

Input.defaultProps = {
    autosize: true,
    disabled: false,
    label: null,
    value: '',
    variants: []
};

export default Input;