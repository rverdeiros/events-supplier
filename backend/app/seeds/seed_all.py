# backend/app/seeds/seed_all.py
"""
Script para popular o banco de dados com dados fake para testes.
Uso: python -m app.seeds.seed_all
"""
import sys
import os
from pathlib import Path

# Adiciona o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from faker import Faker
from faker.providers import internet, company, lorem, address, phone_number
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user_model import User
from app.models.supplier_model import Supplier
from app.models.category_model import Category
from app.models.review_model import Review
from app.models.contact_form_model import ContactForm
from app.models.media_model import Media
from app.utils.password_handler import hash_password
import json

# Configurar Faker para português brasileiro
fake = Faker('pt_BR')
fake.add_provider(internet)
fake.add_provider(company)
fake.add_provider(lorem)
fake.add_provider(address)
fake.add_provider(phone_number)

# Categorias pré-definidas
CATEGORIES = [
    "Fotografia",
    "Buffet",
    "Música",
    "Decoração",
    "Local para Eventos",
    "Flores",
    "Bebidas",
    "Segurança",
    "Iluminação",
    "Som e Iluminação",
    "Transporte",
    "Animação",
    "Cerimonial",
    "Convites",
    "Lembrancinhas"
]

# Faixas de preço
PRICE_RANGES = [
    "R$ 500 - R$ 1.000",
    "R$ 1.000 - R$ 2.500",
    "R$ 2.500 - R$ 5.000",
    "R$ 5.000 - R$ 10.000",
    "R$ 10.000+"
]

# Estados brasileiros
STATES = [
    "São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná",
    "Rio Grande do Sul", "Pernambuco", "Ceará", "Pará", "Santa Catarina",
    "Goiás", "Maranhão", "Paraíba", "Amazonas", "Espírito Santo",
    "Piauí", "Rio Grande do Norte", "Alagoas", "Tocantins", "Mato Grosso",
    "Distrito Federal", "Mato Grosso do Sul", "Sergipe", "Rondônia", "Acre",
    "Amapá", "Roraima"
]

def seed_categories(db: Session):
    """Cria categorias no banco"""
    print("[CATEGORIAS] Criando categorias...")
    for cat_name in CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat_name).first()
        if not existing:
            category = Category(
                name=cat_name,
                origin="fixed",
                active=True
            )
            db.add(category)
    db.commit()
    print(f"[OK] {len(CATEGORIES)} categorias criadas/verificadas")
    return db.query(Category).all()

def seed_users(db: Session, count: int = 50):
    """Cria usuários fake"""
    print(f"[USUARIOS] Criando {count} usuários...")
    users = []
    
    # Criar 1 admin
    admin = User(
        name="Admin Sistema",
        email="admin@eventsupplier.com",
        password_hash=hash_password("admin123"),
        type="admin"
    )
    db.add(admin)
    users.append(admin)
    
    # Criar alguns clientes
    for _ in range(count // 3):
        user = User(
            name=fake.name(),
            email=fake.unique.email(),
            password_hash=hash_password("senha123"),
            type="client"
        )
        db.add(user)
        users.append(user)
    
    # Criar fornecedores (o resto)
    supplier_count = count - len(users)
    for _ in range(supplier_count):
        user = User(
            name=fake.name(),
            email=fake.unique.email(),
            password_hash=hash_password("senha123"),
            type="supplier"
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"[OK] {len(users)} usuários criados")
    return users

def seed_suppliers(db: Session, users: list, categories: list):
    """Cria fornecedores fake"""
    print("[FORNECEDORES] Criando fornecedores...")
    suppliers = []
    supplier_users = [u for u in users if u.type == "supplier"]
    
    for user in supplier_users:
        # Alguns fornecedores podem não ter perfil ainda
        if random.random() < 0.9:  # 90% dos fornecedores têm perfil
            city = fake.city()
            state = random.choice(STATES)
            
            # Decide aleatoriamente se é PF ou PJ
            supplier_type = random.choice(["individual", "company"])
            
            # Gera dados baseados no tipo
            if supplier_type == "company":
                # Pessoa Jurídica
                legal_name = fake.company()
                fantasy_name = legal_name + " " + random.choice(["Eventos", "Produções", "Serviços", "Soluções"])
                cnpj = f"{fake.numerify('##')}.{fake.numerify('###')}.{fake.numerify('###')}/{fake.numerify('####')}-{fake.numerify('##')}"
            else:
                # Pessoa Física
                legal_name = None
                fantasy_name = fake.name() + " " + random.choice(["Eventos", "Fotografia", "Decoração", "Música"])
                cnpj = None
            
            supplier = Supplier(
                user_id=user.id,
                supplier_type=supplier_type,
                fantasy_name=fantasy_name,
                legal_name=legal_name,
                cnpj=cnpj,
                description=fake.text(max_nb_chars=500),
                category_id=random.choice(categories).id,
                address=fake.street_address(),
                zip_code=fake.postcode().replace("-", ""),  # CEP sem hífen
                city=city,
                state=state,
                price_range=random.choice(PRICE_RANGES),
                phone=fake.phone_number(),
                email=user.email,
                instagram_url=f"https://instagram.com/{fake.user_name()}" if random.random() < 0.7 else None,
                whatsapp_url=f"https://wa.me/55{fake.numerify('###########')}" if random.random() < 0.8 else None,
                site_url=f"https://{fake.domain_name()}" if random.random() < 0.5 else None,
                status="active"  # Todos os fornecedores criados via seed são ativos
            )
            db.add(supplier)
            suppliers.append(supplier)
    
    db.commit()
    print(f"[OK] {len(suppliers)} fornecedores criados")
    return suppliers

def seed_reviews(db: Session, users: list, suppliers: list):
    """Cria avaliações fake"""
    print("[AVALIACOES] Criando avaliações...")
    reviews = []
    client_users = [u for u in users if u.type == "client"]
    
    # Cada fornecedor recebe 0-5 avaliações
    for supplier in suppliers:
        num_reviews = random.randint(0, 5)
        reviewers = random.sample(client_users, min(num_reviews, len(client_users)))
        
        for reviewer in reviewers:
            review = Review(
                user_id=reviewer.id,
                supplier_id=supplier.id,
                rating=random.choices([1, 2, 3, 4, 5], weights=[1, 2, 3, 5, 8])[0],  # Mais 4s e 5s
                comment=fake.text(max_nb_chars=300),
                status=random.choice(["approved", "approved", "approved", "pending"])  # 75% aprovadas
            )
            db.add(review)
            reviews.append(review)
    
    db.commit()
    print(f"[OK] {len(reviews)} avaliações criadas")
    return reviews

def seed_contact_forms(db: Session, suppliers: list):
    """Cria formulários de contato fake"""
    print("[FORMULARIOS] Criando formulários de contato...")
    forms = []
    
    # Perguntas padrão para formulários
    default_questions = [
        "Qual a data do evento?",
        "Quantos convidados?",
        "Qual o tipo de evento?",
        "Qual o orçamento disponível?",
        "Alguma preferência especial?"
    ]
    
    for supplier in suppliers:
        if random.random() < 0.7:  # 70% dos fornecedores têm formulário
            form = ContactForm(
                supplier_id=supplier.id,
                questions_json=json.dumps(default_questions, ensure_ascii=False),
                active=random.choice([True, True, True, False])  # 75% ativos
            )
            db.add(form)
            forms.append(form)
    
    db.commit()
    print(f"[OK] {len(forms)} formulários de contato criados")
    return forms

def seed_media(db: Session, suppliers: list):
    """Cria mídias fake (usando URLs de placeholder)"""
    print("[MIDIAS] Criando mídias...")
    media_items = []
    
    # URLs de placeholder para imagens
    placeholder_urls = [
        "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Evento+1",
        "https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=Evento+2",
        "https://via.placeholder.com/800x600/45B7D1/FFFFFF?text=Evento+3",
        "https://via.placeholder.com/800x600/FFA07A/FFFFFF?text=Evento+4",
        "https://via.placeholder.com/800x600/98D8C8/FFFFFF?text=Evento+5",
        "https://via.placeholder.com/800x600/F7DC6F/FFFFFF?text=Evento+6",
    ]
    
    for supplier in suppliers:
        num_media = random.randint(2, 6)
        for _ in range(num_media):
            media = Media(
                supplier_id=supplier.id,
                type=random.choice(["image", "image", "image", "video"]),  # Mais imagens
                url=random.choice(placeholder_urls)
            )
            db.add(media)
            media_items.append(media)
    
    db.commit()
    print(f"[OK] {len(media_items)} mídias criadas")
    return media_items

def main():
    """Função principal para executar todos os seeds"""
    print("[SEED] Iniciando seed do banco de dados...\n")
    
    db = SessionLocal()
    try:
        # 1. Criar categorias
        categories = seed_categories(db)
        
        # 2. Criar usuários
        users = seed_users(db, count=50)
        
        # 3. Criar fornecedores
        suppliers = seed_suppliers(db, users, categories)
        
        # 4. Criar avaliações
        reviews = seed_reviews(db, users, suppliers)
        
        # 5. Criar formulários de contato
        contact_forms = seed_contact_forms(db, suppliers)
        
        # 6. Criar mídias
        media_items = seed_media(db, suppliers)
        
        print("\n" + "="*50)
        print("[SUCESSO] Seed concluído com sucesso!")
        print("="*50)
        print(f"Resumo:")
        print(f"   - Categorias: {len(categories)}")
        print(f"   - Usuários: {len(users)}")
        print(f"   - Fornecedores: {len(suppliers)}")
        print(f"   - Avaliações: {len(reviews)}")
        print(f"   - Formulários: {len(contact_forms)}")
        print(f"   - Mídias: {len(media_items)}")
        print("\nCredenciais de teste:")
        print(f"   Admin: admin@eventsupplier.com / admin123")
        print(f"   Clientes/Fornecedores: qualquer email / senha123")
        
    except Exception as e:
        db.rollback()
        print(f"\n[ERRO] Erro durante o seed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
