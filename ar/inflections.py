import pyarabic.araby as araby
import qalsadi.lemmatizer
from unimorph_inflect import inflect
from itertools import combinations


def get_inflections_ar(word):
    word = araby.strip_diacritics(word)
    lemmer = qalsadi.lemmatizer.Lemmatizer()
    word = lemmer.lemmatize(word)

    upos = ['V', 'N', 'ADJ', 'PST']
    combinations_list = []
    upos_combinations = []

    for i in range(len(upos) + 1):
        combinations_list += list(combinations(upos, i))

    for i in combinations_list:
      upos_combinations.append(";".join(i))

    if "" in upos_combinations:
        upos_combinations.remove("")

    result = []
    for u in upos_combinations:
      result.append(araby.strip_diacritics(inflect(word, u, language='ara')[0]))
    return ",".join(list(set(result)))
