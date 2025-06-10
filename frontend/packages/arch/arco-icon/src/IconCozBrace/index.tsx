import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBraceComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_brace${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M17 1.5C18.6569 1.5 20 2.84315 20 4.5V9.5C20 10.3284 20.6716 11 21.5 11H22C22.5523 11 23 11.4477 23 12 23 12.5523 22.5523 13 22 13H21.5C20.6716 13 20 13.6716 20 14.5V19.5C20 21.1569 18.6569 22.5 17 22.5H16.5C15.9477 22.5 15.5 22.0523 15.5 21.5 15.5 20.9477 15.9477 20.5 16.5 20.5H17C17.5523 20.5 18 20.0523 18 19.5V14.5C18 13.5207 18.4022 12.6353 19.0505 12 18.4022 11.3647 18 10.4793 18 9.5V4.5C18 3.94772 17.5523 3.5 17 3.5H16.5C15.9477 3.5 15.5 3.05228 15.5 2.5 15.5 1.94772 15.9477 1.5 16.5 1.5H17zM4 19.5C4 21.1569 5.34315 22.5 7 22.5H7.5C8.05228 22.5 8.5 22.0523 8.5 21.5 8.5 20.9477 8.05228 20.5 7.5 20.5H7C6.44772 20.5 6 20.0523 6 19.5V14.5C6 13.5207 5.59777 12.6353 4.94949 12 5.59777 11.3647 6 10.4793 6 9.5V4.5C6 3.94772 6.44772 3.5 7 3.5H7.5C8.05228 3.5 8.5 3.05228 8.5 2.5 8.5 1.94772 8.05228 1.5 7.5 1.5H7C5.34315 1.5 4 2.84315 4 4.5V9.5C4 10.3284 3.32843 11 2.5 11H2C1.44772 11 1 11.4477 1 12 1 12.5523 1.44772 13 2 13H2.5C3.32843 13 4 13.6716 4 14.5V19.5z"/></svg>;
}

const IconCozBrace = React.forwardRef(IconCozBraceComponent);
export default IconCozBrace;
