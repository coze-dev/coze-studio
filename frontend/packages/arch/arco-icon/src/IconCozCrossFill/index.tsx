import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCrossFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_cross_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.0298 4.44002C18.6393 4.04949 18.0062 4.04949 17.6156 4.44002L12.1769 9.87875L6.73819 4.44003C6.34766 4.04951 5.7145 4.04951 5.32397 4.44003L4.61687 5.14714C4.22634 5.53766 4.22634 6.17083 4.61687 6.56135L10.0556 12.0001L4.6169 17.4388C4.22637 17.8293 4.22637 18.4624 4.6169 18.853L5.324 19.5601C5.71453 19.9506 6.34769 19.9506 6.73822 19.5601L12.1769 14.1214L17.6156 19.5601C18.0061 19.9506 18.6393 19.9506 19.0298 19.5601L19.7369 18.853C20.1274 18.4625 20.1274 17.8293 19.7369 17.4388L14.2982 12.0001L19.737 6.56134C20.1275 6.17081 20.1275 5.53765 19.737 5.14713L19.0298 4.44002Z"/></svg>;
}

const IconCozCrossFill = React.forwardRef(IconCozCrossFillComponent);
export default IconCozCrossFill;
