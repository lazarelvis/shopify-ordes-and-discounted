// components/ExportToExcelButton.jsx
import * as XLSX from "xlsx";
import { Button } from '@shopify/polaris';

const ExportToExcelButton = ({ data, fileName = "orders.xlsx" }) => {
    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <button variant="primary" onClick={handleExport}>
            Export to Excel
        </button>
    );
};

export default ExportToExcelButton;
