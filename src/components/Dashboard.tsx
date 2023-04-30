import {StyledDashboard} from "./Dashboard.styled";
import {DashboardButton} from "./DasboardButton";
import {parseProductPage} from "../services/pageParser";

export const Dashboard = () => {
    return (
        <StyledDashboard>
            <header>
                <DashboardButton text={"get JSON"} onClick={parseProductPage} />
                <DashboardButton text={"get CSV"} onClick={parseProductPage}/>
            </header>
        </StyledDashboard>
    );
}
