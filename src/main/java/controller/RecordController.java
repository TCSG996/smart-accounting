package controller;

import model.Record;
import service.RecordService;
import utils.JsonResponse;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/records/*")
public class RecordController extends HttpServlet {
    private RecordService recordService = new RecordService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        
        switch (path) {
            case "/list":
                getRecords(req, resp);
                break;
            case "/statistics":
                getStatistics(req, resp);
                break;
            case "/export":
                exportRecords(req, resp);
                break;
            default:
                resp.sendError(404);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        
        switch (path) {
            case "/add":
                addRecord(req, resp);
                break;
            case "/import":
                importRecords(req, resp);
                break;
            default:
                resp.sendError(404);
        }
    }

    private void getRecords(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String month = req.getParameter("month");
        List<Record> records = recordService.getRecordsByMonth(month);
        JsonResponse.success(resp, records);
    }

    private void getStatistics(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String month = req.getParameter("month");
        Map<String, Object> statistics = recordService.getStatistics(month);
        JsonResponse.success(resp, statistics);
    }

    private void addRecord(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Record record = JsonResponse.parseRequestBody(req, Record.class);
        recordService.addRecord(record);
        JsonResponse.success(resp);
    }

    private void exportRecords(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String format = req.getParameter("format");
        byte[] data = recordService.exportRecords(format);
        
        resp.setContentType("application/octet-stream");
        resp.setHeader("Content-Disposition", "attachment; filename=records." + format);
        resp.getOutputStream().write(data);
    }

    private void importRecords(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 处理文件上传
        Part filePart = req.getPart("file");
        recordService.importRecords(filePart.getInputStream());
        JsonResponse.success(resp);
    }
} 