import requests
from bs4 import BeautifulSoup

def get_synonyms_ar(word):
    response = requests.get(f'https://synonyms.reverso.net/synonym/ar/{word}', headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(response.text, 'html.parser')
    txt = soup.find_all('a', class_='synonym relevant')
    synonyms = []
    for t in txt:
        synonyms.append(t.text.strip())

    return ",".join(synonyms)


