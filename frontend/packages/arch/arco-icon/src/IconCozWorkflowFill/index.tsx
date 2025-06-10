import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWorkflowFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_workflow_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14 7.18747L13.9759 7.14832L10 9.59503V9C10 7.89543 9.10457 7 8 7L3.5 7C2.39543 7 1.5 7.89543 1.5 9V15C1.5 16.1046 2.39543 17 3.5 17H8C9.10457 17 10 16.1046 10 15V14.332L14 16.6776V20.5C14 21.6046 14.8954 22.5 16 22.5H20.5C21.6046 22.5 22.5 21.6046 22.5 20.5V16C22.5 14.8954 21.6046 14 20.5 14H16C15.4105 14 14.8806 14.255 14.5145 14.6608L10 12.0135V11.9434L14.4184 9.22435C14.7843 9.69625 15.3567 10 16 10H20.5C21.6046 10 22.5 9.10457 22.5 8V3.5C22.5 2.39543 21.6046 1.5 20.5 1.5H16C14.8954 1.5 14 2.39543 14 3.5V7.18747Z"/></svg>;
}

const IconCozWorkflowFill = React.forwardRef(IconCozWorkflowFillComponent);
export default IconCozWorkflowFill;
