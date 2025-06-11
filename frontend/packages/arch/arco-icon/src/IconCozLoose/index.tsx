import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLooseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_loose${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3 22 3.55228 21.5523 4 21 4H3C2.44772 4 2 3.55228 2 3zM14.7929 10.2071C15.1834 10.5976 15.8166 10.5976 16.2071 10.2071 16.5976 9.81658 16.5976 9.18342 16.2071 8.79289L12.7071 5.29289C12.5196 5.10536 12.2652 5 12 5 11.7348 5 11.4804 5.10536 11.2929 5.29289L7.79289 8.79289C7.40237 9.18342 7.40237 9.81658 7.79289 10.2071 8.18342 10.5976 8.81658 10.5976 9.20711 10.2071L12 7.41421 14.7929 10.2071zM9.20711 13.7929C8.81658 13.4024 8.18342 13.4024 7.79289 13.7929 7.40237 14.1834 7.40237 14.8166 7.79289 15.2071L11.2929 18.7071C11.4804 18.8946 11.7348 19 12 19 12.2652 19 12.5196 18.8946 12.7071 18.7071L16.2071 15.2071C16.5976 14.8166 16.5976 14.1834 16.2071 13.7929 15.8166 13.4024 15.1834 13.4024 14.7929 13.7929L12 16.5858 9.20711 13.7929zM3 20C2.44772 20 2 20.4477 2 21 2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21 22 20.4477 21.5523 20 21 20H3z"/></svg>;
}

const IconCozLoose = React.forwardRef(IconCozLooseComponent);
export default IconCozLoose;
