import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozGoogleDriveFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_google_drive_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15.5514 14.7078L8.55138 2.60327H15.4487L22.4487 14.7078H15.5514ZM9.66813 15.7176L6.21948 21.7719H19.5049L22.9536 15.7176H9.66813ZM7.64002 4.11794L1.04651 15.7176L4.49516 21.7719L11.1871 10.1681L7.64002 4.11794Z"/></svg>;
}

const IconCozGoogleDriveFill = React.forwardRef(IconCozGoogleDriveFillComponent);
export default IconCozGoogleDriveFill;
