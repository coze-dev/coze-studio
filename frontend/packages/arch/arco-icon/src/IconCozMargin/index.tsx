import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMarginComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_margin${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7 2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2C17 2.55228 16.5523 3 16 3H8C7.44772 3 7 2.55228 7 2Z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.5 4.5C5.39543 4.5 4.5 5.39543 4.5 6.5V17.5C4.5 18.6046 5.39543 19.5 6.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V6.5C19.5 5.39543 18.6046 4.5 17.5 4.5H6.5ZM17.5 6.5H6.5V17.5H17.5V6.5Z"/><path d="M23 8C23 7.44772 22.5523 7 22 7 21.4477 7 21 7.44772 21 8V16C21 16.5523 21.4477 17 22 17 22.5523 17 23 16.5523 23 16V8zM17 22C17 22.5523 16.5523 23 16 23H8C7.44771 23 7 22.5523 7 22 7 21.4477 7.44771 21 8 21H16C16.5523 21 17 21.4477 17 22zM1 16C1 16.5523 1.44772 17 2 17 2.55228 17 3 16.5523 3 16L3 8C3 7.44771 2.55229 7 2 7 1.44772 7 1 7.44771 1 8V16z"/></svg>;
}

const IconCozMargin = React.forwardRef(IconCozMarginComponent);
export default IconCozMargin;
