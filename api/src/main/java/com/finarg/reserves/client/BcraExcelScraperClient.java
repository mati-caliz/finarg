package com.finarg.reserves.client;

import com.finarg.reserves.dto.BcraExcelLiabilitiesDTO;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
public class BcraExcelScraperClient {

    private final WebClient webClient;
    private static final String EXCEL_URL =
            "https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/series.xlsm";

    public BcraExcelScraperClient(@Qualifier("bcraWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public BcraExcelLiabilitiesDTO fetchLiabilities() {
        try {
            log.info("Downloading BCRA Excel file from: {}", EXCEL_URL);

            byte[] excelBytes = webClient
                    .get()
                    .uri(EXCEL_URL)
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            if (excelBytes == null || excelBytes.length == 0) {
                log.error("Failed to download BCRA Excel file");
                return null;
            }

            return parseExcel(excelBytes);
        } catch (Exception e) {
            log.error("Error fetching BCRA liabilities from Excel: {}", e.getMessage(), e);
            return null;
        }
    }

    private BcraExcelLiabilitiesDTO parseExcel(byte[] excelBytes) {
        try (InputStream is = new java.io.ByteArrayInputStream(excelBytes);
                Workbook workbook = WorkbookFactory.create(is)) {

            BcraExcelLiabilitiesDTO dto = BcraExcelLiabilitiesDTO.builder()
                    .lastUpdate(LocalDate.now())
                    .dataSource("BCRA Series.xlsm")
                    .build();

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                log.error("No sheet found in Excel file");
                return null;
            }

            log.info("Parsing Excel sheet: {}", sheet.getSheetName());

            for (Row row : sheet) {
                if (row == null) {
                    continue;
                }

                Cell labelCell = row.getCell(0);
                if (labelCell == null) {
                    continue;
                }

                String label = getCellValueAsString(labelCell).toLowerCase().trim();

                if (label.contains("swap") && label.contains("china")) {
                    dto.setSwapChina(extractNumericValue(row));
                } else if (label.contains("swap") && (label.contains("eeuu") || label.contains("usa"))) {
                    dto.setSwapUsa(extractNumericValue(row));
                } else if (label.contains("repo") && label.contains("sedesa")) {
                    dto.setRepoSedesa(extractNumericValue(row));
                } else if (label.contains("encajes") || label.contains("bank deposits")) {
                    dto.setBankDeposits(extractNumericValue(row));
                } else if (label.contains("depósitos") && label.contains("gobierno")) {
                    dto.setGovernmentDeposits(extractNumericValue(row));
                } else if (label.contains("leliq") || label.contains("pases")) {
                    dto.setLeliqPases(extractNumericValue(row));
                } else if (label.contains("otros pasivos") && label.contains("corto plazo")) {
                    if (label.contains("bcra")) {
                        dto.setOtherShortTermBcra(extractNumericValue(row));
                    } else if (label.contains("fmi")) {
                        dto.setOtherShortTermFmi(extractNumericValue(row));
                    }
                } else if (label.contains("pasivos") && label.contains("tesoro")) {
                    dto.setTreasuryLiabilitiesFmi(extractNumericValue(row));
                }
            }

            log.info("Successfully parsed BCRA Excel liabilities");
            return dto;

        } catch (Exception e) {
            log.error("Error parsing BCRA Excel file: {}", e.getMessage(), e);
            return null;
        }
    }

    private BigDecimal extractNumericValue(Row row) {
        Cell cell = row.getCell(1);
        if (cell == null) {
            return BigDecimal.ZERO;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                value = value.replaceAll("[^0-9.-]", "");
                return value.isEmpty() ? BigDecimal.ZERO : new BigDecimal(value);
            }
        } catch (Exception e) {
            log.warn("Failed to extract numeric value from cell at index {}: {}", 1, e.getMessage());
        }

        return BigDecimal.ZERO;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }
}
