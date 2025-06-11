import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBriefcaseFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_briefcase_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M6 4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V5H21C22.1046 5 23 5.89543 23 7V9.5H1V7C1 5.89543 1.89543 5 3 5H6V4ZM8 5H16V4H8V5Z"/><path d="M1 11H7.5V14.5H16.5V11H23V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V11Z"/><path d="M15 11H9V13H15V11Z"/></svg>;
}

const IconCozBriefcaseFill = React.forwardRef(IconCozBriefcaseFillComponent);
export default IconCozBriefcaseFill;
