import styles from "@/styles/settings.module.sass";
import isEmpty from "lodash/isEmpty";
import CaretRightIcon from "public/images/caret-right.svg";
import Image from "next/image";
import {Dispatch, ReactNode, SetStateAction, useCallback} from "react";

export interface ListItemProps {
    itemName: string;
    isOpenItem: boolean;
    setIsOpenItem: Dispatch<SetStateAction<boolean>>;
    className?: string;
    children?: ReactNode;
}

export default function ListItem ({ itemName, isOpenItem, setIsOpenItem, className, children }: ListItemProps) {
    let itemClass: string = styles.listItem;
    if (isOpenItem)
        itemClass += ` ${styles.opened}`;

    if (!isEmpty(className))
        itemClass += ` ${className}`;

    const toggleOpenItem = useCallback(() => {
        setIsOpenItem(prev => {
            return !prev;
        })
    }, [setIsOpenItem]);

    const itemPanel = useCallback(() => {
        if (!isOpenItem)
            return <></>;

        return children;
    }, [children, isOpenItem]);

    return (
        <li title={itemName} className={itemClass}>
            <div className={styles.itemMenu} onClick={toggleOpenItem}>
                <div className={styles.listItemIcon}>
                    <Image className={styles.listItemIconImage} src={CaretRightIcon} alt='itemIcon' fill={true} priority={true} />
                </div>
                <div className={styles.listItemName}>{itemName}</div>
            </div>
            {children}
        </li>
    );
}