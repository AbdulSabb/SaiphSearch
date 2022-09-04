from collections import Counter
import json

class AutoCorrection:

    def __init__(self, words, alphabets):
        self.words = words
        self.alphabets = alphabets
        self.probs = {}  # The words probabilities
        self.words_cnt = {}  # The words frequencies
        self.vocabs = set(words)  # A set of the words

    def get_count(self):
        self.words_cnt = Counter(self.words)
        return self.words_cnt

    def get_probs(self):
        sm = sum(self.words_cnt.values())
        for key, value in self.words_cnt.items():
            self.probs[key] = value / sm
        return self.probs

    def delete(self, word):
        deleted = []
        for i in range(len(word)):
            deleted.append(word[:i] + word[i + 1:])
        return deleted

    def switch(self, word):
        switched = []
        for i in range(len(word)):
            if len(word[i:]) >= 2:
                switched.append(word[:i] + word[i + 1] + word[i] + word[i + 2:])
        return switched

    def replace(self, word):
        replaced = []
        for i in range(len(word)):
            for c in self.alphabets:
                if len(word) - i >= 1 and word[i] != c:
                    replaced.append(word[:i] + c + word[i + 1:])
            _replaced = sorted(replaced)
        return _replaced

    def insert(self, word):
        inserted = []
        for i in range(len(word)):
            for c in self.alphabets:
                inserted.append(word[:i] + c + word[i:])
        return inserted

    def transform(self, word):
        deleted = self.delete(word)
        switched = self.switch(word)
        replaced = self.replace(word)
        inserted = self.insert(word)

        transformed = deleted + switched + replaced + inserted
        return transformed

    def edit_one_letter(self, word):
        edit_set = set(self.transform(word))
        return edit_set

    def edit_two_letters(self, word):
        edit_set = set()
        for w1 in self.edit_one_letter(word):
            for w2 in self.edit_one_letter(word):
                edit_set.add(w2)
        return edit_set

    def get_correction(self, word):
        best_suggestion = []
        # To check if this word in our vocabs
        in_vocabs = self.vocabs.intersection([word])

        # To see if this word in our editing method for one letter
        edited_to_1_letter = self.edit_one_letter(word)
        in_one_letter = self.vocabs.intersection(edited_to_1_letter)

        # To see if our word in our editing method for two letters
        edited_to_2_letters = self.edit_two_letters(word)
        in_two_letters = self.vocabs.intersection(edited_to_2_letters)

        # To obtain our suggestions words from in_vocabs,one_letter and two letters
        suggestion = {word: self.probs.get(word, 0) for word in in_vocabs or in_one_letter or in_two_letters}

        # To sort our suggestions by using values and obtain best two suggestions
        best_suggestion = sorted(suggestion.items(), key=lambda item: item[1], reverse=True)[:2]
        return best_suggestion


def data():
    data_list = []
    file_data = open(r"data\ar_arz_wiki_corpus.json")
    for data in file_data:
        data_list.append((json.loads(data))['text'])
    txt = " ".join(data_list)
    return txt.split()

def get_correction_suggestions_ar(txt):
    words_lst = data()
    ar_letters = "ابتثجحخدذرزسشصضطظعغفقكلمنويءؤئإألإ"
    auto_correct = AutoCorrection(words_lst, ar_letters)

    txt = txt.split()
    corrected = []
    for word in txt:
        suggestion_word = auto_correct.get_correction(word)
        if len(suggestion_word) != 0:
            for i, j in suggestion_word:
                if i != word:
                    corrected.append(i)

    # if len(",".join(corrected)) == 0:
    #     return ",".join(['قارس','فراس','فريسة','مارس','حارس'])

    return ",".join(corrected)

