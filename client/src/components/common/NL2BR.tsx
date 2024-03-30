import {Fragment, ReactElement} from "react";

export interface NL2BRProps {
    text: string;
}
export default function NL2BR ({ text }: NL2BRProps) {
    const split = text.split('\n', -1);
    const result: ReactElement[] = [];
    for (let i = 0; i < split.length; i++) {
        result.push(<Fragment key={i}>{split[i]}</Fragment>);
        if (i < (split.length - 1))
            result.push(<br key={`${i}-br`} />);
    }
    return result;
}