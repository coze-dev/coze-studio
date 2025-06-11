import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRectangleMapComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_rectangle_map${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21 5H3L3 19H10.4595C10.832 19.5246 11.3663 19.9595 12.061 20.2267L13.2977 20.7024 13.4122 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3H21C22.1046 3 23 3.89543 23 5V13.0057C22.6412 12.0978 21.9073 11.3627 21 11.0023V5zM21 21H20.7023L22.9563 15.625C22.9715 15.5887 22.9861 15.5525 23 15.5162V19C23 20.1046 22.1046 21 21 21z"/><path fillRule="evenodd" clipRule="evenodd" d="M21.573 15.0449C22.2654 13.3939 20.6062 11.7347 18.9552 12.427L12.544 15.1156C10.8819 15.8126 10.9173 18.1797 12.5995 18.8267L14.4584 19.5417L15.1734 21.4006C15.8204 23.0827 18.1875 23.1181 18.8845 21.4561L21.573 15.0449ZM19.7286 14.2714L17.0401 20.6826L16.3251 18.8237C16.1219 18.2955 15.7045 17.8781 15.1764 17.675L13.3174 16.96L19.7286 14.2714Z"/></svg>;
}

const IconCozRectangleMap = React.forwardRef(IconCozRectangleMapComponent);
export default IconCozRectangleMap;
