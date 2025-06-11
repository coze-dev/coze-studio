import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBoldComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_bold${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M5 2.7089C5 2.31738 5.31738 2 5.7089 2H12.4434C15.3798 2 17.7601 4.38038 17.7601 7.31672C17.7601 8.82192 17.1346 10.181 16.1294 11.1483C17.9413 12.095 19.1779 13.992 19.1779 16.1779C19.1779 19.31 16.6389 21.8491 13.5068 21.8491H5.7089C5.31738 21.8491 5 21.5317 5 21.1402V2.7089ZM7 10.5068H12.4434C14.2052 10.5068 15.6334 9.07853 15.6334 7.31672C15.6334 5.55491 14.2052 4 12.4434 4H7V10.5068ZM7 12.6334V19.7224H13.5068C15.4643 19.7224 17.0512 18.1355 17.0512 16.1779C17.0512 14.2204 15.4643 12.6334 13.5068 12.6334H7Z"/></svg>;
}

const IconCozBold = React.forwardRef(IconCozBoldComponent);
export default IconCozBold;
