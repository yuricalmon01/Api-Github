#!/usr/bin/env python3
# GitHub API CLI - Demonstração de Métodos HTTP
# Instalar dependências: pip install requests

import requests
import json
from typing import Dict, List, Optional

BASE_URL = 'https://api.github.com'

# Cores para terminal
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    BLUE = '\033[34m'
    YELLOW = '\033[33m'
    RED = '\033[31m'
    CYAN = '\033[36m'

def log(color: str, title: str, data: Dict):
    """Exibe dados formatados no terminal"""
    print(f"\n{color}=== {title} ==={Colors.RESET}")
    print(json.dumps(data, indent=2, ensure_ascii=False))

# ============================================
# GET - Buscar informações de um usuário
# ============================================
def get_user(username: str) -> Optional[Dict]:
    """Busca informações de um usuário do GitHub"""
    try:
        response = requests.get(f"{BASE_URL}/users/{username}")
        response.raise_for_status()
        
        data = response.json()
        
        user_data = {
            'login': data['login'],
            'name': data['name'],
            'bio': data['bio'],
            'public_repos': data['public_repos'],
            'followers': data['followers'],
            'following': data['following'],
            'created_at': data['created_at'],
            'url': data['html_url']
        }
        
        log(Colors.GREEN, 'GET /users/:username', user_data)
        return user_data
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro ao buscar usuário: {e}{Colors.RESET}")
        return None

# ============================================
# GET - Listar repositórios de um usuário
# ============================================
def get_user_repos(username: str, limit: int = 5) -> Optional[List[Dict]]:
    """Lista os repositórios mais recentes de um usuário"""
    try:
        params = {
            'per_page': limit,
            'sort': 'updated'
        }
        response = requests.get(f"{BASE_URL}/users/{username}/repos", params=params)
        response.raise_for_status()
        
        data = response.json()
        
        repos = [
            {
                'name': repo['name'],
                'description': repo['description'],
                'language': repo['language'],
                'stars': repo['stargazers_count'],
                'forks': repo['forks_count'],
                'url': repo['html_url']
            }
            for repo in data
        ]
        
        log(Colors.BLUE, f'GET /users/{username}/repos ({limit} mais recentes)', repos)
        return repos
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro ao buscar repositórios: {e}{Colors.RESET}")
        return None

# ============================================
# GET - Buscar repositórios por linguagem
# ============================================
def search_repos_by_language(language: str, limit: int = 5) -> Optional[List[Dict]]:
    """Busca repositórios mais populares de uma linguagem"""
    try:
        params = {
            'q': f'language:{language}',
            'sort': 'stars',
            'per_page': limit
        }
        response = requests.get(f"{BASE_URL}/search/repositories", params=params)
        response.raise_for_status()
        
        data = response.json()
        
        repos = [
            {
                'name': repo['full_name'],
                'description': repo['description'],
                'stars': repo['stargazers_count'],
                'language': repo['language'],
                'url': repo['html_url']
            }
            for repo in data['items']
        ]
        
        result = {
            'total_count': data['total_count'],
            'repositories': repos
        }
        
        log(Colors.CYAN, f'GET /search/repositories (linguagem: {language})', result)
        return repos
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro na busca: {e}{Colors.RESET}")
        return None

# ============================================
# POST - Criar um gist (requer autenticação)
# ============================================
def create_gist(token: str, description: str, filename: str, content: str) -> Optional[Dict]:
    """Cria um novo gist no GitHub"""
    try:
        headers = {
            'Authorization': f'token {token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'description': description,
            'public': False,
            'files': {
                filename: {
                    'content': content
                }
            }
        }
        
        response = requests.post(f"{BASE_URL}/gists", headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        gist_info = {
            'id': data['id'],
            'description': data['description'],
            'url': data['html_url'],
            'created_at': data['created_at']
        }
        
        log(Colors.GREEN, 'POST /gists (criado)', gist_info)
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro ao criar gist: {e}{Colors.RESET}")
        return None

# ============================================
# PATCH - Atualizar um gist (requer autenticação)
# ============================================
def update_gist(token: str, gist_id: str, new_description: str) -> Optional[Dict]:
    """Atualiza a descrição de um gist"""
    try:
        headers = {
            'Authorization': f'token {token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'description': new_description
        }
        
        response = requests.patch(f"{BASE_URL}/gists/{gist_id}", headers=headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        
        gist_info = {
            'id': data['id'],
            'description': data['description'],
            'updated_at': data['updated_at']
        }
        
        log(Colors.YELLOW, 'PATCH /gists/:id (atualizado)', gist_info)
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro ao atualizar gist: {e}{Colors.RESET}")
        return None

# ============================================
# DELETE - Deletar um gist (requer autenticação)
# ============================================
def delete_gist(token: str, gist_id: str) -> bool:
    """Deleta um gist do GitHub"""
    try:
        headers = {
            'Authorization': f'token {token}'
        }
        
        response = requests.delete(f"{BASE_URL}/gists/{gist_id}", headers=headers)
        
        if response.status_code == 204:
            result = {
                'message': 'Gist deletado com sucesso',
                'id': gist_id
            }
            log(Colors.RED, 'DELETE /gists/:id', result)
            return True
        else:
            response.raise_for_status()
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}Erro ao deletar gist: {e}{Colors.RESET}")
        return False

# ============================================
# FUNÇÃO PRINCIPAL - DEMONSTRAÇÃO
# ============================================
def main():
    """Executa demonstrações dos métodos HTTP"""
    print(f"{Colors.CYAN}")
    print("╔═══════════════════════════════════════════╗")
    print("║   GitHub API - Demonstração de Métodos   ║")
    print("╚═══════════════════════════════════════════╝")
    print(f"{Colors.RESET}")
    
    # Exemplos de uso dos métodos GET (não requerem autenticação)
    get_user('torvalds')
    get_user_repos('github', 3)
    search_repos_by_language('python', 3)
    
    # Exemplos de métodos POST, PATCH, DELETE (requerem token)
    print(f"\n{Colors.YELLOW}⚠️  Para usar POST, PATCH e DELETE, você precisa de um token do GitHub.{Colors.RESET}")
    print(f"{Colors.YELLOW}   Obtenha em: https://github.com/settings/tokens{Colors.RESET}")
    print(f"{Colors.YELLOW}   Exemplo de uso:{Colors.RESET}\n")
    
    print("   TOKEN = 'seu_token_aqui'")
    print("   gist = create_gist(TOKEN, 'Meu gist', 'exemplo.txt', 'Conteúdo aqui')")
    print("   update_gist(TOKEN, gist['id'], 'Descrição atualizada')")
    print("   delete_gist(TOKEN, gist['id'])")
    
    print(f"\n{Colors.CYAN}Exemplo de uso com token (descomente para testar):{Colors.RESET}")
    print("""
    # TOKEN = 'seu_token_aqui'
    # gist = create_gist(TOKEN, 'Teste API', 'teste.py', 'print("Hello World")')
    # if gist:
    #     update_gist(TOKEN, gist['id'], 'Teste API - Atualizado')
    #     delete_gist(TOKEN, gist['id'])
    """)

if __name__ == '__main__':
    main()