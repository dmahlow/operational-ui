/// <reference types="react" />
import * as React from "react";
import { Theme } from "@operational/theme";
import Tab from "./Tab";
export interface IProps {
    active?: number;
    activeColor?: string;
    children?: React.ReactNode;
    onChange?: (index: number) => void;
}
export interface IPropsWithTheme extends IProps {
    theme: Theme;
}
declare const WrappedTabs: React.SFC<IProps>;
export { WrappedTabs as Tabs, Tab };
