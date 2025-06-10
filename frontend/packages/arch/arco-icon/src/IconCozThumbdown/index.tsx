import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozThumbdownComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_thumbdown${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 14.9758V2.91236C3 2.41236 2.61057 1.92826 2 1.91236 1.32666 1.91236 1 2.41236 1 2.91236V14.9758C1 15.4758 1.39844 15.9758 2 15.9758 2.60156 15.9758 3 15.4758 3 14.9758zM14.5439 15.9766H18.8499C21.8455 15.9766 22.5335 13.3329 21.8455 11.3516L18.8499 3.46484C18.5968 2.54763 17.7538 1.91211 16.7917 1.91211H5.4987C4.94642 1.91211 4.4987 2.35885 4.4987 2.91113 4.4987 3.34793 4.4987 3.79116 4.4987 3.91992V13.9229C4.4987 14.054 4.4987 14.5212 4.4987 14.9766 4.4987 15.5288 4.94642 15.9766 5.4987 15.9766H6.03227C6.35916 15.9766 6.66558 16.1359 6.85357 16.4033L11.0213 22.332C11.3033 22.7808 12.0648 23.1245 12.8764 22.7549 14.0938 22.2005 15.5511 20.9905 15.5511 18.9854 15.5511 18.2291 15.2154 17.2262 14.5439 15.9766zM18.8499 13.9688H11.1857L12.7752 16.9268C13.3038 17.9105 13.5433 18.626 13.5433 18.9854 13.5433 19.5679 13.421 20.2273 12.3756 20.7676L7.89645 14.3955C7.70846 14.1281 7.40204 13.9688 7.07515 13.9688H6.50656V3.91992H16.7917C16.854 3.91992 16.9025 3.95579 16.9144 3.99902L16.9395 4.08984 19.9572 12.0342C20.3539 13.2029 19.9582 13.9688 18.8499 13.9688z"/></svg>;
}

const IconCozThumbdown = React.forwardRef(IconCozThumbdownComponent);
export default IconCozThumbdown;
