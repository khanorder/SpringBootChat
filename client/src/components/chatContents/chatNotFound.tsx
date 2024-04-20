import styles from "@/styles/chatNotFound.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";
import {useAppSelector} from "@/hooks";

export default function ChatNotFound() {
    const appConfigs = useAppSelector(state => state.appConfigs);

    return (
        <div className={styles.chatNotFoundWrapper}>
            <div className={styles.chatNotFound}>
                <div className={styles.notFoundText}>
                    {!appConfigs.isProd ? '채팅방이 없습니다.' : ''}
                </div>
                <Link href='/' className={`${styles.goToMainButton} ${stylesCommon.button}`}>메인으로</Link>
            </div>
        </div>
    );
}