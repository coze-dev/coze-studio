import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tight${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M7.79289 4.29289C8.18342 3.90237 8.81658 3.90237 9.20711 4.29289L12 7.08579 14.7929 4.29289C15.1834 3.90237 15.8166 3.90237 16.2071 4.29289 16.5976 4.68342 16.5976 5.31658 16.2071 5.70711L12.7071 9.20711C12.5196 9.39464 12.2652 9.5 12 9.5 11.7348 9.5 11.4804 9.39464 11.2929 9.20711L7.79289 5.70711C7.40237 5.31658 7.40237 4.68342 7.79289 4.29289zM16.2071 19.7071C15.8166 20.0976 15.1834 20.0976 14.7929 19.7071L12 16.9142 9.20711 19.7071C8.81658 20.0976 8.18342 20.0976 7.79289 19.7071 7.40237 19.3166 7.40237 18.6834 7.79289 18.2929L11.2929 14.7929C11.4804 14.6054 11.7348 14.5 12 14.5 12.2652 14.5 12.5196 14.6054 12.7071 14.7929L16.2071 18.2929C16.5976 18.6834 16.5976 19.3166 16.2071 19.7071zM3 11C2.44772 11 2 11.4477 2 12 2 12.5523 2.44772 13 3 13H21C21.5523 13 22 12.5523 22 12 22 11.4477 21.5523 11 21 11H3z"/></svg>;
}

const IconCozTight = React.forwardRef(IconCozTightComponent);
export default IconCozTight;
