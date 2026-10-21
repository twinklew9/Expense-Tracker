package com.sgt.expenseTracker.Model;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkUploadResponse {
    String amount;
    LocalDate date;
    String note;
    List<String> errors;
    String name;
    String type;
}
