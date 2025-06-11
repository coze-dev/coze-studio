import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEasyOutComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_easy_out${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.63434 21.9308C2.1203 21.7288 1.8673 21.1484 2.06924 20.6343C4.81576 13.6432 7.12668 8.96287 9.97231 6.05107C12.9031 3.0521 16.3215 2 21 2C21.5523 2 22 2.44772 22 3C22 3.55228 21.5523 4 21 4C16.6785 4 13.8469 4.9479 11.4027 7.44893C8.87331 10.0371 6.68422 14.3568 3.93075 21.3657C3.7288 21.8797 3.14838 22.1327 2.63434 21.9308Z"/></svg>;
}

const IconCozEasyOut = React.forwardRef(IconCozEasyOutComponent);
export default IconCozEasyOut;
