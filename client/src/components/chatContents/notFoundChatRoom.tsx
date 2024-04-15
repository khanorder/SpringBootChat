import styles from "@/styles/chatRoom.module.sass";
import stylesCommon from "@/styles/common.module.sass";
import Link from "next/link";
import {useAppSelector} from "@/hooks";

export default function NotFoundChatRoom() {
    const appConfigs = useAppSelector(state => state.appConfigs);

    return (
        <div className={styles.chatContentsWrapper}>
            <div className={styles.chatRoomNone}>
                <div>
                    {appConfigs.isProd ? '채팅방이 없습니다.' : ''}
                </div>
                <Link href='/' className={`${styles.goToMainButton} ${stylesCommon.button}`}>메인으로</Link>
            </div>
        </div>
    );
}