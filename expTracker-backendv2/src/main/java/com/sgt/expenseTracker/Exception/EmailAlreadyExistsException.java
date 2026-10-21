package com.sgt.expenseTracker.Exception;

public class EmailAlreadyExistsException extends Exception{
    public EmailAlreadyExistsException(){
        super("Email Already Exists");
    }
}