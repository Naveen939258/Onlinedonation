// src/utils/exportUtils.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ important

export const exportToExcel = (data, filename = "data.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
  alert("✅ Excel downloaded successfully!");
};

export const exportToPDF = (data, columns, filename = "data.pdf") => {
  const doc = new jsPDF();

  // attach autoTable
  autoTable(doc, {
    startY: 20,
    head: [columns],
    body: data.map((item) => columns.map((col) => item[col] || "")),
  });

  doc.text(filename.replace(".pdf", ""), 14, 15);
  doc.save(filename);
  alert("✅ PDF downloaded successfully!");
};
