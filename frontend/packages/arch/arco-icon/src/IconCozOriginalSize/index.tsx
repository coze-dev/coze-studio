import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozOriginalSizeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_original_size${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M13 13H11V15H13V13zM11 9H13V11H11V9zM5 10.3799C5 10.5717 5.20707 10.6921 5.37373 10.5972L6.49038 9.96116V15.5C6.49038 15.7761 6.71424 16 6.99039 16H8C8.27614 16 8.5 15.7761 8.5 15.5V8.5C8.5 8.22386 8.27614 8 8 8H6.62158C6.53557 8 6.45102 8.02219 6.37609 8.06442L5.25451 8.69654C5.09727 8.78516 5 8.95163 5 9.13212V10.3799zM15.3737 10.5972C15.2071 10.6921 15 10.5717 15 10.3799V9.13212C15 8.95163 15.0973 8.78516 15.2545 8.69654L16.3761 8.06442C16.451 8.02219 16.5356 8 16.6216 8H18C18.2761 8 18.5 8.22386 18.5 8.5V15.5C18.5 15.7761 18.2761 16 18 16H16.9904C16.7142 16 16.4904 15.7761 16.4904 15.5V9.96116L15.3737 10.5972z"/><path d="M1 5C1 3.9 1.9 3 3 3H21C22.1 3 23 3.9 23 5V19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V5ZM21 5H3V19H21V5Z"/></svg>;
}

const IconCozOriginalSize = React.forwardRef(IconCozOriginalSizeComponent);
export default IconCozOriginalSize;
