import styles from "@/styles/disconnected.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import {useAppDispatch} from "@/hooks";
import {useCallback, useEffect, useRef} from "react";
import {startReconnecting} from "@/stores/reducers/webSocket";

export default function ChatDisconnected() {
    const firstRender = useRef(true);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;

    }, [firstRender]);
    //#endregion

    const reconnect = useCallback(() => {
        dispatch(startReconnecting());
    }, [dispatch]);

    return (
        <div className={styles.chatDisConnectedWrapper}>
            <div className={styles.chatDisConnected}>
                <div>서버와 연결이 종료 되었습니다.</div>
                <div>잠시 후 다시 이용해 주세요.</div>
                <div className={styles.buttons}>
                    <button className={`${stylesCommon.button} ${styles.buttonReconnect}`} onClick={reconnect}>재연결</button>
                </div>
            </div>
        </div>
    );
}