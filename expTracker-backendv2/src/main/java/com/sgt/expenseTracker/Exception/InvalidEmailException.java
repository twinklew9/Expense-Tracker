package com.sgt.expenseTracker.Exception;

public class InvalidEmailException extends Exception {
    public InvalidEmailException(){
        super("Invalid Email");
    }
}