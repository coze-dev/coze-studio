import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChipComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chip${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M8 9C8 8.44772 8.44772 8 9 8H15C15.5523 8 16 8.44772 16 9V15C16 15.5523 15.5523 16 15 16H9C8.44772 16 8 15.5523 8 15V9ZM10 14V10H14V14H10Z"/><path fillRule="evenodd" clipRule="evenodd" d="M16 2C16 1.44772 15.5523 1 15 1C14.4477 1 14 1.44772 14 2V3H10V2C10 1.44772 9.55229 1 9 1C8.44772 1 8 1.44772 8 2V3H6C4.34315 3 3 4.34315 3 6V8H2C1.44772 8 1 8.44772 1 9C1 9.55229 1.44772 10 2 10H3V14H2C1.44772 14 1 14.4477 1 15C1 15.5523 1.44772 16 2 16H3V18C3 19.6569 4.34315 21 6 21H8V22C8 22.5523 8.44772 23 9 23C9.55229 23 10 22.5523 10 22V21H14V22C14 22.5523 14.4477 23 15 23C15.5523 23 16 22.5523 16 22V21H18C19.6569 21 21 19.6569 21 18V16H22C22.5523 16 23 15.5523 23 15C23 14.4477 22.5523 14 22 14H21V10H22C22.5523 10 23 9.55229 23 9C23 8.44772 22.5523 8 22 8H21V6C21 4.34315 19.6569 3 18 3H16V2ZM6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6C5 5.44772 5.44772 5 6 5Z"/></svg>;
}

const IconCozChip = React.forwardRef(IconCozChipComponent);
export default IconCozChip;
