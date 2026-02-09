# app/services/contact_form_service.py
"""
Business logic for contact form operations.
"""
import json
import re
from typing import Dict, Any, List
from app.models.contact_form_model import ContactForm
from app.utils.phone_validator import validate_phone


def validate_form_submission(form: ContactForm, answers: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate form submission answers against form questions.
    
    Args:
        form: ContactForm instance
        answers: Dictionary of answers (question index or key -> answer)
        
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    try:
        questions = json.loads(form.questions_json)
    except json.JSONDecodeError:
        return False, "Invalid form configuration"
    
    # Validate each question
    for idx, question in enumerate(questions):
        question_key = str(idx)  # Use index as key, or question text if available
        # Try to find answer by index or by question text
        answer = answers.get(question_key) or answers.get(question.get("question", ""))
        
        # Check required fields
        if question.get("required", False):
            if answer is None or (isinstance(answer, str) and not answer.strip()):
                return False, f"Required question '{question.get('question', f'Question {idx+1}')}' was not answered"
        
        # Skip validation if answer is empty and not required
        if answer is None or (isinstance(answer, str) and not answer.strip()):
            continue
        
        question_type = question.get("type")
        
        # Validate by type
        if question_type == "email":
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', str(answer)):
                return False, f"Invalid email format for question '{question.get('question', f'Question {idx+1}')}'"
        
        elif question_type == "phone":
            is_valid, error = validate_phone(str(answer))
            if not is_valid:
                return False, f"Invalid phone format for question '{question.get('question', f'Question {idx+1}')}': {error}"
        
        elif question_type == "number":
            try:
                num_value = float(answer)
                min_val = question.get("min_value")
                max_val = question.get("max_value")
                if min_val is not None and num_value < min_val:
                    return False, f"Value for question '{question.get('question', f'Question {idx+1}')}' must be at least {min_val}"
                if max_val is not None and num_value > max_val:
                    return False, f"Value for question '{question.get('question', f'Question {idx+1}')}' must be at most {max_val}"
            except (ValueError, TypeError):
                return False, f"Invalid number format for question '{question.get('question', f'Question {idx+1}')}'"
        
        elif question_type in ["text", "textarea"]:
            answer_str = str(answer)
            min_len = question.get("min_length")
            max_len = question.get("max_length")
            if min_len is not None and len(answer_str) < min_len:
                return False, f"Answer for question '{question.get('question', f'Question {idx+1}')}' must be at least {min_len} characters"
            if max_len is not None and len(answer_str) > max_len:
                return False, f"Answer for question '{question.get('question', f'Question {idx+1}')}' must be at most {max_len} characters"
        
        elif question_type in ["select", "radio"]:
            # Single selection - answer must be in options
            options = question.get("options", [])
            if str(answer) not in [str(opt) for opt in options]:
                return False, f"Selected option for question '{question.get('question', f'Question {idx+1}')}' is not valid"
        
        elif question_type in ["multiselect", "checkbox"]:
            # Multiple selection - answer must be list, all items in options
            if not isinstance(answer, list):
                return False, f"Answer for question '{question.get('question', f'Question {idx+1}')}' must be a list"
            options = question.get("options", [])
            for item in answer:
                if str(item) not in [str(opt) for opt in options]:
                    return False, f"Selected option '{item}' for question '{question.get('question', f'Question {idx+1}')}' is not valid"
    
    return True, ""
