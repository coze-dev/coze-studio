import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTableSettingComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_table_setting${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 4C2.44772 4 2 4.44772 2 5 2 5.55228 2.44772 6 3 6H21C21.5523 6 22 5.55228 22 5 22 4.44772 21.5523 4 21 4H3zM3 18C2.44772 18 2 18.4477 2 19 2 19.5523 2.44772 20 3 20H9C9.55228 20 10 19.5523 10 19 10 18.4477 9.55228 18 9 18H3zM2 12C2 11.4477 2.44772 11 3 11H9C9.55228 11 10 11.4477 10 12 10 12.5523 9.55228 13 9 13H3C2.44772 13 2 12.5523 2 12zM18.5 15.4953C18.5 16.3237 17.8284 16.9953 17 16.9953 16.1716 16.9953 15.5 16.3237 15.5 15.4953 15.5 14.6669 16.1716 13.9953 17 13.9953 17.8284 13.9953 18.5 14.6669 18.5 15.4953z"/><path fillRule="evenodd" clipRule="evenodd" d="M18.0001 9.76795C17.3813 9.41068 16.6189 9.41068 16.0001 9.76795L12.54 11.7656C11.9212 12.1229 11.54 12.7831 11.54 13.4976V17.4929C11.54 18.2075 11.9212 18.8677 12.54 19.225L16.0001 21.2226C16.6189 21.5799 17.3813 21.5799 18.0001 21.2226L21.4601 19.225C22.0789 18.8677 22.4601 18.2075 22.4601 17.4929V13.4976C22.4601 12.7831 22.0789 12.1229 21.4601 11.7656L18.0001 9.76795ZM20.4601 13.4976L17.0001 11.5L13.54 13.4976V17.4929L17.0001 19.4906L20.4601 17.4929V13.4976Z"/></svg>;
}

const IconCozTableSetting = React.forwardRef(IconCozTableSettingComponent);
export default IconCozTableSetting;
