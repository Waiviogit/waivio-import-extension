import {StyledDashboard} from "./Dashboard.styled";
import {DashboardButton} from "./DasboardButton";
import {parsePage, PARSE_COMMANDS } from "../services/pageParser";

export const Dashboard = () => {
    const parseToJson = async (): Promise<void> => parsePage(PARSE_COMMANDS.TO_JSON);
    const parseToCsv = async (): Promise<void> => parsePage(PARSE_COMMANDS.TO_CSV);

    return (
        <StyledDashboard>
                <DashboardButton text={"get JSON"} onClick={parseToJson} />
                <DashboardButton text={"get CSV"} onClick={parseToCsv}/>
        </StyledDashboard>
    );
}
