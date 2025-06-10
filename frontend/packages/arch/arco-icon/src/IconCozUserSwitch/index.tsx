import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUserSwitchComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_user_switch${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M11 12C13.7614 12 16 9.76142 16 7C16 4.23858 13.7614 2 11 2C8.23858 2 6 4.23858 6 7C6 9.76142 8.23858 12 11 12ZM11 10C12.6569 10 14 8.65685 14 7C14 5.34315 12.6569 4 11 4C9.34315 4 8 5.34315 8 7C8 8.65685 9.34315 10 11 10Z"/><path d="M8 15C5.79086 15 4 16.7909 4 19L4 20H11.9167C11.985 20.0933 12.0623 20.1836 12.1488 20.2701L13.8787 22H4C2.89543 22 2 21.1046 2 20V19C2 15.6863 4.68629 13 8 13H14C14.1411 13 14.2812 13.0049 14.4199 13.0145H14.0145C12.8101 13.0145 11.8046 13.8661 11.5675 15H8Z"/><path d="M14.0115 16.5115H22.3215C22.9451 16.5115 23.2575 15.7575 22.8165 15.3165L20.2064 12.7064C19.7655 12.2655 19.0115 12.5778 19.0115 13.2014V14.5115H14.0115C13.4592 14.5115 13.0115 14.9592 13.0115 15.5115 13.0115 16.0637 13.4592 16.5115 14.0115 16.5115zM22.0115 20.0115C22.5637 20.0115 23.0115 19.5637 23.0115 19.0115 23.0115 18.4592 22.5637 18.0115 22.0115 18.0115H13.7014C13.0778 18.0115 12.7655 18.7655 13.2064 19.2064L15.8165 21.8165C16.2575 22.2575 17.0115 21.9451 17.0115 21.3215V20.0115H22.0115z"/></svg>;
}

const IconCozUserSwitch = React.forwardRef(IconCozUserSwitchComponent);
export default IconCozUserSwitch;
