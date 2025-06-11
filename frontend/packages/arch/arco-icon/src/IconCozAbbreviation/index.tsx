import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAbbreviationComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_abbreviation${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 4.5C2 3.94772 2.44772 3.5 3 3.5H21C21.5523 3.5 22 3.94772 22 4.5 22 5.05228 21.5523 5.5 21 5.5H3C2.44772 5.5 2 5.05228 2 4.5zM18.4684 16.9998L21.2969 19.8283C21.6874 20.2188 21.6874 20.852 21.2969 21.2425 20.9063 21.633 20.2732 21.633 19.8826 21.2425L16.3471 17.707C16.1518 17.5117 16.0542 17.2558 16.0542 16.9998 16.0542 16.7439 16.1518 16.4879 16.3471 16.2926L19.8826 12.7571C20.2732 12.3666 20.9063 12.3666 21.2969 12.7571 21.6874 13.1476 21.6874 13.7808 21.2969 14.1713L18.4684 16.9998zM3 8.5C2.44772 8.5 2 8.94772 2 9.5 2 10.0523 2.44772 10.5 3 10.5H21C21.5523 10.5 22 10.0523 22 9.5 22 8.94772 21.5523 8.5 21 8.5H3zM2 14.5C2 13.9477 2.44772 13.5 3 13.5H13C13.5523 13.5 14 13.9477 14 14.5 14 15.0523 13.5523 15.5 13 15.5H3C2.44772 15.5 2 15.0523 2 14.5zM3 18.5C2.44772 18.5 2 18.9477 2 19.5 2 20.0523 2.44772 20.5 3 20.5H13C13.5523 20.5 14 20.0523 14 19.5 14 18.9477 13.5523 18.5 13 18.5H3z"/></svg>;
}

const IconCozAbbreviation = React.forwardRef(IconCozAbbreviationComponent);
export default IconCozAbbreviation;
