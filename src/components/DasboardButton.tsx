import React from "react";

interface DashboardButtonProps  {
    text: string
    onClick: () => void
}

export const DashboardButton : React.FC<DashboardButtonProps> = ({text, onClick}) => {

    return (
        <div>
            <button onClick={onClick}>
                {text}
            </button>
        </div>
    );
}
