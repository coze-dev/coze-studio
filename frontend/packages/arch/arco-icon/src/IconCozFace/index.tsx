import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFaceComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_face${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM14 9.5C14 8.94772 14.4477 8.5 15 8.5C15.5523 8.5 16 8.94772 16 9.5V10.5C16 11.0523 15.5523 11.5 15 11.5C14.4477 11.5 14 11.0523 14 10.5V9.5ZM10 9.5C10 8.94772 9.55228 8.5 9 8.5C8.44772 8.5 8 8.94772 8 9.5V10.5C8 11.0523 8.44772 11.5 9 11.5C9.55228 11.5 10 11.0523 10 10.5V9.5ZM15.4547 14C15.7276 14 16.1007 14 16.5742 14C16.8355 14 17.0142 14.2679 16.8985 14.5021C16.8871 14.5251 16.8763 14.5465 16.8661 14.5658C15.9441 16.3108 14.1109 17.5 12 17.5C9.86821 17.5 8.0197 16.2871 7.10683 14.5139C6.98426 14.2758 7.17106 14 7.43885 14C7.46272 14 7.48518 14 7.50565 14C7.76947 14 8.12987 14 8.58683 14C8.60182 14 8.61847 14 8.63636 14C8.946 14 9.23424 14.147 9.43898 14.3793C9.48626 14.4329 9.53235 14.4827 9.57179 14.5207C10.2011 15.1271 11.057 15.5 12 15.5C12.9494 15.5 13.8104 15.122 14.441 14.5083C14.4767 14.4735 14.5182 14.4287 14.5609 14.3802C14.766 14.1476 15.0544 14 15.3645 14C15.3972 14 15.4278 14 15.4547 14Z"/></svg>;
}

const IconCozFace = React.forwardRef(IconCozFaceComponent);
export default IconCozFace;
