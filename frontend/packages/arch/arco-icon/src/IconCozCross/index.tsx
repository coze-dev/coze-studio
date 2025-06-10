import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCrossComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cross${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.96977 17.7929C4.57925 18.1834 4.57925 18.8166 4.96977 19.2071C5.3603 19.5976 5.99346 19.5976 6.38399 19.2071L12.1769 13.4142L17.9698 19.2071C18.3603 19.5976 18.9935 19.5976 19.384 19.2071C19.7745 18.8166 19.7745 18.1834 19.384 17.7929L13.5911 12L19.384 6.20711C19.7745 5.81658 19.7745 5.18342 19.384 4.79289C18.9935 4.40237 18.3603 4.40237 17.9698 4.79289L12.1769 10.5858L6.38399 4.79289C5.99347 4.40237 5.3603 4.40237 4.96978 4.79289C4.57925 5.18342 4.57925 5.81658 4.96978 6.20711L10.7627 12L4.96977 17.7929Z"/></svg>;
}

const IconCozCross = React.forwardRef(IconCozCrossComponent);
export default IconCozCross;
