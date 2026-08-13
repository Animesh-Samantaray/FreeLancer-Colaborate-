import {
  getWeeklyRange,
  getMonthlyRange,
  fetchReportData,
} from "../services/reports.service.js";

/**
 * GET /weekly

 */
export const getWeeklyReport = async (req, res) => {
  try {
    const { start, end } = getWeeklyRange();
    const data = await fetchReportData(start, end);

    return res.status(200).json({
      success: true,
      reportType: "weekly",
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      data,
    });
  } catch (error) {
    console.error("❌ Error generating weekly report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not generate weekly report.",
    });
  }
};

/**
 * GET /monthly

 */
export const getMonthlyReport = async (req, res) => {
  try {
    const { start, end } = getMonthlyRange();
    const data = await fetchReportData(start, end);

    return res.status(200).json({
      success: true,
      reportType: "monthly",
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      data,
    });
  } catch (error) {
    console.error("❌ Error generating monthly report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not generate monthly report.",
    });
  }
};

/**
 * GET /custom?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

 */
export const getCustomReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing query parameters: startDate and endDate are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD for both startDate and endDate.",
      });
    }

    // Set start to beginning of the day (00:00:00)
    start.setHours(0, 0, 0, 0);
    // Set end to end of the day (23:59:59)
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be after endDate.",
      });
    }

    const data = await fetchReportData(start, end);

    return res.status(200).json({
      success: true,
      reportType: "custom",
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      data,
    });
  } catch (error) {
    console.error("❌ Error generating custom report:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not generate custom report.",
    });
  }
};
