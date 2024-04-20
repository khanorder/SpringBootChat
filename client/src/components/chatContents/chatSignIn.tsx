import styles from "@/styles/chatSignIn.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {useCallback} from "react";
import {startGuestReq} from "@/stores/reducers/webSocket";

export default function ChatSignIn() {
    const dispatch = useAppDispatch();

    const startGuest = useCallback(() => {
        dispatch(startGuestReq());
    }, [dispatch]);

    return (
        <div className={styles.chatSignInWrapper}>
            <div className={styles.chatSignIn}>
                <div className={styles.signinEmpty}>

                </div>
                <div className={styles.title}>

                </div>
                <div className={styles.buttons}>
                    <button className={`${styles.createTempButton} ${stylesCommon.button}`} onClick={startGuest}>Guest 시작</button>
                </div>
                <div className={styles.signinEmpty}>

                </div>
            </div>
        </div>
    );
}