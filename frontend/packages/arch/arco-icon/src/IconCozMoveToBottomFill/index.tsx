import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozMoveToBottomFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_move_to_bottom_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22.4048 8.60134C22.3669 8.66459 22.3244 8.72467 22.2777 8.78113L13.4926 3.00514C12.8847 2.60607 12.1106 2.60607 11.4992 3.00514L2.72992 8.76263C2.33412 8.28135 2.26446 7.56896 2.60466 7.00126C2.71724 6.81351 2.87002 6.65379 3.05229 6.53329L11.7421 0.827934C12.2059 0.525292 12.7929 0.525292 13.2539 0.827934L21.9572 6.5501C22.6219 6.98725 22.8229 7.90358 22.4048 8.60134Z"/><path d="M22.2782 12.871C22.3249 12.8145 22.3673 12.7545 22.4053 12.6912C22.8234 11.9935 22.6224 11.0771 21.9576 10.64L13.2544 4.91781C12.7934 4.61517 12.2063 4.61517 11.7426 4.91781L3.05278 10.6232C2.87051 10.7437 2.71773 10.9034 2.60515 11.0911C2.26495 11.6588 2.33461 12.3712 2.7304 12.8525L11.4997 7.09501C12.1111 6.69594 12.8852 6.69594 13.4931 7.09501L22.2782 12.871Z"/><path d="M11.7534 23.2616L3.05278 17.5423C2.38804 17.1051 2.18701 16.1888 2.60515 15.491C2.71773 15.3033 2.87051 15.1435 3.05278 15.023L11.7426 9.31769C12.2063 9.01505 12.7934 9.01505 13.2544 9.31769L21.9576 15.0399C22.6224 15.477 22.8234 16.3933 22.4053 17.0911C22.2927 17.2788 22.1399 17.4386 21.9576 17.5591L13.2624 23.2672C12.7987 23.5699 12.2117 23.5699 11.7507 23.2672L11.7534 23.2616Z"/></svg>;
}

const IconCozMoveToBottomFill = React.forwardRef(IconCozMoveToBottomFillComponent);
export default IconCozMoveToBottomFill;
