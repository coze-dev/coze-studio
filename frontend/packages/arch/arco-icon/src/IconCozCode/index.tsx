import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCodeComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_code${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M10.6594 22.918C11.2076 22.9853 11.7065 22.5955 11.7738 22.0474L14.2112 2.19644C14.2785 1.64827 13.8887 1.14933 13.3406 1.08202 12.7924 1.01471 12.2934 1.40453 12.2261 1.9527L9.78875 21.8036C9.72145 22.3518 10.1113 22.8507 10.6594 22.918zM23.702 12.7123L23.7071 12.7073C23.9024 12.512 24 12.2561 24 12.0001 24 11.9576 23.9973 11.9151 23.9919 11.8728 23.9649 11.6608 23.8699 11.4558 23.7071 11.293L23.7022 11.2881 18.0502 5.63619C17.6597 5.24566 17.0266 5.24566 16.636 5.63619 16.2455 6.02671 16.2455 6.65988 16.636 7.0504L21.5858 12.0001 16.636 16.9499C16.2455 17.3404 16.2455 17.9736 16.636 18.3641 17.0266 18.7546 17.6597 18.7546 18.0502 18.3641L23.702 12.7123zM.292893 12.7073L.297942 12.7123 5.94975 18.3641C6.34027 18.7546 6.97344 18.7546 7.36396 18.3641 7.75449 17.9736 7.75449 17.3404 7.36396 16.9499L2.41423 12.0001 7.36396 7.0504C7.75448 6.65988 7.75448 6.02671 7.36396 5.63619 6.97344 5.24566 6.34027 5.24567 5.94975 5.63619L.29792 11.288.292893 11.293C.0983895 11.4875.00075986 11.7422.00000452136 11.9971-.000765674 12.2541.0968639 12.5112.292893 12.7073z"/></svg>;
}

const IconCozCode = React.forwardRef(IconCozCodeComponent);
export default IconCozCode;
