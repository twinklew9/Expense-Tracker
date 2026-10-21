package com.sgt.expenseTracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ExpenseTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(
				ExpenseTrackerApplication.class,
				args
		);
	}
}
// check validity of email
// check if email already exists(FindByEmail)
// check if username already exists(FindByUsername)
// hash password before register
// if all passed then call repository to 