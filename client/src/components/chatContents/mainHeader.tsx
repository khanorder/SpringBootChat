import {useAppSelector} from "@/hooks";
import {useEffect, useRef} from "react";
import styles from 'src/styles/main.module.sass'

export default function MainHeader() {
    const appConfigs = useAppSelector(state => state.appConfigs);
    const firstRender = useRef(true);

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    return (
        <div className={styles.mainHeaderWrapper}>
            <div className={styles.mainHeaderTitle}>{appConfigs.isProd ? appConfigs.name : ''}</div>
        </div>
    );
}