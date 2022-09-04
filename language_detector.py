import spacy
from spacy.language import Language
from spacy_langdetect import LanguageDetector

def get_lang_detector(nlp, name):
    return LanguageDetector()

def detect_language(word):
    nlp = spacy.load("en_core_web_sm")
    Language.factory("language_detector", func=get_lang_detector)
    nlp.add_pipe('language_detector', last=True)
    doc = nlp(word)
    language = 'ar' if doc._.language['language'] == 'ar' or doc._.language['language'] == 'fa' else 'en'
    return language