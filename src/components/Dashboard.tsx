import {StyledDashboard} from "./Dashboard.styled";
import {DashboardButton} from "./DasboardButton";
import {parsePageCSV, parsePageJSON } from "../services/pageParser";

export const Dashboard = () => {
    return (
        <StyledDashboard>
            <header>
                <DashboardButton text={"get JSON"} onClick={parsePageJSON} />
                <DashboardButton text={"get CSV"} onClick={parsePageCSV}/>
            </header>
        </StyledDashboard>
    );
}
