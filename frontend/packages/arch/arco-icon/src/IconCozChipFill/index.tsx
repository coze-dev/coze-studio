import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozChipFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_chip_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10 10V14H14V10H10Z"/><path fillRule="evenodd" clipRule="evenodd" d="M15.2 1C15.8627 1 16.4 1.53726 16.4 2.2V3H18C19.6569 3 21 4.34315 21 6V7.59999H21.8C22.4628 7.59999 23 8.13725 23 8.79999C23 9.46273 22.4628 9.99999 21.8 9.99999H21V14H21.8C22.4628 14 23 14.5372 23 15.2C23 15.8627 22.4628 16.4 21.8 16.4H21V18C21 19.6569 19.6569 21 18 21H16.4V21.8C16.4 22.4627 15.8627 23 15.2 23C14.5372 23 14 22.4627 14 21.8V21H9.99999V21.8C9.99999 22.4627 9.46273 23 8.79999 23C8.13725 23 7.59999 22.4627 7.59999 21.8V21H6.00004C4.34318 21 3.00004 19.6569 3.00004 18V16.4H2.19994C1.5372 16.4 0.999939 15.8627 0.999939 15.2C0.999939 14.5372 1.5372 14 2.19994 14H3.00004V9.99999H2.19994C1.5372 9.99999 0.999939 9.46273 0.999939 8.79999C0.999939 8.13725 1.5372 7.59999 2.19994 7.59999H3.00004V6C3.00004 4.34315 4.34318 3 6.00004 3H7.59999V2.2C7.59999 1.53726 8.13725 1 8.79999 1C9.46273 1 9.99999 1.53726 9.99999 2.2V3H14V2.2C14 1.53726 14.5372 1 15.2 1ZM9.10004 7.60001C8.27161 7.60001 7.60004 8.27158 7.60004 9.10001V14.9C7.60004 15.7284 8.27161 16.4 9.10004 16.4H14.9C15.7285 16.4 16.4 15.7284 16.4 14.9V9.10001C16.4 8.27158 15.7285 7.60001 14.9 7.60001H9.10004Z"/></svg>;
}

const IconCozChipFill = React.forwardRef(IconCozChipFillComponent);
export default IconCozChipFill;
