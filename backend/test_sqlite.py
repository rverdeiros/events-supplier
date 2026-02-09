#!/usr/bin/env python3
"""
Script simples para testar se SQLite está funcionando
"""
import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base, SessionLocal
from app.models import user_model, supplier_model, category_model, review_model, media_model, contact_form_model

def test_database():
    """Testa a conexão com o banco de dados"""
    print("🧪 Testando conexão com banco de dados...")
    
    try:
        # Criar todas as tabelas
        print("📦 Criando tabelas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        # Testar conexão
        print("🔌 Testando conexão...")
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        print("✅ Conexão funcionando!")
        
        # Verificar tabelas criadas
        print("\n📊 Tabelas criadas:")
        inspector = engine.dialect.get_inspector(engine)
        tables = inspector.get_table_names()
        for table in tables:
            print(f"  - {table}")
        
        print("\n🎉 Tudo funcionando! Você pode iniciar o servidor agora:")
        print("   python -m uvicorn app.main:app --reload")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)
