import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozColumnCollapseComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_column_collapse${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1.66523 17.8217C1.29062 18.2275 1.31593 18.8602 1.72175 19.2348 2.12757 19.6094 2.76023 19.5841 3.13483 19.1783L9.13483 12.6783C9.48843 12.2952 9.48843 11.7048 9.13483 11.3217L3.13483 4.82173C2.76023 4.4159 2.12757 4.3906 1.72175 4.7652 1.31593 5.13981 1.29062 5.77246 1.66523 6.17828L7.03912 12 1.66523 17.8217zM22.3348 6.1783C22.7094 5.77248 22.6841 5.13982 22.2783 4.76521 21.8725 4.39061 21.2398 4.41592 20.8652 4.82174L14.8652 11.3217C14.5116 11.7048 14.5116 12.2952 14.8652 12.6783L20.8652 19.1783C21.2398 19.5841 21.8725 19.6094 22.2783 19.2348 22.6841 18.8602 22.7094 18.2276 22.3348 17.8217L16.9609 12 22.3348 6.1783z"/></svg>;
}

const IconCozColumnCollapse = React.forwardRef(IconCozColumnCollapseComponent);
export default IconCozColumnCollapse;
