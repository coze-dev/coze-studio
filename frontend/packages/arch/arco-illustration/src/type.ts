export interface OriginIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
    prefix?: string;
    width?: string;
    height?: string;
    useCurrentColor?: boolean;
    spin?: boolean;
}

export type IconProps = React.PropsWithoutRef<OriginIconProps> & React.RefAttributes<SVGSVGElement>
