import * as React from 'react';
import { IButtonDropdownInheritedProps } from './types';
import { ClassNames, userAgentsInclude, getParentsClasses } from '../utils';
import { Dropdown } from '../../ui';
import '../../../src/ui/buttonDropdown/buttonDropdown.module.scss';
import { v4 as uuidv4 } from 'uuid';
import { Portal } from '../portal/portal';

export const ButtonDropdown: React.SFC<IButtonDropdownInheritedProps> =
(props) => {
    let {
        children,
        className,
        directionVertical,
        directionHorizontal,
        disabled,
        dropdownClassName,
        multiple,
        opened,
        portal,
        portalId,
        portalSelector,
        onBlur,
        onClick,
        onOpen,
        onClose,
        ...attributesOriginal
    } = props,
        attributes: React.ButtonHTMLAttributes<HTMLButtonElement> = attributesOriginal,
        btn = null,
        list = null;

    let [directionHook, setDirectionHook] = React.useState(directionVertical);
    let [isOpenedHook, setIsOpenedHook] = React.useState(opened);
    const uniqueClass = React.useRef('kui-button-dropdown--' + uuidv4());
    const buttonRef = React.useRef(null);
    const dropdownRef = React.useRef(null);
    const dropdownContainerRef = React.useRef(null);
    const dropdownUniqueClass = (dropdownClassName) ? dropdownClassName + '--' + uniqueClass.current : null;

    className = ClassNames(
        'kui-button-dropdown',
        uniqueClass.current,
        (disabled) ? 'kui-button-dropdown--disabled' : null,
        (isOpenedHook) ? 'kui-button-dropdown--opened' : null,
        (portal) ? 'kui-button-dropdown--portal' : null,
        className
    );

    const classNameDropdown = ClassNames(
        'kui-button-dropdown__dropdown',
        (portal) ? 'kui-dropdown--portal' : null,
        (dropdownClassName) ? dropdownClassName + ' ' + dropdownUniqueClass : null
    );

    const calcDirection = () => {
        const button = buttonRef.current.getBoundingClientRect();
        if (portal) {
            dropdownContainerRef.current.style.top = 'unset';
            dropdownContainerRef.current.style.bottom = 'unset';
            dropdownContainerRef.current.style.left = 'unset';
            dropdownContainerRef.current.style.right = 'unset';
            if (directionHorizontal === 'left') {
                dropdownContainerRef.current.style.left = button.left + 'px';
            } else {
                dropdownContainerRef.current.style.right = (window.innerWidth - button.right) + 'px';
            }
        }
        if (directionVertical !== 'auto') {
            if (portal) {
                if (directionVertical === 'up') {
                    dropdownContainerRef.current.style.bottom = (window.innerHeight - button.top) + 'px';
                } else {
                    dropdownContainerRef.current.style.top = button.bottom + 'px';
                }
            }
            return;
        }

        directionHook = (button.top > window.innerHeight * 2 / 3) ? 'up' : 'down';
        setDirectionHook(directionHook);
        if (portal) {
            if (directionHook === 'up') {
                dropdownContainerRef.current.style.bottom = (window.innerHeight - button.top) + 'px';
            } else {
                dropdownContainerRef.current.style.top = button.bottom + 'px';
            }
        }
    }

    const dropdownAnimationEnd = () => {
        if (
            isOpenedHook
            && !userAgentsInclude(['edge', 'safari'])
        ) {
            dropdownRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        }
    }

    const setIsOpened = (isOpened: boolean) => {
        isOpenedHook = isOpened;
        setIsOpenedHook(isOpenedHook);
        if (isOpened && onOpen) {
            onOpen();
        } else if (!isOpened && onClose) {
            onClose();
        }
    }

    attributes.onClick = (e) => {
        setIsOpened(!isOpenedHook);
        if (isOpenedHook) {
            calcDirection();
        }
        if (onClick) onClick(e);
    }

    attributes.onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.persist();
        const checkClasses = [uniqueClass.current];
        if (dropdownUniqueClass) {
            checkClasses.push(dropdownUniqueClass);
        }
        const classes = getParentsClasses(
            e.relatedTarget as HTMLElement,
            checkClasses
        );
        if (
            classes.includes(uniqueClass.current) ||
            dropdownUniqueClass && classes.includes(dropdownUniqueClass)
        ) {
            if (multiple && e.target) {
                e.target.focus({ preventScroll: true });
            }
        } else {
            setIsOpened(false);
            if (onBlur) onBlur(e);
        }
    }

    const onChange = (e: any) => {
        if (!multiple) setIsOpened(false);
        if (attributes.onChange) attributes.onChange(e);
    }

    let childrenArray: Array<{}> = // children could be string, we need array
        (Array.isArray(children)) ? children : [children];

    list = React.Children.map(childrenArray, (child: any) => {
        if (!child || !child.props) return null;
        if (child.type.displayName === 'Button') {
            attributes.className = ClassNames(
                'kui-button-dropdown__item',
                child.props.className
            ),
            btn = React.cloneElement(child, attributes);
            return null;
        }
        if (child.type.displayName !== 'SelectList') return child;
        return React.cloneElement(child, {
            onChange
        });
    });

    React.useEffect(() => {
        dropdownContainerRef.current = dropdownRef.current.parentNode;
    }, []);

    const dropdownElement = (<Dropdown
        className={classNameDropdown}
        directionVertical={directionHook}
        directionHorizontal={directionHorizontal}
        opened={isOpenedHook}
        ref={dropdownRef}
        tabIndex={-1}
        onAnimationEnd={dropdownAnimationEnd}
    >
        {list}
    </Dropdown>);

    const dropdownPortal = portal
        ? <Portal
            id={portalId}
            selector={portalSelector}
        >
            {dropdownElement}
        </Portal>
        : dropdownElement;

    return (
        <div className={className} ref={buttonRef}>
            {btn}
            {dropdownPortal}
        </div>
    );
};

ButtonDropdown.defaultProps = {
    directionVertical: 'auto',
    directionHorizontal: 'left',
    disabled: false
};

ButtonDropdown.displayName = 'ButtonDropdown';
