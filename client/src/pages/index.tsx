import {
    ReactElement,
    useCallback,
    useEffect,
    useRef
} from "react";
import {NextPageContext} from "next";
import {useAppDispatch, useAppSelector} from "@/hooks";
import {setIsProd} from "@/stores/reducers/appConfigs";
import dynamic from "next/dynamic";
import {Defines} from "@/defines";
const Layout = dynamic(() => import("@/components/layouts"), { ssr: false });
const MainLayout = dynamic(() => import("@/components/layouts/main"), { ssr: false });
const ChatRoomList = dynamic(() => import("@/components/chatContents/chatRoomList"), { ssr: false });
const ChatFriends = dynamic(() => import("@/components/chatContents/chatFriends"), { ssr: false });



interface MainProps {
    isProd: boolean;
}

function Main({isProd}: MainProps) {
    const firstRender = useRef(true);
    const dialog = useAppSelector(state => state.dialog);
    const dispatch = useAppDispatch();

    //#region OnRender
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            dispatch(setIsProd(isProd))
        }

    }, [firstRender, dispatch, isProd]);
    //#endregion

    const contents = useCallback(() => {

        switch (dialog.activeTab) {
            case Defines.ActiveTab.Friend:
                return <ChatFriends />;

            case Defines.ActiveTab.Chat:
                return <ChatRoomList />;

            default:
                return <></>;
        }
    }, [dialog]);

    return contents();
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