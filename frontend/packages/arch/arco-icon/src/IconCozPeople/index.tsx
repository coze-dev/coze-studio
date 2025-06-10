import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPeopleComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_people${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M17 7C17 9.76142 14.7614 12 12 12 9.23858 12 7 9.76142 7 7 7 4.23858 9.23858 2 12 2 14.7614 2 17 4.23858 17 7zM15 7C15 8.65685 13.6569 10 12 10 10.3431 10 9 8.65685 9 7 9 5.34315 10.3431 4 12 4 13.6569 4 15 5.34315 15 7zM3 19C3 15.6863 5.68629 13 9 13H15C18.3137 13 21 15.6863 21 19V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V19zM5 19C5 16.7909 6.79086 15 9 15H15C17.2091 15 19 16.7909 19 19V20H5L5 19z"/></svg>;
}

const IconCozPeople = React.forwardRef(IconCozPeopleComponent);
export default IconCozPeople;
