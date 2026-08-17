import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
};


const formatDateISO = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


const formatDateMonthISO = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};


export const generateReportFilename = (report, extension = "pdf") => {
  const type = (report?.reportType || "monthly").toLowerCase();
  const startDate = report?.period?.startDate;
  const endDate = report?.period?.endDate;

  if (type === "weekly") {
    const datePart = formatDateISO(startDate) || formatDateISO(new Date());
    return `Freelancer-Report-Weekly-${datePart}.${extension}`;
  }

  if (type === "custom") {
    const startPart = formatDateISO(startDate) || "Start";
    const endPart = formatDateISO(endDate) || "End";
    return `Freelancer-Report-Custom-${startPart}-to-${endPart}.${extension}`;
  }


  const monthPart = formatDateMonthISO(startDate) || formatDateMonthISO(new Date());
  return `Freelancer-Report-Monthly-${monthPart}.${extension}`;
};


const val = (v, fallback = "0") => {
  if (v === null || v === undefined) return fallback;
  return String(v);
};


export const downloadPDF = (report) => {
  if (!report || !report.data) {
    throw new Error("No report data available to export.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const reportType = (report.reportType || "Monthly").toUpperCase();
  const startDate = formatDisplayDate(report.period?.startDate);
  const endDate = formatDisplayDate(report.period?.endDate);
  const generatedOn = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });


  doc.setFillColor(99, 102, 241); // #6366F1
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FREELANCER COLLABORATION PLATFORM", 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("ADMIN REPORTS & ANALYTICS", 14, 21);


  let currentY = 36;

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Report Type: ${reportType}`, 14, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Period: ${startDate}  to  ${endDate}`, 14, currentY + 6);
  doc.text(`Generated On: ${generatedOn}`, 14, currentY + 12);

  currentY += 20;


  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, 196, currentY);
  currentY += 6;


  const data = report.data;
  const users = data.users || {};
  const projects = data.projects || {};
  const proposals = data.proposals || {};
  const reviews = data.reviews || {};
  const freelancers = data.freelancers;
  const clients = data.clients;
  const financials = data.financials;

  const tableHeadStyle = {
    fillColor: [99, 102, 241],
    textColor: [255, 255, 255],
    fontStyle: "bold",
    fontSize: 9,
  };

  const tableBodyStyle = {
    fontSize: 9,
    textColor: [30, 41, 59],
  };


  const addTableSection = (title, tableData) => {

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(99, 102, 241);
    doc.text(title, 14, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value"]],
      body: tableData,
      theme: "striped",
      headStyles: tableHeadStyle,
      bodyStyles: tableBodyStyle,
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 62, fontStyle: "bold" },
      },
    });

    currentY = doc.lastAutoTable.finalY + 8;
  };


  const userRows = [
    ["Total Users", val(users.total)],
    ["New Users", val(users.newUsers)],
    ["Freelancers", val(users.freelancers)],
    ["Clients", val(users.clients)],
  ];
  if (users.newFreelancers !== undefined) userRows.push(["New Freelancers", val(users.newFreelancers)]);
  if (users.newClients !== undefined) userRows.push(["New Clients", val(users.newClients)]);
  addTableSection("1. USER STATISTICS", userRows);


  const projectRows = [
    ["Total Projects", val(projects.total)],
    ["Completed", val(projects.completed)],
    ["Ongoing", val(projects.ongoing)],
    ["Open", val(projects.open)],
    ["Cancelled", val(projects.cancelled)],
  ];
  if (projects.totalOverall !== undefined) projectRows.push(["Overall Total Projects", val(projects.totalOverall)]);
  addTableSection("2. PROJECT STATISTICS", projectRows);


  const proposalRows = [
    ["Total Proposals", val(proposals.total)],
    ["Accepted", val(proposals.accepted)],
    ["Rejected", val(proposals.rejected)],
    ["Pending", val(proposals.pending)],
  ];
  addTableSection("3. PROPOSAL STATISTICS", proposalRows);


  const reviewRows = [
    ["Total Reviews", val(reviews.total)],
    ["Average Rating", reviews.averageRating ? `${Number(reviews.averageRating).toFixed(1)} / 5` : "0 / 5"],
    ["5 Star", val(reviews.fiveStar)],
    ["4 Star", val(reviews.fourStar)],
    ["3 Star", val(reviews.threeStar)],
    ["2 Star", val(reviews.twoStar)],
    ["1 Star", val(reviews.oneStar)],
  ];
  addTableSection("4. REVIEW & RATING STATISTICS", reviewRows);


  if (freelancers) {
    const freelancerRows = [
      ["Total Freelancer Profiles", val(freelancers.total)],
      ["Average Rating", freelancers.averageRating ? `${freelancers.averageRating} / 5` : "0 / 5"],
      ["Total Reviews Received", val(freelancers.totalReviews)],
      ["Completed Projects", val(freelancers.completedProjects)],
    ];
    addTableSection("5. FREELANCER OVERVIEW", freelancerRows);
  }


  if (clients) {
    const clientRows = [
      ["Total Client Profiles", val(clients.total)],
      ["Total Hires", val(clients.totalHires)],
      ["Completed Projects", val(clients.completedProjects)],
    ];
    addTableSection("6. CLIENT OVERVIEW", clientRows);
  }

  if (financials) {
    const financialRows = [
      ["Total Project Earnings", `$${val(financials.totalEarnings)}`],
      ["Total Milestone Payments", `$${val(financials.totalMilestonePayments)}`],
    ];
    addTableSection("7. FINANCIAL STATISTICS", financialRows);
  }


  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} — Freelancer Collaboration Platform`,
      105,
      290,
      { align: "center" }
    );
  }

  const filename = generateReportFilename(report, "pdf");
  doc.save(filename);
};


export const downloadExcel = (report) => {
  if (!report || !report.data) {
    throw new Error("No report data available to export.");
  }

  const reportType = (report.reportType || "Monthly").toUpperCase();
  const startDate = formatDisplayDate(report.period?.startDate);
  const endDate = formatDisplayDate(report.period?.endDate);
  const generatedOn = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const data = report.data;
  const users = data.users || {};
  const projects = data.projects || {};
  const proposals = data.proposals || {};
  const reviews = data.reviews || {};
  const freelancers = data.freelancers;
  const clients = data.clients;
  const financials = data.financials;

  const rows = [
    ["FREELANCER COLLABORATION PLATFORM"],
    ["REPORT & ANALYTICS"],
    [""],
    ["Report Type", reportType],
    ["Start Date", startDate],
    ["End Date", endDate],
    ["Generated Date", generatedOn],
    [""],
  ];


  const appendSection = (title, items) => {
    rows.push([title]);
    rows.push(["Metric", "Value"]);
    items.forEach(([metric, value]) => {
      rows.push([metric, value]);
    });
    rows.push([""]);
  };


  const userItems = [
    ["Total Users", users.total ?? 0],
    ["New Users", users.newUsers ?? 0],
    ["Freelancers", users.freelancers ?? 0],
    ["Clients", users.clients ?? 0],
  ];
  if (users.newFreelancers !== undefined) userItems.push(["New Freelancers", users.newFreelancers]);
  if (users.newClients !== undefined) userItems.push(["New Clients", users.newClients]);
  appendSection("USER STATISTICS", userItems);


  const projectItems = [
    ["Total Projects", projects.total ?? 0],
    ["Completed", projects.completed ?? 0],
    ["Ongoing", projects.ongoing ?? 0],
    ["Open", projects.open ?? 0],
    ["Cancelled", projects.cancelled ?? 0],
  ];
  if (projects.totalOverall !== undefined) projectItems.push(["Overall Total Projects", projects.totalOverall]);
  appendSection("PROJECT STATISTICS", projectItems);


  const proposalItems = [
    ["Total Proposals", proposals.total ?? 0],
    ["Accepted", proposals.accepted ?? 0],
    ["Rejected", proposals.rejected ?? 0],
    ["Pending", proposals.pending ?? 0],
  ];
  appendSection("PROPOSAL STATISTICS", proposalItems);


  const reviewItems = [
    ["Total Reviews", reviews.total ?? 0],
    ["Average Rating", reviews.averageRating ? Number(reviews.averageRating).toFixed(1) : 0],
    ["5 Star", reviews.fiveStar ?? 0],
    ["4 Star", reviews.fourStar ?? 0],
    ["3 Star", reviews.threeStar ?? 0],
    ["2 Star", reviews.twoStar ?? 0],
    ["1 Star", reviews.oneStar ?? 0],
  ];
  appendSection("REVIEW & RATING STATISTICS", reviewItems);


  if (freelancers) {
    const freelancerItems = [
      ["Total Freelancer Profiles", freelancers.total ?? 0],
      ["Average Rating", freelancers.averageRating ?? 0],
      ["Total Reviews Received", freelancers.totalReviews ?? 0],
      ["Completed Projects", freelancers.completedProjects ?? 0],
    ];
    appendSection("FREELANCER OVERVIEW", freelancerItems);
  }


  if (clients) {
    const clientItems = [
      ["Total Client Profiles", clients.total ?? 0],
      ["Total Hires", clients.totalHires ?? 0],
      ["Completed Projects", clients.completedProjects ?? 0],
    ];
    appendSection("CLIENT OVERVIEW", clientItems);
  }


  if (financials) {
    const financialItems = [
      ["Total Project Earnings", financials.totalEarnings ?? 0],
      ["Total Milestone Payments", financials.totalMilestonePayments ?? 0],
    ];
    appendSection("FINANCIAL STATISTICS", financialItems);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);


  worksheet["!cols"] = [{ wch: 32 }, { wch: 24 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const filename = generateReportFilename(report, "xlsx");
  XLSX.writeFile(workbook, filename);
};
