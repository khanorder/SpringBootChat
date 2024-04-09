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
const DefaultLayout = dynamic(() => import("@/components/layouts/default"), { ssr: false });
const ChatFollows = dynamic(() => import("@/components/chatContents/chatFollows"), { ssr: false });
const ChatRooms = dynamic(() => import("@/components/chatContents/chatRooms"), { ssr: false });
const ChatSearch = dynamic(() => import("@/components/chatContents/chatSearch"), { ssr: false });

interface MainProps {
    isProd: boolean;
}

function Main({isProd}: MainProps) {
    const firstRender = useRef(true);
    const ui = useAppSelector(state => state.ui);
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

        switch (ui.activeTab) {
            case Defines.TabType.FOLLOW:
                return <ChatFollows />;

            case Defines.TabType.CHAT:
                return <ChatRooms />;

            case Defines.TabType.SEARCH:
                return <ChatSearch />;

            default:
                return <></>;
        }
    }, [ui]);

    return contents();
}

Main.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            <DefaultLayout>{page}</DefaultLayout>
        </Layout>
    );
}

Main.getInitialProps = ({res, err}: NextPageContext) => {
    return {isProd: ("production" === process.env.NODE_ENV)};
}

export default Main;