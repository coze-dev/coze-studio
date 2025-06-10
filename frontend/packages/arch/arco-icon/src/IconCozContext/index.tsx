import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozContextComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_context${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M9.00001 4.5C9.00001 3.94772 9.44773 3.5 10 3.5L20 3.5C20.5523 3.5 21 3.94772 21 4.5 21 5.05228 20.5523 5.5 20 5.5L10 5.5C9.44773 5.5 9.00001 5.05229 9.00001 4.5zM3.00001 9.5C3.00001 8.94772 3.44773 8.5 4.00001 8.5H20C20.5523 8.5 21 8.94772 21 9.5 21 10.0523 20.5523 10.5 20 10.5H4.00001C3.44773 10.5 3.00001 10.0523 3.00001 9.5zM3.00001 14.5C3.00001 13.9477 3.44773 13.5 4.00001 13.5H20C20.5523 13.5 21 13.9477 21 14.5 21 15.0523 20.5523 15.5 20 15.5H4.00001C3.44773 15.5 3.00001 15.0523 3.00001 14.5zM3.00001 19.5C3.00001 18.9477 3.44773 18.5 4.00001 18.5H14C14.5523 18.5 15 18.9477 15 19.5 15 20.0523 14.5523 20.5 14 20.5H4.00001C3.44773 20.5 3.00001 20.0523 3.00001 19.5z"/><path d="M5.91471 6.88433C5.71653 7.17856 5.2835 7.17856 5.08532 6.88433L2.99386 3.77933C2.77016 3.44722 3.00813 3 3.40856 3L7.59147 3C7.9919 3 8.22987 3.44722 8.00617 3.77933L5.91471 6.88433zM18.0853 17.1157C18.2835 16.8214 18.7165 16.8214 18.9147 17.1157L21.0062 20.2207C21.2299 20.5528 20.9919 21 20.5915 21H16.4086C16.0081 21 15.7702 20.5528 15.9939 20.2207L18.0853 17.1157z"/></svg>;
}

const IconCozContext = React.forwardRef(IconCozContextComponent);
export default IconCozContext;
