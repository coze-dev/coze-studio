import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAllFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_all_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.75 2C4.12665 2 2 4.12665 2 6.75 2 9.37335 4.12665 11.5 6.75 11.5H9.5C10.6046 11.5 11.5 10.6046 11.5 9.5V6.75C11.5 4.12665 9.37335 2 6.75 2zM6.75 12.5C4.12665 12.5 2 14.6266 2 17.25 2 19.8734 4.12665 22 6.75 22 9.37335 22 11.5 19.8734 11.5 17.25V14.5C11.5 13.3954 10.6046 12.5 9.5 12.5H6.75zM12.5 6.75C12.5 4.12665 14.6266 2 17.25 2 19.8734 2 22 4.12665 22 6.75 22 9.37335 19.8734 11.5 17.25 11.5H14.5C13.3954 11.5 12.5 10.6046 12.5 9.5V6.75zM14.5 12.5C13.3954 12.5 12.5 13.3954 12.5 14.5V17.25C12.5 19.8734 14.6266 22 17.25 22 19.8734 22 22 19.8734 22 17.25 22 14.6266 19.8734 12.5 17.25 12.5H14.5z"/></svg>;
}

const IconCozAllFill = React.forwardRef(IconCozAllFillComponent);
export default IconCozAllFill;
