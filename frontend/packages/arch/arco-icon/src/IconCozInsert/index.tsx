import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozInsertComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_insert${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4.5C2 3.94772 2.44772 3.5 3 3.5H21C21.5523 3.5 22 3.94772 22 4.5C22 5.05228 21.5523 5.5 21 5.5H3C2.44772 5.5 2 5.05228 2 4.5ZM2 9.5C2 8.94772 2.44772 8.5 3 8.5H21C21.5523 8.5 22 8.94772 22 9.5C22 10.0523 21.5523 10.5 21 10.5H3C2.44772 10.5 2 10.0523 2 9.5ZM14 13.5C13.4477 13.5 13 13.9477 13 14.5C13 15.0523 13.4477 15.5 14 15.5H21C21.5523 15.5 22 15.0523 22 14.5C22 13.9477 21.5523 13.5 21 13.5H14ZM13 19.5C13 18.9477 13.4477 18.5 14 18.5H21C21.5523 18.5 22 18.9477 22 19.5C22 20.0523 21.5523 20.5 21 20.5H14C13.4477 20.5 13 20.0523 13 19.5ZM2.32937 13.8561C2.10979 14.0875 2 14.411 2 14.8264V16.58C2 17.3337 2.21958 17.9183 2.65874 18.3337C3.10383 18.7432 3.70322 18.9479 4.4569 18.9479H6.69126V19.8559C6.69126 20.123 6.76248 20.3307 6.90491 20.479C7.05327 20.6274 7.23427 20.7016 7.44792 20.7016C7.66156 20.7075 7.86927 20.6304 8.07104 20.4701L10.706 18.3337C10.9018 18.1735 10.9997 17.9747 10.9997 17.7373C11.0057 17.4999 10.9078 17.304 10.706 17.1497L8.07104 15.0222C7.8752 14.862 7.67046 14.7848 7.45682 14.7908C7.24317 14.7967 7.06217 14.8709 6.91381 15.0133C6.76544 15.1557 6.69126 15.3575 6.69126 15.6186V16.5355H4.77737C4.53405 16.5355 4.41239 16.4139 4.41239 16.1705V14.7997C4.41239 14.4139 4.30261 14.1024 4.08303 13.865C3.86345 13.6217 3.57266 13.5 3.21065 13.5C2.84271 13.5 2.54895 13.6187 2.32937 13.8561Z"/></svg>;
}

const IconCozInsert = React.forwardRef(IconCozInsertComponent);
export default IconCozInsert;
