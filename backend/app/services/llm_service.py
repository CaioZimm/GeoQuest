import requests
import json
import os
import re

def generate_clues_for_country(country_name: str) -> list[str]:
    """
    Gera 6 dicas usando a API REST do Gemini para um país específico.
    Se a API não estiver configurada ou falhar, retorna um fallback genérico.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY não encontrada no ambiente.")
        return get_fallback_clues(country_name)
    
    prompt = f"""
Você é um especialista em geografia. O país alvo é: "{country_name}".
Gere 6 dicas CURTAS sobre este país, em português, da mais difícil para a mais fácil.
Seja direto (máximo 15 palavras por dica) envolvendo: história, geografia, ou cultura.
Não cite o nome do país nem do povo.
Retorne APENAS um JSON array de strings:
[
  "Dica 1 difícil...",
  "Dica 2...",
  "Dica 3...",
  "Dica 4...",
  "Dica 5...",
  "Dica 6 fácil..."
]
"""
    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.5-flash"
    ]
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            try:
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            except (KeyError, IndexError):
                print(f"Estrutura inesperada no modelo {model_name}. Tentando o próximo...")
                continue
            
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\n", "", text)
                text = re.sub(r"\n```$", "", text)
                
            clues = json.loads(text)
            if isinstance(clues, list) and len(clues) == 6:
                return [str(c) for c in clues]
            else:
                print(f"Formato inválido retornado pelo {model_name}. Tentando o próximo...")
                continue
            
        except requests.exceptions.HTTPError as e:
            print(f"Modelo {model_name} retornou HTTP {e.response.status_code}. Pulando para o próximo...")
            continue
        except requests.exceptions.RequestException as e:
            print(f"Erro de rede no modelo {model_name}: {e}. Pulando para o próximo...")
            continue
        except Exception as e:
            print(f"Erro geral no modelo {model_name}: {e}. Pulando para o próximo...")
            continue
            
    print("Todas as opções de modelos do Gemini falharam ou estão sem cota. Recorrendo ao Fallback...")
    return get_fallback_clues(country_name)

def get_fallback_clues(country_name: str) -> list[str]:
    """
    Fallback se a chave não estiver configurada ou a IA falhar.
    """
    return [
        f"Dica 1 (IA Indisponível): O país procurado está na Terra.",
        f"Dica 2 (IA Indisponível): Ele possui governo e leis.",
        f"Dica 3 (IA Indisponível): Pessoas vivem neste país.",
        f"Dica 4 (IA Indisponível): Possui cidades e, provavelmente, uma capital.",
        f"Dica 5 (IA Indisponível): A resposta que você precisa dar é bem óbvia agora.",
        f"Dica 6 (IA Indisponível): A resposta é {country_name}."
    ]