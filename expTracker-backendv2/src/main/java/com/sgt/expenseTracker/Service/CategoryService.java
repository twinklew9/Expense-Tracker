package com.sgt.expenseTracker.Service;

import com.sgt.expenseTracker.Model.Category;
import com.sgt.expenseTracker.Model.User;
import com.sgt.expenseTracker.Repository.CategoryRepository;
import com.sgt.expenseTracker.Repository.ExpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpRepository expRepository;

    public void addCategory(Category category) {
        // FIXED: Only passing the 2 arguments that the database actually accepts!
        categoryRepository.createCategory(category.getUserId(), category.getName());
    }

    public List<Map<String, Object>> getCategories(String email) {
        User user = expRepository.findByEmail(email);
        if (user == null) {
            return java.util.Collections.emptyList();
        }
        return categoryRepository.getAllCategories(user.getId());
    }
}