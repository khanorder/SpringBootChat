import style from "@/styles/layout.module.sass";

export default function Loading() {
    return (
        <div className={style.loaderWrapper}>
            <div className={style.loader}></div>
        </div>
    );
}