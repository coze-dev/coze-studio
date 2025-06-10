import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozApplyComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_apply${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.9999 14.0001C13.1045 14.0001 13.9999 13.1046 13.9999 12.0001C13.9999 10.8955 13.1045 10.0001 11.9999 10.0001C10.8954 10.0001 9.99994 10.8955 9.99994 12.0001C9.99994 13.1046 10.8954 14.0001 11.9999 14.0001Z"/><path fillRule="evenodd" clipRule="evenodd" d="M22.9999 14C23.7145 12.7624 23.7145 11.2376 22.9999 9.99997L19.232 3.47369C18.5175 2.23609 17.197 1.47369 15.7679 1.47369H8.232C6.80294 1.47369 5.48243 2.23609 4.7679 3.47369L0.999949 9.99997C0.285418 11.2376 0.285418 12.7624 0.999948 14L4.7679 20.5263C5.48243 21.7639 6.80294 22.5263 8.232 22.5263H15.7679C17.197 22.5263 18.5175 21.7639 19.232 20.5263L22.9999 14ZM21.2679 11C21.6252 11.6188 21.6252 12.3812 21.2679 13L17.4999 19.5263C17.1427 20.1451 16.4824 20.5263 15.7679 20.5263H8.232C7.51747 20.5263 6.85721 20.1451 6.49995 19.5263L2.732 13C2.37473 12.3812 2.37473 11.6188 2.732 11L6.49995 4.47369C6.85721 3.85489 7.51747 3.47369 8.232 3.47369L15.7679 3.47369C16.4824 3.47369 17.1427 3.85489 17.4999 4.47369L21.2679 11Z"/></svg>;
}

const IconCozApply = React.forwardRef(IconCozApplyComponent);
export default IconCozApply;
