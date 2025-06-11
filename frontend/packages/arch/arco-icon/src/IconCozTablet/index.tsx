import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTabletComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tablet${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M20.8549 5H3.1451C3.06496 5 3 5.06496 3 5.1451V18.8549C3 18.935 3.06496 19 3.1451 19H20.8549C20.935 19 21 18.935 21 18.8549V5.1451C21 5.06496 20.935 5 20.8549 5ZM3.1451 3C1.96039 3 1 3.96039 1 5.1451V18.8549C1 20.0396 1.96039 21 3.1451 21H20.8549C22.0396 21 23 20.0396 23 18.8549V5.1451C23 3.96039 22.0396 3 20.8549 3H3.1451Z"/><path fillRule="evenodd" clipRule="evenodd" d="M6.99991 16C6.99991 15.4477 7.44762 15 7.99991 15H15.9999C16.5522 15 16.9999 15.4477 16.9999 16C16.9999 16.5523 16.5522 17 15.9999 17H7.99991C7.44762 17 6.99991 16.5523 6.99991 16Z"/></svg>;
}

const IconCozTablet = React.forwardRef(IconCozTabletComponent);
export default IconCozTablet;
