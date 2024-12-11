package service;

import dao.RecordDAO;
import model.Record;
import utils.ExcelUtil;
import utils.CSVUtil;

import java.io.InputStream;
import java.util.*;

public class RecordService {
    private RecordDAO recordDAO = new RecordDAO();

    public List<Record> getRecordsByMonth(String month) {
        return recordDAO.findByMonth(month);
    }

    public void addRecord(Record record) {
        recordDAO.insert(record);
    }

    public Map<String, Object> getStatistics(String month) {
        List<Record> records = recordDAO.findByMonth(month);
        Map<String, Object> stats = new HashMap<>();
        
        // 计算分类分布
        Map<String, BigDecimal> categoryDistribution = calculateCategoryDistribution(records);
        stats.put("categoryDistribution", categoryDistribution);
        
        // 计算每日趋势
        List<Map<String, Object>> dailyTrend = calculateDailyTrend(records);
        stats.put("dailyTrend", dailyTrend);
        
        // 计算预算使用情况
        Map<String, BigDecimal> budgetUsage = calculateBudgetUsage(month);
        stats.put("budgetUsage", budgetUsage);
        
        return stats;
    }

    public byte[] exportRecords(String format) {
        List<Record> records = recordDAO.findAll();
        
        if ("excel".equals(format)) {
            return ExcelUtil.exportToExcel(records);
        } else if ("csv".equals(format)) {
            return CSVUtil.exportToCSV(records);
        }
        
        throw new IllegalArgumentException("Unsupported format: " + format);
    }

    public void importRecords(InputStream inputStream) {
        List<Record> records = ExcelUtil.importFromExcel(inputStream);
        recordDAO.batchInsert(records);
    }

    // 私有辅助方法
    private Map<String, BigDecimal> calculateCategoryDistribution(List<Record> records) {
        // 实现分类统计逻辑
        return null;
    }

    private List<Map<String, Object>> calculateDailyTrend(List<Record> records) {
        // 实现每日趋势统计逻辑
        return null;
    }

    private Map<String, BigDecimal> calculateBudgetUsage(String month) {
        // 实现预算使用情况统计逻辑
        return null;
    }
} 