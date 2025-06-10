import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignCenterHorizontalComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_center_horizontal${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.90008 19.6278C6.90008 19.9223 7.29683 20.1611 7.78625 20.1611H9.61391C10.1033 20.1611 10.5001 19.9223 10.5001 19.6278V13.3333H13.4999V17.632C13.4999 17.9266 13.8967 18.1653 14.3861 18.1653H16.2138C16.7032 18.1653 17.0999 17.9266 17.0999 17.632V13.3333H22.1333C22.4278 13.3333 22.6666 13.0946 22.6666 12.8V11.8667C22.6666 11.5721 22.4278 11.3333 22.1333 11.3333H17.0999V6.36796C17.0999 6.07341 16.7032 5.83463 16.2138 5.83463L14.3861 5.83463C13.8967 5.83463 13.4999 6.07341 13.4999 6.36796V11.3333H10.5001V4.37223C10.5001 4.07768 10.1033 3.8389 9.61391 3.8389H7.78625C7.29683 3.8389 6.90008 4.07768 6.90008 4.37223V11.3333H1.86659C1.57203 11.3333 1.33325 11.5721 1.33325 11.8667V12.8C1.33325 13.0946 1.57203 13.3333 1.86659 13.3333H6.90008V19.6278Z"/></svg>;
}

const IconCozAlignCenterHorizontal = React.forwardRef(IconCozAlignCenterHorizontalComponent);
export default IconCozAlignCenterHorizontal;
