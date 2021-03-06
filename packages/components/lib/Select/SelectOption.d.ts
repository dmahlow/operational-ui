/// <reference types="react" />
import * as React from "react";
import { Theme } from "@operational/theme";
export interface IProps {
    id?: number | string;
    css?: any;
    className?: string;
    selected?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    color?: string;
}
export interface IPropsWithTheme extends IProps {
    theme: Theme;
}
declare const WrappedSelectOption: React.SFC<IProps>;
export default WrappedSelectOption;
