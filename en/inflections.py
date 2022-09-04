import lemminflect


def get_inflections_en(word):
    word = word.lower()
    all_inf = []
    upos = ['VERB', 'NOUN', 'ADV', 'ADJ']
    for u in upos:
        lemma = lemminflect.getLemma(word, upos=u)[0]
        inf = list(lemminflect.getAllInflections(lemma).values())
        for i in inf:
            for j in i:
                all_inf.append(j)
    return ",".join(list(set(all_inf)))

