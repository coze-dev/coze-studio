import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozProperSubsetSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_proper_subset_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M19.7771 5.63606C20.1676 5.24554 20.1676 4.61237 19.7771 4.22185 19.3866 3.83132 18.7534 3.83132 18.3629 4.22185L4.22075 18.364C3.83023 18.7545 3.83023 19.3877 4.22075 19.7782 4.61127 20.1687 5.24444 20.1687 5.63496 19.7782L19.7771 5.63606zM15.9645 4.50002L13.9645 6.50002H11.5C8.46244 6.50002 6 8.96246 6 12 6 12.73 6.14221 13.4267 6.40042 14.0641L4.8997 15.5648C4.32583 14.5045 4 13.2903 4 12 4 7.85789 7.35787 4.50002 11.5 4.50002H15.9645zM8.61183 18.9237L10.192 17.3435C10.6112 17.4458 11.0493 17.5 11.5 17.5H18C18.5523 17.5 19 17.9477 19 18.5 19 19.0523 18.5523 19.5 18 19.5H11.5C10.4764 19.5 9.50077 19.295 8.61183 18.9237z"/></svg>;
}

const IconCozProperSubsetSlash = React.forwardRef(IconCozProperSubsetSlashComponent);
export default IconCozProperSubsetSlash;
