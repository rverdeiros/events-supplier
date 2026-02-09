#!/usr/bin/env python3
"""
Script para resetar o banco de dados SQLite
Deleta o arquivo database.db e recria as tabelas com dados de seed

IMPORTANTE: Execute este script com o ambiente virtual ativado!
"""
import os
import sys

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(__file__))

# Verificar se estamos no ambiente virtual
def check_venv():
    """Verifica se o ambiente virtual está ativado"""
    in_venv = (
        hasattr(sys, 'real_prefix') or
        (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    )
    
    if not in_venv:
        print("⚠️  AVISO: Ambiente virtual não detectado!")
        print("💡 Certifique-se de ativar o venv antes de executar:")
        print("   Windows: .\\venv\\Scripts\\Activate.ps1")
        print("   Linux/Mac: source venv/bin/activate")
        print()
        resposta = input("Deseja continuar mesmo assim? (sim/não): ").strip().lower()
        if resposta not in ['sim', 's', 'yes', 'y']:
            sys.exit(1)
    
    # Tentar importar sqlalchemy para verificar dependências
    try:
        import sqlalchemy
    except ImportError:
        print("\n❌ ERRO: Módulo 'sqlalchemy' não encontrado!")
        print("💡 Instale as dependências primeiro:")
        print("   pip install -r requirements.txt")
        sys.exit(1)

def reset_database():
    """Reseta o banco de dados SQLite"""
    print("🔄 Resetando banco de dados...")
    
    # Caminho do arquivo do banco
    db_path = os.path.join(os.path.dirname(__file__), "database.db")
    db_backup_path = os.path.join(os.path.dirname(__file__), "database.db.backup")
    
    try:
        # Fechar todas as conexões com o banco antes de deletar
        print("🔌 Fechando conexões com o banco de dados...")
        try:
            from app.database import engine, SessionLocal
            # Fechar todas as sessões ativas
            engine.dispose()
            print("✅ Conexões fechadas!")
        except ImportError as e:
            print(f"❌ Erro ao importar módulos: {e}")
            print("💡 Certifique-se de que:")
            print("   1. O ambiente virtual está ativado (venv)")
            print("   2. As dependências estão instaladas: pip install -r requirements.txt")
            return False
        except Exception as e:
            print(f"⚠️  Aviso ao fechar conexões: {e}")
            print("💡 Certifique-se de que o servidor FastAPI está parado!")
        
        # Verificar se o banco existe
        if os.path.exists(db_path):
            # Criar backup antes de deletar
            print(f"\n📦 Criando backup do banco atual...")
            import shutil
            if os.path.exists(db_backup_path):
                os.remove(db_backup_path)
            shutil.copy2(db_path, db_backup_path)
            print(f"✅ Backup criado: {db_backup_path}")
            
            # Tentar deletar o banco
            print(f"\n🗑️  Deletando banco de dados: {db_path}")
            try:
                os.remove(db_path)
                print("✅ Banco de dados deletado!")
            except PermissionError:
                print("\n❌ ERRO: Não foi possível deletar o banco de dados!")
                print("💡 O arquivo está sendo usado por outro processo.")
                print("\n📋 SOLUÇÃO:")
                print("   1. Pare o servidor FastAPI (Ctrl+C no terminal onde está rodando)")
                print("   2. Feche qualquer programa que possa estar usando o banco (DB Browser, etc.)")
                print("   3. Execute este script novamente")
                print("\n   Ou delete manualmente o arquivo:")
                print(f"   Remove-Item {db_path}")
                return False
            except Exception as e:
                print(f"\n❌ Erro ao deletar banco: {e}")
                return False
        else:
            print("ℹ️  Banco de dados não existe ainda.")
        
        # Recriar tabelas e popular com seeds
        print("\n🌱 Recriando tabelas e populando com dados de seed...")
        from app.database import Base, engine, SessionLocal
        from app.models import user_model, supplier_model, category_model, review_model, media_model, contact_form_model
        
        # Criar todas as tabelas
        print("📦 Criando tabelas...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas!")
        
        # Popular com seeds
        print("🌱 Populando com dados de seed...")
        from app.seeds.seed_all import main as seed_main
        seed_main()
        
        print("\n✅ Banco de dados resetado com sucesso!")
        print(f"📁 Backup salvo em: {db_backup_path}")
        print("\n💡 Você pode restaurar o backup se necessário:")
        print(f"   Copie {db_backup_path} para {db_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao resetar banco de dados: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Verificar ambiente virtual e dependências
    check_venv()
    
    print("=" * 60)
    print("RESET DE BANCO DE DADOS")
    print("=" * 60)
    print()
    print("⚠️  ATENÇÃO: Esta operação irá:")
    print("   1. Deletar TODOS os dados do banco de dados")
    print("   2. Criar um backup do banco atual")
    print("   3. Recriar as tabelas")
    print("   4. Popular com dados de seed")
    print()
    print("📋 IMPORTANTE: Pare o servidor FastAPI antes de continuar!")
    print("   (Pressione Ctrl+C no terminal onde o servidor está rodando)")
    print()
    
    resposta = input("Servidor está parado? Deseja continuar? (sim/não): ").strip().lower()
    
    if resposta in ['sim', 's', 'yes', 'y']:
        success = reset_database()
        sys.exit(0 if success else 1)
    else:
        print("❌ Operação cancelada.")
        sys.exit(0)
