# Como Resetar o Banco de Dados

## Método 1: Usando o Script Python (Recomendado)

```bash
# No diretório backend/
python reset_database.py
```

O script irá:
1. ✅ Criar um backup do banco atual (`database.db.backup`)
2. ✅ Deletar o banco de dados atual
3. ✅ Recriar todas as tabelas
4. ✅ Popular com dados de seed (categorias, usuários, fornecedores, etc.)

## Método 2: Deletar Manualmente o Arquivo

```bash
# Windows PowerShell
cd backend
Remove-Item database.db
python -m app.seeds.seed_all

# Linux/Mac
cd backend
rm database.db
python -m app.seeds.seed_all
```

## Método 3: Usando Python Interativo

```python
# No diretório backend/
python
>>> from app.database import Base, engine
>>> from app.models import user_model, supplier_model, category_model, review_model, media_model, contact_form_model
>>> Base.metadata.drop_all(bind=engine)  # Deleta todas as tabelas
>>> Base.metadata.create_all(bind=engine)  # Recria todas as tabelas
>>> from app.seeds.seed_all import main
>>> main()  # Popula com dados de seed
```

## ⚠️ Importante

- **Backup automático**: O script cria um backup antes de deletar
- **Dados de seed**: Após resetar, você terá dados de teste incluindo:
  - 1 usuário admin: `admin@eventsupplier.com` / `admin123`
  - 50 usuários de teste: qualquer email / `senha123`
  - Categorias pré-cadastradas
  - Fornecedores de exemplo

## 🔄 Restaurar Backup

Se precisar restaurar o backup:

```bash
# Windows PowerShell
cd backend
Copy-Item database.db.backup database.db

# Linux/Mac
cd backend
cp database.db.backup database.db
```
