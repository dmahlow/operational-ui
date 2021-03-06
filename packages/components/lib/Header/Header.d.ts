/// <reference types="react" />
import * as React from "react";
import { Theme } from "@operational/theme";
import HeaderItem from "./HeaderItem";
import HeaderTitle from "./HeaderTitle";
import HeaderSeparator from "./HeaderSeparator";
export interface IProps {
    id?: string | number;
    className?: string;
    css?: any;
    children: React.ReactNode;
    theme?: Theme;
    color?: string;
}
declare const Header: (props: IProps) => JSX.Element;
export default Header;
export { HeaderItem, HeaderSeparator, HeaderTitle };
