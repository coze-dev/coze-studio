import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAutoHeightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_auto_height${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 2.99829C2 2.44601 2.44772 1.99829 3 1.99829 3.55229 1.99829 4 2.44601 4 2.99829V20.9983C4 21.5506 3.55229 21.9983 3 21.9983 2.44772 21.9983 2 21.5506 2 20.9983L2 2.99829zM20 2.99829C20 2.44601 20.4477 1.99829 21 1.99829 21.5523 1.99829 22 2.44601 22 2.99829V20.9983C22 21.5506 21.5523 21.9983 21 21.9983 20.4477 21.9983 20 21.5506 20 20.9983V2.99829zM6.5 10.9983C5.94772 10.9983 5.5 11.446 5.5 11.9983 5.5 12.5506 5.94772 12.9983 6.5 12.9983H17.5C18.0523 12.9983 18.5 12.5506 18.5 11.9983 18.5 11.446 18.0523 10.9983 17.5 10.9983H6.5zM5.5 7.5C5.5 6.94772 5.94772 6.5 6.5 6.5L17.5 6.5C18.0523 6.5 18.5 6.94772 18.5 7.5 18.5 8.05229 18.0523 8.5 17.5 8.5L6.5 8.5C5.94772 8.5 5.5 8.05229 5.5 7.5zM6.5 15.5C5.94772 15.5 5.5 15.9477 5.5 16.5 5.5 17.0523 5.94772 17.5 6.5 17.5H12.5C13.0523 17.5 13.5 17.0523 13.5 16.5 13.5 15.9477 13.0523 15.5 12.5 15.5H6.5z"/></svg>;
}

const IconCozAutoHeight = React.forwardRef(IconCozAutoHeightComponent);
export default IconCozAutoHeight;
