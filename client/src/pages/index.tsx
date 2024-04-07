import styles from 'src/styles/list.module.sass'
import {
    ReactElement,
    useCallback,
    useEffect,
    useRef
} from "react";
import {NextPageContext} from "next";
import {useAppDispatch} from "@/hooks";
import PlusIcon from 'public/images/plus-svgrepo-com.svg';
import Image from "next/image";
import {toggleIsActiveCreateChatRoom} from "@/stores/reducers/dialog";
import {setIsProd} from "@/stores/reducers/appConfigs";
import dynamic from "next/dynamic";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const MainLayout = dynamic(() => import("@/components/layouts/main"), { ssr: false });
const MainHeader = dynamic(() => import("@/components/chatContents/mainHeader"), { ssr: false });
const ChatRoomList = dynamic(() => import("@/components/chatContents/chatRoomList"), { ssr: false });
const CreateChatRoomDialog = dynamic(() => import("@/components/dialogs/createChatRoomDialog"), { ssr: false });


interface MainProps {
    isProd: boolean;
}

function Main({isProd}: MainProps) {
    const firstRender = useRef(true);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            dispatch(setIsProd(isProd))
        }

    }, [firstRender, dispatch, isProd]);
    //#endregion

    const toggleCreateChatRoomDialog = useCallback(() => {
        dispatch(toggleIsActiveCreateChatRoom());
    }, [dispatch]);

    return (
        <>
            <MainHeader />
            <ChatRoomList />
            <div className={styles.toggleCreateChatRoomDialogWrapper}>
                <button className={styles.toggleCreateChatRoomDialogButton} onClick={toggleCreateChatRoomDialog}>
                    <Image className={styles.toggleCreateChatRoomDialogIcon} src={PlusIcon} alt='채팅방 생성' width={30} height={30} />
                </button>
            </div>
            <CreateChatRoomDialog />
        </>
    );
}

Main.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <MainLayout>{page}</MainLayout>
        </Layout>
    );
}

Main.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Main;