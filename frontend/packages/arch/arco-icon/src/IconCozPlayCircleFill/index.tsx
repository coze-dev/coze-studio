import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPlayCircleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_play_circle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM10.5586 6.9877L16.7687 11.1706C17.3571 11.567 17.3571 12.433 16.7687 12.8294L10.5586 17.0123C9.89442 17.4597 8.99999 16.9838 8.99999 16.1829V7.81709C8.99999 7.01624 9.89442 6.54029 10.5586 6.9877Z"/></svg>;
}

const IconCozPlayCircleFill = React.forwardRef(IconCozPlayCircleFillComponent);
export default IconCozPlayCircleFill;
