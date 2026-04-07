from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models
import os
from dotenv import load_dotenv
from database import get_db
from ldap3 import Server, Connection, ALL, SIMPLE
from ldap3.core.exceptions import LDAPExceptionError

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))
AD_SERVER = os.getenv("AD_SERVER")
AD_DOMAIN = os.getenv("AD_DOMAIN")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def authenticate_user(username: str, password: str, db: Session):
    ad_data = authenticate_ad_user(username.upper(), password)
    
    if ad_data:
        print(f"DEBUG AD: Usuário {username} autenticado com sucesso")
        user = db.query(models.User).filter(models.User.username == username.lower()).first()
        
        if not user:
            print(f"DEBUG DB: Criando novo usuário local para {username}")
            user = models.User(
                username=username.lower(),
                nome=ad_data["nome"],
                email=ad_data["email"],
                role="usuario",
                hashed_password=get_password_hash(password),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user

    user = db.query(models.User).filter(models.User.username == username).first()
    if user and verify_password(password, user.hashed_password):
        return user
        
    return False

def get_password_hash(password):
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_ad_user(username: str, password: str):
    user_principal_name = f"{username}@{AD_DOMAIN}"
    try:
        server = Server(AD_SERVER, get_info=ALL, connect_timeout=5)
        conn = Connection(server, user=user_principal_name, password=password, authentication=SIMPLE)
        
        if conn.bind():
            conn.search(search_base=f"dc={AD_DOMAIN.replace('.', ',dc=')}",
                        search_filter=f"(userPrincipalName={user_principal_name})",
                        attributes=['cn', 'mail'])
            
            user_data = None
            if conn.entries:
                entry = conn.entries[0]
                email_ad = None
                if 'mail' in entry:
                    email_ad = entry.mail.value if entry.mail.value else None

                user_data = {
                    "nome": entry.cn.value if 'cn' in entry else username,
                    "email": email_ad if email_ad else f"{username}@{AD_DOMAIN}"
                }
            
            conn.unbind()
            return user_data
        return None
    except Exception as e:
        print(f"Erro de conexão AD: {e}")
        return None

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if user is None:
        raise credentials_exception
        
    return user

def check_permissions(required_roles: list):
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in required_roles and current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado para seu nível de privilégio"
            )
        return current_user
    return role_checker