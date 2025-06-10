import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozShellComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_shell${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8.12132 9.46447C7.73079 9.07394 7.09763 9.07394 6.70711 9.46447 6.31658 9.85499 6.31658 10.4882 6.70711 10.8787L8.82843 13 6.70711 15.1213C6.31658 15.5118 6.31658 16.145 6.70711 16.5355 7.09763 16.9261 7.7308 16.9261 8.12132 16.5355L10.9497 13.7071C11.3403 13.3166 11.3403 12.6834 10.9497 12.2929L8.12132 9.46447zM13 14.5C12.4477 14.5 12 14.9477 12 15.5 12 16.0523 12.4477 16.5 13 16.5H17C17.5523 16.5 18 16.0523 18 15.5 18 14.9477 17.5523 14.5 17 14.5H13z"/><path fillRule="evenodd" clipRule="evenodd" d="M1 5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5ZM3 7H21V19H3V7Z"/></svg>;
}

const IconCozShell = React.forwardRef(IconCozShellComponent);
export default IconCozShell;
