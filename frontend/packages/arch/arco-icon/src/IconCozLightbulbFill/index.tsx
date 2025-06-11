import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozLightbulbFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_lightbulb_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M3.11311 11.3573C3.34782 14.1738 5.23846 16.5795 7.91973 17.4732C7.97026 17.4901 8.00991 17.5297 8.02676 17.5803L8.58114 19.2434C8.83128 19.9938 9.53354 20.5 10.3246 20.5H13.6754C14.4665 20.5 15.1687 19.9938 15.4189 19.2434L15.9732 17.5803C15.9901 17.5297 16.0297 17.4901 16.0803 17.4732C18.7615 16.5795 20.6522 14.1738 20.8869 11.3573L21 10C21 5.02944 16.9706 1 12 1C7.02944 1 3 5.02944 3 10L3.11311 11.3573ZM7.66987 12.5C7.19158 12.7761 6.57112 12.6139 6.37815 12.0964C6.129 11.4282 6 10.7184 6 10C6 8.94678 6.27724 7.91212 6.80385 7C7.33046 6.08788 8.08788 5.33046 9 4.80385C9.62218 4.44463 10.3014 4.20145 11.0046 4.08314C11.5492 3.99152 12 4.44772 12 5C12 5.55228 11.5453 5.98716 11.0101 6.12341C9.27977 6.56392 8 8.1325 8 9.99999C8 10.3749 8.05159 10.7378 8.14805 11.0819C8.29697 11.6132 8.14772 12.2241 7.66987 12.5Z"/><path d="M9 22.5C9 21.9477 9.44772 21.5 10 21.5H14C14.5523 21.5 15 21.9477 15 22.5C15 23.0523 14.5523 23.5 14 23.5H10C9.44772 23.5 9 23.0523 9 22.5Z"/></svg>;
}

const IconCozLightbulbFill = React.forwardRef(IconCozLightbulbFillComponent);
export default IconCozLightbulbFill;
