package com.sgt.expenseTracker.Exception;

public class UserNameAlreadyExistsException extends Exception{
    public UserNameAlreadyExistsException(){
        super("Username Already Exists");
    }
}