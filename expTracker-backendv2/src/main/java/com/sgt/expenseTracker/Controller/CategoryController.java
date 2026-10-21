package com.sgt.expenseTracker.Controller;

import com.sgt.expenseTracker.Model.Category;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.CategoryRepository;
import com.sgt.expenseTracker.Repository.ExpRepository;
import com.sgt.expenseTracker.Service.CategoryService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ExpRepository expRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping("/add-category")
    public ResponseEntity<?> addCategory(
            @RequestBody Category category,
            HttpSession session
    ) {
        try {
            String email =
                    (String) session.getAttribute("userEmail");

            if (email == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "Please login first"
                                )
                        );
            }

            User user =
                    expRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "User verification failed"
                                )
                        );
            }

            category.setUserId(user.getId());

            categoryService.addCategory(category);

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Category Added Successfully"
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error adding category"
                            )
                    );
        }
    }

    @GetMapping("/get-categories")
    public ResponseEntity<?> getCategories(
            HttpSession session
    ) {
        try {
            String email =
                    (String) session.getAttribute("userEmail");

            if (email == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "Please login first"
                                )
                        );
            }

            List<Map<String, Object>> categories =
                    categoryService.getCategories(email);

            return ResponseEntity.ok(categories);

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "Value",
                                    "Error fetching categories"
                            )
                    );
        }
    }

    @DeleteMapping("/delete-category/{categoryId}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable int categoryId,
            HttpSession session
    ) {
        try {
            String email =
                    (String) session.getAttribute("userEmail");

            if (email == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "Please login first"
                                )
                        );
            }

            User user =
                    expRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                Map.of(
                                        "Value",
                                        "User verification failed"
                                )
                        );
            }

            categoryRepository.deleteCategory(
                    categoryId,
                    user.getId()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "Value",
                            "Category Deleted"
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(
                            Map.of(
                                    "Value",
                                    "Error deleting category"
                            )
                    );
        }
    }
}