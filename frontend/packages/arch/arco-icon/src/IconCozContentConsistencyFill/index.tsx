import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozContentConsistencyFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_content_consistency_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5 4C5 2.89543 5.89543 2 7 2H19C20.1046 2 21 2.89543 21 4V17C21 18.1046 20.1046 19 19 19V6C19 4.89543 18.1046 4 17 4L5 4Z"/><path fillRule="evenodd" clipRule="evenodd" d="M2 7.33333C2 6.32081 2.81642 5.5 3.82353 5.5H15.6765C16.6836 5.5 17.5 6.32081 17.5 7.33333V20.1667C17.5 21.1792 16.6836 22 15.6765 22H3.82353C2.81642 22 2 21.1792 2 20.1667V7.33333ZM14.5718 11.5C14.8479 11.5 15.0718 11.2761 15.0718 11V10.5C15.0718 10.2239 14.8479 10 14.5718 10H5.5C5.22386 10 5 10.2239 5 10.5V11C5 11.2761 5.22386 11.5 5.5 11.5H14.5718ZM11.8937 15.1619C11.8937 15.438 11.6698 15.6619 11.3937 15.6619H5.5C5.22386 15.6619 5 15.438 5 15.1619V14.6619C5 14.3857 5.22386 14.1619 5.5 14.1619H11.3937C11.6698 14.1619 11.8937 14.3857 11.8937 14.6619V15.1619Z"/></svg>;
}

const IconCozContentConsistencyFill = React.forwardRef(IconCozContentConsistencyFillComponent);
export default IconCozContentConsistencyFill;
