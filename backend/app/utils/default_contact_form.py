# app/utils/default_contact_form.py
"""
Default contact form template that all suppliers start with.
Suppliers can customize this template.
"""

def get_default_contact_form_questions():
    """
    Returns the default contact form questions template.
    This is used when a supplier creates their first contact form.
    """
    return [
        {
            "question": "Nome completo",
            "type": "text",
            "required": True,
            "placeholder": "Digite seu nome completo"
        },
        {
            "question": "E-mail",
            "type": "email",
            "required": True,
            "placeholder": "seu@email.com"
        },
        {
            "question": "Telefone/WhatsApp",
            "type": "phone",
            "required": True,
            "placeholder": "(00) 00000-0000"
        },
        {
            "question": "Data do evento",
            "type": "date",
            "required": True,
            "placeholder": "Selecione a data"
        },
        {
            "question": "Número de convidados",
            "type": "number",
            "required": True,
            "min_value": 1,
            "placeholder": "Ex: 100"
        },
        {
            "question": "Local do evento",
            "type": "text",
            "required": False,
            "placeholder": "Cidade, Estado"
        },
        {
            "question": "Tipo de evento",
            "type": "select",
            "required": True,
            "options": [
                "Casamento",
                "Aniversário",
                "Formatura",
                "Corporativo",
                "Festa Infantil",
                "Outro"
            ]
        },
        {
            "question": "Orçamento estimado",
            "type": "select",
            "required": False,
            "options": [
                "Até R$ 5.000",
                "R$ 5.000 - R$ 10.000",
                "R$ 10.000 - R$ 20.000",
                "R$ 20.000 - R$ 50.000",
                "Acima de R$ 50.000"
            ]
        },
        {
            "question": "Conte-nos mais sobre seu evento",
            "type": "textarea",
            "required": False,
            "placeholder": "Detalhes adicionais sobre o evento, preferências, etc.",
            "max_length": 1000
        }
    ]

