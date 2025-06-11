import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozConnectionStraightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_connection_straight${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M15 3C12.7909 3 11 4.79086 11 7V11H4.5C3.94772 11 3.5 11.4477 3.5 12C3.5 12.5523 3.94772 13 4.5 13H11V17C11 19.2091 12.7909 21 15 21H18C18.5523 21 19 20.5523 19 20C19 19.4477 18.5523 19 18 19H15C13.8954 19 13 18.1046 13 17V7C13 5.89543 13.8954 5 15 5H18C18.5523 5 19 4.55228 19 4C19 3.44772 18.5523 3 18 3H15Z"/></svg>;
}

const IconCozConnectionStraight = React.forwardRef(IconCozConnectionStraightComponent);
export default IconCozConnectionStraight;
