import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDistributeVerticalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_distribute_vertical${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.33325 11.8667C1.33325 11.5721 1.57203 11.3333 1.86659 11.3333H22.1333C22.4278 11.3333 22.6666 11.5721 22.6666 11.8667V12.8C22.6666 13.0945 22.4278 13.3333 22.1333 13.3333H1.86658C1.57203 13.3333 1.33325 13.0945 1.33325 12.8V11.8667zM5.33325 3.33332C5.33325 2.96513 5.63173 2.66666 5.99992 2.66666H17.9999C18.3681 2.66666 18.6666 2.96513 18.6666 3.33332V7.33332C18.6666 7.70151 18.3681 7.99999 17.9999 7.99999H5.99992C5.63173 7.99999 5.33325 7.70151 5.33325 7.33332V3.33332zM5.33325 16.6667C5.33325 16.2985 5.63173 16 5.99992 16H17.9999C18.3681 16 18.6666 16.2985 18.6666 16.6667V20.6667C18.6666 21.0348 18.3681 21.3333 17.9999 21.3333H5.99992C5.63173 21.3333 5.33325 21.0348 5.33325 20.6667V16.6667z"/></svg>;
}

const IconCozDistributeVertical = React.forwardRef(IconCozDistributeVerticalComponent);
export default IconCozDistributeVertical;
