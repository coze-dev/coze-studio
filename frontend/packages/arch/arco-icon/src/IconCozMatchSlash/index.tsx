import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMatchSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_match_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.22188 18.364C3.83135 18.7545 3.83135 19.3877 4.22188 19.7782 4.6124 20.1687 5.24557 20.1687 5.63609 19.7782L19.7782 5.63606C20.1688 5.24554 20.1688 4.61237 19.7782 4.22185 19.3877 3.83132 18.7545 3.83132 18.364 4.22185L4.22188 18.364zM7 6.00005C9.03081 6.00005 10.826 7.00898 11.9116 8.55293L10.4647 9.99978C9.77306 8.80433 8.48046 8.00005 7 8.00005 4.79086 8.00005 3 9.79091 3 12V14C3 14.5523 2.55228 15 2 15 1.44772 15 1 14.5523 1 14V12C1 8.68634 3.68629 6.00005 7 6.00005zM17 18C14.9692 18 13.174 16.9911 12.0884 15.4471L13.5353 14.0003C14.2269 15.1958 15.5195 16 17 16 19.2091 16 21 14.2092 21 12V10C21 9.44776 21.4477 9.00005 22 9.00005 22.5523 9.00005 23 9.44776 23 10V12C23 15.3138 20.3137 18 17 18z"/></svg>;
}

const IconCozMatchSlash = React.forwardRef(IconCozMatchSlashComponent);
export default IconCozMatchSlash;
