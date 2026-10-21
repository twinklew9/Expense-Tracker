package com.sgt.expenseTracker.Service;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
@Service
public class AiService {
    @Autowired
    private ChatModel chatModel;
    public String suggestCategory(String description, List<String> categories){
        String prompt = """
You are an expense categorization assistant.

Expense description:
{description}

Available categories:
{categories}

Instructions:
1. If the expense matches one of the available categories, return EXACTLY that category.
2. Do NOT create a new category unless absolutely necessary.
3. Return ONLY one word.
4. Do not explain.
5. Do not use punctuation.
6. If the description is "Pizza", "Coffee", "Lunch", "Dinner", or any food item, return food.
7. If unsure, choose the closest category from the available list.

Answer:
""";
        // creating template of prompt which will be later populated w parameters
        PromptTemplate promptTemplate = new PromptTemplate((prompt));
        Map<String,Object> params = Map.of(
                "description", description,
                "categories", categories
        );
        return chatModel.call(promptTemplate.create(params)).getResult().getOutput().getText();
    }

}
