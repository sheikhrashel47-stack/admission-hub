/* Parts of Speech Mastery — manually reconstructed from the user-provided 100-page PDF. */
(function(){
  'use strict';
  const sourceQuestions=[];
  const sourceRows=[
  {
    "n": 1,
    "q": "A word that names a person, place, thing or idea is a/an —",
    "o": [
      "Adjective",
      "Noun",
      "Pronoun",
      "Adverb"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "Noun = name word. Adjective describe কে র, pronoun replace কে র, adverb modify কে র।"
  },
  {
    "n": 2,
    "q": "In “Honesty is the best policy,” the word Honesty is —",
    "o": [
      "an adjective",
      "an adverb",
      "an abstract noun",
      "a material noun"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "Honesty একে টি idea/quality — abstract noun. Material হ তিো gold, water ইতি্যো দি।"
  },
  {
    "n": 3,
    "q": "A pronoun is used —",
    "o": [
      "to describe a noun",
      "instead of a noun",
      "to join two clauses",
      "to show relation with an object"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "Pronoun = noun-এর বদি ল। Describe = adjective; join = conjunction; relation+object = preposition."
  },
  {
    "n": 4,
    "q": "The underlined word in “Karim is poor. He is honest.” is a —",
    "o": [
      "noun",
      "pronoun",
      "adjective",
      "verb"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "He replaces Karim → personal pronoun."
  },
  {
    "n": 5,
    "q": "An adjective qualifies a —",
    "o": [
      "verb or adverb",
      "noun or pronoun",
      "clause only",
      "preposition"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "Adjective-এর কেোজ noun/pronoun- কে qualify কেরো। Verb/adverb qualify কে র adverb."
  },
  {
    "n": 6,
    "q": "Which word is a verb in “Time is money”?",
    "o": [
      "Time",
      "is",
      "money",
      "None"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "is = being/state verb (linking). Time ও money noun."
  },
  {
    "n": 7,
    "q": "Adverbs typically answer the questions —",
    "o": [
      "Who? / What?",
      "Which? / What kind?",
      "How? / When? / Where?",
      "For whom?"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "How/When/Where/How often/How much = adverb questions."
  },
  {
    "n": 8,
    "q": "In “The book is on the table,” on is a —",
    "o": [
      "conjunction",
      "adverb",
      "preposition",
      "interjection"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "on + object (the table) → preposition of place."
  },
  {
    "n": 9,
    "q": "Words like and, but, or, because are —",
    "o": [
      "prepositions",
      "conjunctions",
      "interjections",
      "adjectives"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "এগু লো join কে র → conjunction. because subordinating; and/but/or coordinating."
  },
  {
    "n": 10,
    "q": "“Alas! He is no more.” The word Alas is —",
    "o": [
      "an adverb",
      "a conjunction",
      "an interjection",
      "an adjective"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "Alas sudden grief প ্র কেোশে কে র এবং structure-এর অংশে নি য়ে → interjection."
  },
  {
    "n": 11,
    "q": "Traditional English grammar recognises how many parts of speech?",
    "o": [
      "6",
      "7",
      "8",
      "9"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "Noun, Pronoun, Adjective, Verb, Adverb, Preposition, Conjunction, Interjection — 8."
  },
  {
    "n": 12,
    "q": "Choose the correct identification: “The honest man spoke.”",
    "o": [
      "honest = adverb",
      "honest = noun",
      "honest = adjective",
      "honest = verb"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "honest describes man (noun) → adjective of quality."
  },
  {
    "n": 13,
    "q": "In “She ran quickly,” quickly is —",
    "o": [
      "an adjective modifying She",
      "an adverb modifying ran",
      "a preposition",
      "a noun"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "quickly tells HOW she ran → adverb of manner."
  },
  {
    "n": 14,
    "q": "Which of the following is a material noun?",
    "o": [
      "childhood",
      "committee",
      "cotton",
      "Canada"
    ],
    "a": 2,
    "tier": "BASIC",
    "e": "cotton = substance. childhood abstract; committee collective; Canada proper."
  },
  {
    "n": 15,
    "q": "The word they in “The boys are playing. They are happy.” is a —",
    "o": [
      "relative pronoun",
      "personal pronoun",
      "demonstrative pronoun",
      "reflexive pronoun"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "they = 3rd person plural personal pronoun. Antecedent = the boys."
  },
  {
    "n": 16,
    "q": "A preposition must have —",
    "o": [
      "a clause after it",
      "an object",
      "an -ly ending",
      "a subject of its own"
    ],
    "a": 1,
    "tier": "BASIC",
    "e": "Preposition-এর object থেোকে তি হ য়ে (noun/pronoun/gerund). Clause থেোকে ল প ্র ো য়ে ই conjunction."
  },
  {
    "n": 17,
    "q": "Which is a collective noun?",
    "o": [
      "honesty",
      "army",
      "iron",
      "London"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "army = group of soldiers as one. honesty abstract; iron material; London proper."
  },
  {
    "n": 18,
    "q": "The abstract noun of ‘poor’ is —",
    "o": [
      "poorness",
      "poorly",
      "poverty",
      "impoverish"
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "poor → poverty. (poorness অচেল; impoverish verb.)"
  },
  {
    "n": 19,
    "q": "Which word is uncountable?",
    "o": [
      "chair",
      "information",
      "apple",
      "idea"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "information uncountable: much information / a piece of information — not informations."
  },
  {
    "n": 20,
    "q": "In “This is my book,” my is a —",
    "o": [
      "possessive pronoun",
      "possessive adjective",
      "personal pronoun",
      "reflexive pronoun"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "my-এর প র noun book আ ছ → possessive adjective. mine হ ল pronoun: This is mine."
  },
  {
    "n": 21,
    "q": "“The book is mine.” The word mine is a —",
    "o": [
      "possessive adjective",
      "possessive pronoun",
      "noun",
      "adverb"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "mine একেো ব সে ছ, প র noun নিই → possessive pronoun."
  },
  {
    "n": 22,
    "q": "He is ___ university student.",
    "o": [
      "an",
      "a",
      "the",
      "No article"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "university /juː/ — consonant sound → a, letter U vowel হ লও।"
  },
  {
    "n": 23,
    "q": "He is ___ honest man.",
    "o": [
      "a",
      "an",
      "the",
      "No article"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "honest-এ h silent → vowel sound → an honest man."
  },
  {
    "n": 24,
    "q": "“I have little money.” This means —",
    "o": [
      "I have some money (enough)",
      "I have almost no money",
      "I have all the money there is",
      "I have too much money"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "little (without a) = negative, almost none. a little = some."
  },
  {
    "n": 25,
    "q": "The comparative of ‘good’ is —",
    "o": [
      "gooder",
      "more good",
      "better",
      "best"
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "Irregular: good — better — best. more good ভিুল।"
  },
  {
    "n": 26,
    "q": "Choose the grammatically correct sentence.",
    "o": [
      "He is more taller than I.",
      "He is taller than I.",
      "He is most tall than I.",
      "He is taller than me is."
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "Double comparative নি ষধ (more taller). Formal: taller than I (am). D- তি ‘is’ ভিুল।"
  },
  {
    "n": 27,
    "q": "In “He kicked the ball,” kicked is —",
    "o": [
      "intransitive",
      "transitive",
      "a linking verb",
      "a modal"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "kicked + object (the ball) → transitive. Passive সেম্ ভ ব: The ball was kicked."
  },
  {
    "n": 28,
    "q": "“Swimming is a good exercise.” Swimming is a —",
    "o": [
      "present participle",
      "gerund",
      "finite verb",
      "infinitive"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "Swimming = subject, name of an activity → gerund (verbal noun)."
  },
  {
    "n": 29,
    "q": "“To err is human.” To err is —",
    "o": [
      "a prepositional phrase",
      "an infinitive used as a noun",
      "an adverb of purpose",
      "a gerund"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "to + verb as subject of is → infinitive as noun."
  },
  {
    "n": 30,
    "q": "He works hard. The word hard is —",
    "o": [
      "an adjective",
      "an adverb of manner",
      "equivalent to hardly",
      "a noun"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "hard modifies works → adverb. hardly হ ল অথের্য ‘প ্র ো য়ে নিো’।"
  },
  {
    "n": 31,
    "q": "I have not seen him since Monday. Here since is a —",
    "o": [
      "conjunction",
      "preposition",
      "adverb",
      "adjective"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "since + noun (Monday) → preposition of time."
  },
  {
    "n": 32,
    "q": "I have not seen him since he left. Here since is a —",
    "o": [
      "preposition",
      "adverb",
      "conjunction",
      "relative pronoun"
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "since + clause (he left) → subordinating conjunction."
  },
  {
    "n": 33,
    "q": "Which is a coordinating conjunction?",
    "o": [
      "because",
      "although",
      "but",
      "if"
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "but = FANBOYS. অনি্যগু লো subordinating."
  },
  {
    "n": 34,
    "q": "Neither of the two boys ___ present.",
    "o": [
      "are",
      "were",
      "have",
      "is"
    ],
    "a": 3,
    "tier": "INTERMEDIATE",
    "e": "neither = singular → is. (formal/traditional exam)"
  },
  {
    "n": 35,
    "q": "The news ___ true.",
    "o": [
      "are",
      "were",
      "is",
      "have been"
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "news uncountable/singular → The news is true."
  },
  {
    "n": 36,
    "q": "In “This book is mine,” This is a —",
    "o": [
      "demonstrative pronoun",
      "demonstrative adjective",
      "relative pronoun",
      "article"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "This + noun book → demonstrative adjective. ‘This is mine’ হ ল pronoun."
  },
  {
    "n": 37,
    "q": "In “This is mine,” This is a —",
    "o": [
      "demonstrative adjective",
      "demonstrative pronoun",
      "adverb",
      "conjunction"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "This একেো subject → demonstrative pronoun."
  },
  {
    "n": 38,
    "q": "He hurt himself. himself is —",
    "o": [
      "an emphatic pronoun",
      "a reflexive pronoun",
      "a reciprocal pronoun",
      "a personal pronoun in nominative"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "object = subject → reflexive. বোদি দি ল অথের্য ভিো ঙে (He hurt ?)."
  },
  {
    "n": 39,
    "q": "He himself opened the door. himself is —",
    "o": [
      "reflexive",
      "emphatic",
      "reciprocal",
      "relative"
    ],
    "a": 1,
    "tier": "INTERMEDIATE",
    "e": "বোদি দি লও sentence চে ল: He opened the door. → emphatic (emphasis)."
  },
  {
    "n": 40,
    "q": "Choose the correct sentence.",
    "o": [
      "He gave me an advice.",
      "He gave me many informations.",
      "He gave me a piece of advice.",
      "He gave me furnitures."
    ],
    "a": 2,
    "tier": "INTERMEDIATE",
    "e": "advice/information/furniture uncountable. piece of advice ঠি কে।"
  },
  {
    "n": 41,
    "q": "The earth is round. The word round is —",
    "o": [
      "a noun",
      "a verb",
      "an adjective",
      "an adverb"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "round describes earth after linking verb is → predicative adjective."
  },
  {
    "n": 42,
    "q": "They sat round the fire. Here round is —",
    "o": [
      "an adjective",
      "an adverb",
      "a preposition",
      "a noun"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "round + object (the fire) → preposition."
  },
  {
    "n": 43,
    "q": "He came round. Here round is —",
    "o": [
      "an adjective",
      "an adverb",
      "a preposition",
      "a verb"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "came- কে modify, object নিই → adverb."
  },
  {
    "n": 44,
    "q": "She looks like her mother. The word like is —",
    "o": [
      "a verb",
      "an adjective",
      "a preposition",
      "an adverb"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "like + object (her mother) = similarity → preposition. (looks = linking-like appearance verb)"
  },
  {
    "n": 45,
    "q": "I like coffee. Here like is —",
    "o": [
      "a preposition",
      "a verb",
      "an adjective",
      "a noun"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "like = ‘পছন্দি কেরো’ → principal verb with object coffee."
  },
  {
    "n": 46,
    "q": "None but the brave deserve the fair. The word but is —",
    "o": [
      "a coordinating conjunction",
      "an adverb meaning ‘only’",
      "a preposition meaning ‘except’",
      "a relative pronoun"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "but = except. Object = the brave. Classic admission line."
  },
  {
    "n": 47,
    "q": "I know that he is honest. that is —",
    "o": [
      "a demonstrative adjective",
      "a demonstrative pronoun",
      "a relative pronoun",
      "a subordinating conjunction"
    ],
    "a": 3,
    "tier": "ADMISSION",
    "e": "that joins noun-clause ‘he is honest’ — itself clause-এর member নি য়ে → conjunction."
  },
  {
    "n": 48,
    "q": "The book that I bought is costly. that is —",
    "o": [
      "a conjunction",
      "a relative pronoun",
      "a demonstrative adjective",
      "an adverb"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "antecedent = book; that = object of bought → relative pronoun."
  },
  {
    "n": 49,
    "q": "That book is costly. that is —",
    "o": [
      "a relative pronoun",
      "a conjunction",
      "a demonstrative adjective",
      "a demonstrative pronoun"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "that modifies book → demonstrative adjective."
  },
  {
    "n": 50,
    "q": "He is old enough to marry. enough is —",
    "o": [
      "an adjective",
      "an adverb",
      "a noun",
      "a preposition"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "enough modifies adjective old and sits AFTER it → adverb."
  },
  {
    "n": 51,
    "q": "We have enough food. enough is —",
    "o": [
      "an adverb",
      "a noun",
      "an adjective",
      "a pronoun"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "enough modifies noun food and sits BEFORE it → adjective."
  },
  {
    "n": 52,
    "q": "Still waters run deep. still is —",
    "o": [
      "an adverb meaning ‘even now’",
      "an adjective meaning ‘motionless’",
      "a conjunction",
      "a verb"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "still describes waters → adjective."
  },
  {
    "n": 53,
    "q": "He is still waiting. still is —",
    "o": [
      "an adjective",
      "a noun",
      "an adverb",
      "a preposition"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "still = even now, modifies waiting → adverb."
  },
  {
    "n": 54,
    "q": "Identify ‘flying’: (i) Flying planes can be dangerous. If it means ‘the activity’ —",
    "o": [
      "present participle",
      "gerund",
      "finite verb",
      "infinitive"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "activity as subject → gerund. ( দি অথের্য হ য়ে ‘planes that fly’ তি ব flying participle adjective — ambiguity classic. এখো নি stem ব ল ছ activity.)"
  },
  {
    "n": 55,
    "q": "In “a sleeping child,” sleeping is —",
    "o": [
      "a gerund",
      "a present participle used as an adjective",
      "a finite verb",
      "an infinitive"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "sleeping describes child → participle adjective. Gerund হ তিো: Sleeping is necessary."
  },
  {
    "n": 56,
    "q": "The soup tastes sweet. sweet is —",
    "o": [
      "an adverb",
      "an adjective",
      "a noun",
      "a verb"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "tastes = linking verb → complement adjective. sweetly ভিুল।"
  },
  {
    "n": 57,
    "q": "He worked as a teacher. as is best classified as —",
    "o": [
      "a subordinating conjunction of time",
      "an adverb of manner",
      "a preposition (= in the role of)",
      "an interjection"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "as + noun phrase ‘a teacher’ = in the capacity of → preposition (traditional exam key)."
  },
  {
    "n": 58,
    "q": "He went home. home is —",
    "o": [
      "a noun, object of a preposition",
      "an adverb of place",
      "an adjective",
      "a preposition"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "go home — no to. home here = adverb of place. (He went to his home → noun)"
  },
  {
    "n": 59,
    "q": "The poor are not always unhappy. The word poor is used as —",
    "o": [
      "an adverb",
      "a verb",
      "a noun (adjective used as noun)",
      "a preposition"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "the + adj = class of people; verb are (plural) → noun function."
  },
  {
    "n": 60,
    "q": "After a long walk he is well. well is —",
    "o": [
      "an adverb of manner",
      "an adjective (healthy)",
      "a noun",
      "a conjunction"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "is well = in good health → adjective. He plays well হ ল adverb."
  },
  {
    "n": 61,
    "q": "He is the very man I want. very is —",
    "o": [
      "an adverb of degree",
      "an adjective",
      "a pronoun",
      "a conjunction"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "the very + noun = emphasizing adjective (‘ ঠি কে সেই’)."
  },
  {
    "n": 62,
    "q": "He walked past the gate. past is —",
    "o": [
      "an adjective",
      "a noun",
      "a preposition",
      "a verb"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "past + object the gate → preposition. (the past = noun; past glory = adj; walked past = adv if no object)"
  },
  {
    "n": 63,
    "q": "He is used to getting up early. to is —",
    "o": [
      "an infinitive marker",
      "a preposition",
      "an adverb",
      "a conjunction"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "be used to + gerund. to-এর object = getting → preposition. (He used to get up → infinitive)"
  },
  {
    "n": 64,
    "q": "He prefers tea ___ coffee.",
    "o": [
      "than",
      "to",
      "from",
      "against"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "prefer A to B. than নি য়ে । superior/inferior/senior-ও to নি য়ে ।"
  },
  {
    "n": 65,
    "q": "Identify the incorrect sentence.",
    "o": [
      "We discussed the plan.",
      "He entered the room.",
      "We discussed about the plan.",
      "She resembles her mother."
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "discuss transitive — about নি ষধ। enter/resemble-ও সেোধোরণতি extra prep চেো য়ে নিো।"
  },
  {
    "n": 66,
    "q": "Between you and ___, he is guilty.",
    "o": [
      "I",
      "myself",
      "me",
      "mine"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "between = preposition → objective case me. between you and I classic error."
  },
  {
    "n": 67,
    "q": "The man ___ I met was a poet.",
    "o": [
      "who",
      "whom",
      "which",
      "what"
    ],
    "a": 1,
    "tier": "ADMISSION",
    "e": "I met him → whom (object). who subject হ য়ে । persons-এ which নি য়ে ।"
  },
  {
    "n": 68,
    "q": "I remember the day when we first met. when is —",
    "o": [
      "a subordinating conjunction only",
      "an interrogative adverb",
      "a relative adverb",
      "a preposition"
    ],
    "a": 2,
    "tier": "ADMISSION",
    "e": "antecedent = day; when ≈ on which → relative adverb."
  },
  {
    "n": 69,
    "q": "I have not seen him since. The word since is —",
    "o": [
      "a preposition",
      "a conjunction",
      "an adverb",
      "an adjective"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "প র object বো clause নিই — since = from then until now → adverb. (since Monday = prep; since he left = conj)"
  },
  {
    "n": 70,
    "q": "He hardly works. This means —",
    "o": [
      "He works with great effort",
      "He works overtime",
      "He almost does not work",
      "He works hard indeed"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "hardly = almost not. hard = with effort. অথের্য উ ল্ট ো।"
  },
  {
    "n": 71,
    "q": "Choose the correct sentence.",
    "o": [
      "He spoke to me friendly.",
      "He spoke to me in a friendly way.",
      "He spoke to me friendlily.",
      "He spoke me friendly."
    ],
    "a": 1,
    "tier": "TRAP / ADVANCED",
    "e": "friendly adjective, not adverb. in a friendly manner/way ঠি কে।"
  },
  {
    "n": 72,
    "q": "I feel ___ about the mistake.",
    "o": [
      "badly",
      "bad",
      "worsely",
      "badder"
    ],
    "a": 1,
    "tier": "TRAP / ADVANCED",
    "e": "feel linking → adjective bad. feel badly অনি্য অথের্য (tactile). Exam expects bad."
  },
  {
    "n": 73,
    "q": "Dhaka is bigger than ___ in Bangladesh.",
    "o": [
      "any city",
      "all the city",
      "any other city",
      "any cities"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "Dhaka নি জ city — any city নি জ কে compare কে র। চেোই any other city."
  },
  {
    "n": 74,
    "q": "No sooner had he left ___ it started raining.",
    "o": [
      "when",
      "then",
      "than",
      "that"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "no sooner … than. hardly/scarcely … when. জোডয়েো ভিোঙে লই error."
  },
  {
    "n": 75,
    "q": "I look forward to ___ you.",
    "o": [
      "meet",
      "meeting",
      "met",
      "have meet"
    ],
    "a": 1,
    "tier": "TRAP / ADVANCED",
    "e": "look forward to + gerund (to = preposition)."
  },
  {
    "n": 76,
    "q": "Iron is the most useful of ___ .",
    "o": [
      "all other metals",
      "all metals",
      "any metal",
      "any other metal"
    ],
    "a": 1,
    "tier": "TRAP / ADVANCED",
    "e": "Superlative-এ other থেো কে নিো: the most useful of all metals. Comparative-এ: more useful than any other metal."
  },
  {
    "n": 77,
    "q": "One should do ___ duty.",
    "o": [
      "his",
      "their",
      "one's",
      "your"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "antecedent one থেোকে ল pronoun one's. his/your chain ভিো ঙে (strict exam)."
  },
  {
    "n": 78,
    "q": "What! You have failed again? The first What is —",
    "o": [
      "an interrogative pronoun",
      "an interrogative adjective",
      "an interjection",
      "a relative pronoun"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "What! = sudden surprise, not a real question word here → interjection."
  },
  {
    "n": 79,
    "q": "He has but one rupee left. but is —",
    "o": [
      "a preposition meaning except",
      "a coordinating conjunction",
      "an adverb meaning ‘only’",
      "a relative pronoun"
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "but = only (adverb). Compare: none but the brave (prep); poor but honest (conj)."
  },
  {
    "n": 80,
    "q": "Choose the sentence in which ‘after’ is a conjunction.",
    "o": [
      "He came after the meeting.",
      "He came after.",
      "He came after the meeting ended.",
      "The after effects were bad."
    ],
    "a": 2,
    "tier": "TRAP / ADVANCED",
    "e": "C: after + clause (the meeting ended) → conjunction. A prep; B adverb; D adjective (after-effects)."
  }
];
  sourceRows.forEach(r=>sourceQuestions.push({id:`parts-source-${String(r.n).padStart(3,'0')}`,tag:'PDF Source',family:r.tier,q:r.q,o:r.o,a:r.a,e:r.e}));
  if(sourceQuestions.length!==80)throw new Error(`Parts source MCQ expected 80, got ${sourceQuestions.length}`);
  const sourceTiers={BASIC:16,INTERMEDIATE:24,ADMISSION:28,'TRAP / ADVANCED':12};
  Object.entries(sourceTiers).forEach(([tier,count])=>{if(sourceQuestions.filter(q=>q.family===tier).length!==count)throw new Error(`Parts source tier mismatch: ${tier}`)});

  const practice=[];
  const p=(family,q,o,a,e)=>practice.push({id:`parts-practice-${String(practice.length+1).padStart(3,'0')}`,tag:'Course Practice',family,q,o,a,e:`${family}: ${e}`});
  // 80 deterministic, topic-specific Course Practice MCQs; source bank remains separate and tagged below.
  p('Foundation','A word is classified as a Part of Speech mainly by its—',['dictionary spelling','sentence function','number of letters','pronunciation only'],1,'Function in the sentence is the final test.');
  p('Foundation','Which sequence best represents the guide’s core method?',['Meaning → spelling → guess','Finite verb → subject/object → modifier → right side → function','Article → plural → tense → voice','Noun → adjective → adverb → verb'],1,'The five-step identification method starts with the finite verb.');
  p('Foundation','In “The child sings loudly,” loudly modifies the—',['child','sings','the','sentence subject only'],1,'A word modifying a verb is an adverb.');
  p('Foundation','In “a careful student,” careful is an adjective because it modifies a—',['verb','noun','preposition','clause'],1,'Careful describes student, a noun.');
  p('Foundation','Which word names an action or state?',['Noun','Verb','Adjective','Conjunction'],1,'Verb expresses action, being, possession, or process.');
  p('Foundation','Which group contains the traditional eight POS families?',['Noun, pronoun, adjective, verb, adverb, preposition, conjunction, interjection','Noun, article, tense, voice, mood, case, number, gender','Subject, object, clause, phrase, tense, voice, mood, aspect','Verb, modal, article, determiner, subject, object, phrase, clause'],0,'These are the eight traditional parts of speech used in the guide.');
  p('Foundation','In “She is happy,” happy is—',['a verb','an adjective complement','a preposition','an adverb of manner'],1,'After a linking verb, the complement is commonly an adjective.');
  p('Foundation','In “They arrived after,” after is closest to—',['a noun','an adverb','a preposition with object','an adjective'],1,'With no object after it, after works adverbially.');
  p('Foundation','Which question usually helps identify an adverb?',['Which one?','What kind?','How/when/where?','Whose?'],2,'Adverbs commonly answer how, when, where, how often, or how much.');
  p('Foundation','A connector that only joins two units is usually a—',['conjunction','noun','adjective','interjection'],0,'A conjunction joins words, phrases, or clauses.');

  p('Noun','Which is a proper noun?',['river','honesty','Bangladesh','committee'],2,'Bangladesh names a specific place.');
  p('Noun','Which is a collective noun?',['team','gold','kindness','Dhaka'],0,'Team names a group as one unit.');
  p('Noun','Which noun is normally uncountable?',['advice','chair','idea','student'],0,'Advice is used as an uncountable noun: a piece of advice.');
  p('Noun','The plural of “criterion” is—',['criterions','criteria','criteriones','criterias'],1,'Criterion is a Greek/Latin irregular noun: criteria.');
  p('Noun','In “The committee has decided,” committee is treated as—',['a material noun','a collective noun acting as one unit','an adjective','a pronoun'],1,'A collective noun may take singular agreement when acting as a unit.');
  p('Noun','In “Rina is a doctor,” doctor is a—',['subject noun','subject complement','preposition','adverb'],1,'Doctor renames the subject after the linking verb.');
  p('Noun','In “Rahim, my cousin, arrived,” my cousin is—',['an appositive','an adverbial clause','a modal','a conjunction'],0,'It renames Rahim.');
  p('Noun','In “Swimming is healthy,” Swimming is a—',['present participle adjective','gerund functioning as a noun','finite verb','preposition'],1,'The V-ing form is the subject and names an activity.');
  p('Noun','Which is a noun used attributively in “gold ring”?',['gold','ring','both are verbs','neither'],0,'Gold is a noun modifying another noun.');
  p('Noun','Which sentence uses “the poor” as a noun function?',['The poor man came.','The poor need support.','He spoke poorly.','Poorly written work failed.'],1,'The + adjective can represent a class of people.');

  p('Pronoun','In “This book is mine,” mine is a—',['possessive adjective','possessive pronoun','relative pronoun','demonstrative adjective'],1,'Mine stands alone without a following noun.');
  p('Pronoun','In “This is mine,” This is a—',['demonstrative pronoun','demonstrative adjective','relative adverb','article'],0,'This stands alone as the subject.');
  p('Pronoun','Choose the correct form: “Between you and ___.”',['I','me','my','myself'],1,'A preposition takes the objective form me.');
  p('Pronoun','In “The man whom I met,” whom is the—',['subject of met','object of met','possessive modifier','main verb'],1,'Test I met him: him maps to whom.');
  p('Pronoun','In “The boy who won smiled,” who is the—',['object of won','subject of won','possessive determiner','conjunction only'],1,'Who performs the action won.');
  p('Pronoun','“He hurt himself” uses himself as a—',['reflexive pronoun','emphatic pronoun','relative pronoun','reciprocal pronoun'],0,'The object refers back to the subject.');
  p('Pronoun','“He himself solved it” uses himself as—',['reflexive only','emphatic','relative','interrogative'],1,'The sentence remains grammatical without himself, so it adds emphasis.');
  p('Pronoun','Choose the traditional exam form: “Each of the students ___ ready.”',['are','is','were','have'],1,'Each is singular in the guide’s formal exam convention.');
  p('Pronoun','Choose the correct contraction: “___ raining.”',['Its','It’s','Its’','It'],1,'It’s means it is or it has.');
  p('Pronoun','Choose the correct possessive: “The cat washed ___ tail.”',['it’s','its','it','itself'],1,'Its is possessive and has no apostrophe.');

  p('Adjective','Choose the article: “He is ___ MBA student.”',['a','an','the only','no article'],1,'MBA begins with the vowel sound /em/.');
  p('Adjective','Choose the article: “She is ___ European.”',['an','a','the','no article'],1,'European begins with the consonant sound /juː/.');
  p('Adjective','The comparative of “bad” is—',['badder','worse','worst','more bad'],1,'Bad is irregular: bad, worse, worst.');
  p('Adjective','Which is correct?',['more easier','easier','most easier','easiest than'],1,'Do not use double comparative more + -er.');
  p('Adjective','Choose the correct phrase:',['few water','a few water','a little water','little books'],2,'Water is uncountable, so a little water is correct.');
  p('Adjective','“Few students passed” suggests—',['a large positive number','almost no students','all students','exactly two students'],1,'Few without a indicates a negative small number.');
  p('Adjective','In “a beautiful old stone house,” stone is closest to—',['a noun used attributively','an adverb','a finite verb','a conjunction'],0,'A noun can modify another noun attributively.');
  p('Adjective','OSASCOMP places “round” before “table” as a—',['quantity adjective','shape adjective','origin adjective','material adjective'],1,'Shape is the S in OSASCOMP.');
  p('Adjective','Choose the linking-verb complement: “The soup tastes ___.”',['sweetly','sweet','sweetness','to sweet'],1,'Taste is linking here, so it takes an adjective complement.');
  p('Adjective','In “He is old enough,” enough is—',['an adjective before a noun','an adverb after an adjective','a noun','a preposition'],1,'Enough modifies old and follows it.');

  p('Verb','Which is finite?',['to write','writing','writes','written'],2,'Writes carries tense/agreement.');
  p('Verb','Which is non-finite?',['went','goes','to go','has'],2,'To go does not carry tense.');
  p('Verb','In “He kicked the ball,” kicked is—',['intransitive','transitive','linking','modal'],1,'Kicked has the object the ball.');
  p('Verb','In “He slept,” slept is normally—',['ditransitive','transitive','intransitive','auxiliary'],2,'Sleep has no direct object in this sentence.');
  p('Verb','In “She gave me a book,” gave is—',['intransitive','ditransitive','linking','modal'],1,'It has an indirect and a direct object.');
  p('Verb','In “Reading is useful,” Reading is a—',['finite verb','gerund','present participle adjective','preposition'],1,'It functions as the subject noun.');
  p('Verb','In “a reading lamp,” reading is a—',['gerund subject','participle adjective','finite verb','modal'],1,'It modifies lamp.');
  p('Verb','Choose the correct form: “I saw him ___ the road.”',['to cross','cross','crossed','crossing only'],1,'See + object takes bare infinitive in the active structure.');
  p('Verb','Choose the correct passive causative: “He was made ___.”',['laugh','to laugh','laughing','laughed'],1,'Passive make requires to + base verb.');
  p('Verb','Which sentence uses a linking verb?',['He kicked the ball.','The idea sounds good.','She wrote a letter.','They built a bridge.'],1,'Sounds links idea to the adjective good.');

  p('Adverb','In “She sang beautifully,” beautifully is an adverb of—',['place','manner','time','degree'],1,'It answers how she sang.');
  p('Adverb','Which is an adverb of frequency?',['yesterday','often','inside','very'],1,'Often answers how often.');
  p('Adverb','Which word is an adjective despite -ly?',['slowly','friendly','quickly','nearly'],1,'Friendly commonly modifies a noun.');
  p('Adverb','“He hardly works” means—',['he works with great effort','he almost does not work','he works daily','he works nearby'],1,'Hardly is almost negative.');
  p('Adverb','Choose the correct phrase:',['enough old','old enough','very enough','enough quickly old'],1,'Enough follows an adjective or adverb when it modifies it.');
  p('Adverb','In “He drives fast,” fast modifies—',['he','drives','the car as a noun','nothing'],1,'Fast tells how he drives.');
  p('Adverb','In “a fast train,” fast is—',['an adjective','an adverb','a conjunction','a preposition'],0,'It describes the noun train.');
  p('Adverb','Choose the correct placement:',['He speaks English well always.','He always speaks English well.','He speaks always English well.','Always he speaks English well only.'],1,'Frequency adverbs commonly occur before the main verb.');
  p('Adverb','In “Fortunately, he escaped,” Fortunately is a—',['sentence adverb','preposition','adjective','interjection'],0,'It comments on the whole sentence.');
  p('Adverb','In “the day when he came,” when is a—',['relative adverb','preposition','interjection','article'],0,'It joins and modifies the antecedent day.');

  p('Preposition & Conjunction','In “The book is on the table,” on is a—',['conjunction','adverb','preposition','interjection'],2,'On has the object the table.');
  p('Preposition & Conjunction','In “He looked up,” up is closest to—',['preposition with an object','adverbial particle','adjective','conjunction'],1,'There is no object after up.');
  p('Preposition & Conjunction','In “after lunch,” after is a—',['preposition','conjunction','adverb only','interjection'],0,'Lunch is a noun phrase/object.');
  p('Preposition & Conjunction','In “after he left,” after is a—',['preposition','subordinating conjunction','adjective','pronoun'],1,'A full clause follows it.');
  p('Preposition & Conjunction','Choose the correct form: “She is fond of ___.”',['play','playing','to play only','played'],1,'The object of a preposition can be a gerund.');
  p('Preposition & Conjunction','Choose the correct sentence:',['We discussed about the plan.','We discussed the plan.','We discussed on the plan.','We discussed to the plan.'],1,'Discuss is transitive and normally takes no extra preposition.');
  p('Preposition & Conjunction','FANBOYS represents—',['subordinating conjunctions','coordinating conjunctions','relative pronouns','prepositions'],1,'For, and, nor, but, or, yet, so coordinate equal units.');
  p('Preposition & Conjunction','Choose the parallel pair:',['not only reading but also to write','not only reading but also writing','not only read but also writing books only','not only to read but also writing'],1,'Correlative conjunctions require parallel forms.');
  p('Preposition & Conjunction','Choose the correct expression:',['despite of rain','despite rain','although rain','in spite rain'],1,'Despite is followed directly by a noun phrase.');
  p('Preposition & Conjunction','Choose the correct expression:',['because rain','because of rain','because of it rained','because raining'],1,'Because of takes a noun phrase; because takes a clause.');

  p('Goldmine & Method','In “The earth is round,” round is—',['a noun','a verb','an adjective','an adverb'],2,'It describes earth after a linking verb.');
  p('Goldmine & Method','In “They sat round the fire,” round is—',['an adjective','an adverb','a preposition','a noun'],2,'Round has the object the fire.');
  p('Goldmine & Method','In “He came round,” round is—',['an adjective','an adverb','a preposition','a verb'],1,'It modifies came and has no object.');
  p('Goldmine & Method','In “She looks like her mother,” like is—',['a verb','an adjective','a preposition','an adverb'],2,'Like is followed by the object her mother.');
  p('Goldmine & Method','In “He has but one rupee,” but is—',['a preposition meaning except','a coordinating conjunction','an adverb meaning only','a relative pronoun'],2,'Here but means only.');
  p('Goldmine & Method','In “None but the brave,” but is—',['a preposition meaning except','an adverb meaning only','a conjunction of contrast','an adjective'],0,'But has the object the brave and means except.');
  p('Goldmine & Method','In “I know that he came,” that is—',['a demonstrative adjective','a subordinating conjunction','a relative pronoun','an adverb'],1,'It joins the noun clause and is not a member of that clause.');
  p('Goldmine & Method','In “He is used to working,” to is—',['an infinitive marker','a preposition','an adverb','a conjunction'],1,'Working is the object of prepositional to.');
  p('Goldmine & Method','In “go home,” home is—',['a noun object','an adverb of place','an adjective','a preposition'],1,'The guide treats home without to as an adverb here.');
  p('Goldmine & Method','Which is the best first step in a difficult POS question?',['Memorize the word’s dictionary class','Find the finite verb of the clause','Choose the longest option','Ignore the words on the right'],1,'The source 5-step algorithm begins with the finite verb.');

  const lessons=[
    {id:'pos-foundation',title:'01 · Big Picture: Form vs Function',icon:'🧭',slides:[
      {type:'hero',eyebrow:'FOUNDATION · EIGHT JOBS',title:'একটি sentence হলো কাজের জায়গা',lead:'Parts of Speech মুখস্থ label নয়; sentence-এ প্রতিটি word কোন job করছে সেটাই final identity।',visual:'pos-overview',rule:'Sentence → Words at work → Each word has a job → That job = Part of Speech',example:'The honest student answered quickly.\nhonest = describes a noun · answered = action/state · quickly = modifies the verb',note:'Function > form. একই spelling ভিন্ন sentence-এ ভিন্ন POS হতে পারে।'},
      {type:'table',eyebrow:'EIGHT WORKERS',title:'Traditional eight POS-এর worker map',visual:'pos-workers',rows:[['Noun','নাম দেয়','person · place · thing · idea'],['Pronoun','noun-এর বদলে বসে','he · they · mine'],['Adjective','noun/pronoun describe করে','honest · three · this'],['Verb','action/state/being দেখায়','write · is · have'],['Adverb','verb/adj/adv modify করে','quickly · very · here'],['Preposition','relation + object দেখায়','in · on · by'],['Conjunction','word/phrase/clause join করে','and · because · although'],['Interjection','হঠাৎ emotion প্রকাশ করে','alas · hurrah · oh']]},
      {type:'table',eyebrow:'FUNCTION MAP',title:'Form নয়—sentence-এ job ধরো',visual:'pos-form-function',rows:[['কাকে নাম দিচ্ছে?','Noun','Honesty matters.'],['কোন noun replace করছে?','Pronoun','He arrived.'],['কোন noun describe করছে?','Adjective','a careful student'],['কাজ/অবস্থা কী?','Verb','She reads.'],['কীভাবে/কখন/কোথায়?','Adverb','She reads quickly.'],['Object-এর relation?','Preposition','in Dhaka'],['শুধু join করছে?','Conjunction','because he came'],['Emotion burst?','Interjection','Alas!']]},
      {type:'examples',eyebrow:'SAME WORD · ROUND',title:'একটি word, পাঁচটি জীবন',visual:'pos-round-switcher',items:[['Adjective','The earth is round.','earth-কে describe করে'],['Adverb','He came round.','came-কে modify করে'],['Preposition','They sat round the fire.','the fire = object'],['Noun','We won the first round.','একটি event/name'],['Verb','The car rounded the corner.','action verb']]}
    ]},
    {id:'pos-noun',title:'02 · Noun: Types, Number, Case, Function',icon:'◉',slides:[
      {type:'hero',eyebrow:'NOUN · NAME ENGINE',title:'Noun শুধু person/place নয়',lead:'Noun-এর type, countability, number, gender, case ও sentence function—সবগুলোই admission প্রশ্নের target।',visual:'pos-noun-wheel',rule:'Noun = name word; type + countability + function আলাদা করে দেখো',example:'Honesty = abstract noun · army = collective noun · cotton = material noun · Dhaka = proper noun',note:'একই noun-এর type আর sentence function এক জিনিস নয়।'},
      {type:'table',eyebrow:'TRADITIONAL TYPES',title:'Five traditional noun classes',visual:'pos-noun-wheel',rows:[['Proper','নির্দিষ্ট নাম','Bangladesh, Karim'],['Common','সাধারণ শ্রেণি','city, student'],['Collective','group as one','team, army, committee'],['Material','substance','gold, cotton, water'],['Abstract','idea/quality/state','honesty, childhood, poverty'],['Extra lens','concrete বনাম abstract','stone / kindness']]},
      {type:'table',eyebrow:'COUNTABILITY GATE',title:'Countable বনাম uncountable',visual:'pos-countability',rows:[['Countable','a/an, plural, many/few','a chair · many chairs'],['Uncountable','much/little, no plural -s','much information'],['Measure phrase','piece / item / bit','a piece of advice'],['High-frequency list','advice, furniture, news, luggage','The news is true.'],['Trap','informations / furnitures','information / furniture']]},
      {type:'table',eyebrow:'CASE + FUNCTION',title:'Noun কোথায় কী কাজ করছে?',visual:'pos-case-function',rows:[['Nominative','subject','Karim went.'],['Objective','object','I saw Karim.'],['Possessive','ownership','Karim’s book'],['Vocative','calling','Karim, come here.'],['Subject complement','renames subject','He is a doctor.'],['Apposition','renames nearby noun','Rahim, my cousin, came.']]},
      {type:'compare',eyebrow:'NOUN EQUIVALENTS',title:'Noun-এর কাজ করা form',visual:'pos-noun-equivalents',columns:[{label:'GERUND',tone:'green',title:'Swimming is useful.',body:'V-ing কিন্তু subject noun-এর কাজ করছে।'},{label:'INFINITIVE',tone:'blue',title:'To err is human.',body:'to + V1 subject/object হিসেবে এসেছে।'},{label:'THE + ADJ',tone:'purple',title:'The poor need help.',body:'পুরো class-কে noun function দিচ্ছে।'}],note:'Form দেখে নয়—sentence-এ noun-এর slot দখল করেছে কি না দেখো।'}
    ]},
    {id:'pos-pronoun',title:'03 · Pronoun: Case, Agreement, Who/Whom',icon:'◌',slides:[
      {type:'hero',eyebrow:'PRONOUN · REPLACE + JOIN',title:'Pronoun noun-কে replace করে—কিন্তু case ভুললে trap',lead:'Personal, possessive, reflexive, relative, demonstrative, indefinite ও reciprocal—প্রতিটির আলাদা job আছে।',visual:'pos-pronoun-atlas',rule:'Pronoun = noun-এর বদলে; relative pronoun = joiner + clause member',example:'Karim arrived. He smiled. · The man whom I met was a poet.',note:'Pronoun question-এ antecedent, case এবং stand-alone/modifier test চালাও।'},
      {type:'table',eyebrow:'CASE GRID',title:'Personal pronoun-এর চার lens',visual:'pos-case-function',rows:[['Subject','I, he, she, we, they','They came.'],['Object','me, him, her, us, them','I saw him.'],['Possessive adjective','my, his, her, our, their','my book'],['Possessive pronoun','mine, his, hers, ours, theirs','The book is mine.'],['Reflexive','myself, himself, themselves','He hurt himself.']]},
      {type:'table',eyebrow:'WHO / WHOM TREE',title:'Person, case ও antecedent মিলাও',visual:'pos-antecedent-tree',rows:[['Person + subject','who','The man who came…'],['Person + object','whom','The man whom I met…'],['Possession','whose','The girl whose book…'],['Thing/choice','which','The book which I bought…'],['Person/thing + neutral','that','The book that I bought…'],['No antecedent noun','what','I know what he wants.']]},
      {type:'compare',eyebrow:'REFLEXIVE SPLIT',title:'Reflexive বনাম Emphatic',visual:'pos-pronoun-atlas',columns:[{label:'REFLEXIVE',tone:'green',title:'He hurt himself.',body:'Object = subject; নিজেকেই আঘাত করেছে।'},{label:'EMPHATIC',tone:'blue',title:'He himself opened it.',body:'বাদ দিলেও sentence ঠিক থাকে; emphasis যোগ করে।'}],note:'Myself/I myself subject হিসেবে একা বসবে না: Myself went—ভুল।'},
      {type:'table',eyebrow:'AGREEMENT TRAPS',title:'Head word দেখে verb মিলাও',visual:'pos-agreement',rows:[['each / every','singular','Each of them is ready.'],['either / neither','singular','Neither is ready.'],['everyone / everybody','singular','Everyone has arrived.'],['one','one’s in strict chain','One should do one’s duty.'],['between / let','objective case','between you and me · let him go']]}
    ]},
    {id:'pos-adjective',title:'04 · Adjective: Articles, Degrees, Order',icon:'A',slides:[
      {type:'hero',eyebrow:'ADJECTIVE · DESCRIBE',title:'Noun-এর চারপাশে adjective-এর signal',lead:'Attributive, predicative, article, degree, quantity ও order—সবকিছু noun-modifier lens-এ ধরো।',visual:'pos-article-sound',rule:'Noun/pronoun describe করলে adjective; a/an sound দিয়ে, letter দিয়ে নয়',example:'a university · an hour · The soup tastes sweet.',note:'Linking verb-এর পরে adjective; ordinary verb-এর manner বোঝালে adverb হতে পারে।'},
      {type:'table',eyebrow:'ARTICLE SOUND GATE',title:'a / an: vowel letter নয়, vowel sound',visual:'pos-article-sound',rows:[['Consonant sound','a','a university · a European'],['Vowel sound','an','an hour · an honest man'],['Initialism vowel sound','an','an MBA · an M.A.'],['Attributive position','before noun','a careful student'],['Predicative position','after linking verb','The student is careful.']]},
      {type:'table',eyebrow:'DEGREE IN POS',title:'Positive → Comparative → Superlative',visual:'pos-degree-rail',rows:[['Positive','base quality','bright / good'],['Comparative','two or one vs another','brighter than / better than'],['Superlative','group maximum','the brightest / the best'],['Irregular','good → better → best','bad → worse → worst'],['Trap','double comparative নয়','more taller ✗ → taller ✓']]},
      {type:'table',eyebrow:'FEW / LITTLE + OSASCOMP',title:'Quantity ও adjective order',visual:'pos-osascomp',rows:[['few','almost no countable plural','Few students passed.'],['a few','some countable plural','A few students passed.'],['little','almost no uncountable','little money'],['a little','some uncountable','a little money'],['OSASCOMP','Opinion Size Age Shape Colour Origin Material Purpose','a beautiful old round red…']]},
      {type:'compare',eyebrow:'LINKING VERB TEST',title:'Adjective না Adverb?',visual:'pos-linking',columns:[{label:'LINKING + ADJ',tone:'green',title:'The soup tastes sweet.',body:'taste এখানে subject-এর quality link করছে।'},{label:'ACTION + ADV',tone:'blue',title:'She tasted the soup carefully.',body:'carefully tells how she tasted it।'}],note:'Verb-কে is দিয়ে replace করা যায়? তাহলে complement adjective হওয়ার সম্ভাবনা বেশি।'}
    ]},
    {id:'pos-verb',title:'05 · Verb: Finite, Linking, Verbals',icon:'V',slides:[
      {type:'hero',eyebrow:'VERB · ENGINE + FORK',title:'Finite verb ছাড়া complete clause হয় না',lead:'Main/auxiliary, transitive/intransitive, finite/non-finite, linking এবং verbals—verb chapter-এর admission core।',visual:'pos-finite-fork',rule:'Finite = tense + subject agreement; non-finite = tense-bearing নয়',example:'He goes / They go / He went · to go · going · gone',note:'একই V-ing subject, modifier বা continuous chain—তিন job করতে পারে।'},
      {type:'table',eyebrow:'MAIN / AUX / TRANSITIVITY',title:'Verb-এর job ও object test',visual:'pos-transitivity',rows:[['Main / principal','নিজেই মূল অর্থ দেয়','He plays cricket.'],['Auxiliary primary','tense/voice/question/negative','She has gone.'],['Modal','ability/permission/obligation','You must study.'],['Transitive','object নেয়','He kicked the ball.'],['Intransitive','object নেয় না','He slept.'],['Ditransitive','দুটি object','She gave me a book.']]},
      {type:'compare',eyebrow:'V-ING TRI-SPLIT',title:'Gerund · Participle · Continuous',visual:'pos-v-ing-split',columns:[{label:'GERUND',tone:'green',title:'Swimming is fun.',body:'V-ing = noun job; activity-এর নাম।'},{label:'PARTICIPLE',tone:'blue',title:'a swimming bird',body:'V-ing noun-কে describe করছে।'},{label:'CONTINUOUS',tone:'purple',title:'The bird is swimming.',body:'be + V-ing = finite verb chain-এর অংশ।'}],note:'Job, not ending: V-ing দেখেই gerund/participle বলবে না।'},
      {type:'table',eyebrow:'INFINITIVE + LINKING',title:'to + V1 ও complement',visual:'pos-linking',rows:[['Noun use','To forgive is divine.','subject/object'],['Adjective use','a house to let','noun modify'],['Adverb use','He came to see me.','purpose'],['Bare infinitive','Let him go.','modal/make/let/see-এর পরে active'],['Linking complement','He became angry.','noun/adjective, not ordinary adverb']]},
      {type:'table',eyebrow:'CAUSATIVE PATTERNS',title:'make / let / have / get / help',visual:'pos-causative',rows:[['make + object + bare inf.','He made me wait.','force'],['let + object + bare inf.','Let him go.','permission'],['have + object + V3','I had my hair cut.','arrange/causative'],['get + object + to-inf.','Get him to sign.','persuade'],['help + (to) inf.','He helped me (to) lift.','to optional']]}
    ]},
    {id:'pos-adverb',title:'06 · Adverb: Types, Hard vs Hardly',icon:'↗',slides:[
      {type:'hero',eyebrow:'ADVERB · MODIFY',title:'Adverb-এর প্রশ্ন: How? When? Where?',lead:'Adverb verb, adjective, অন্য adverb অথবা পুরো sentence modify করতে পারে।',visual:'pos-adverb-radar',rule:'Verb/Adjective/Adverb modify করলে adverb; -ly থাকলেই adverb নয়',example:'She sang very beautifully yesterday here.\nbeautifully = manner · yesterday = time · here = place · very = degree',note:'Target word খুঁজে modify test চালাও।'},
      {type:'table',eyebrow:'TYPE RADAR + -LY GATE',title:'Adverb type ও formation',visual:'pos-ly-gate',rows:[['Manner','How?','quickly, well, hard'],['Place','Where?','here, there, inside'],['Time','When?','now, yesterday, soon'],['Frequency','How often?','always, often, never'],['Degree','How much?','very, too, enough'],['-ly exception','adjective','friendly, lovely, likely, deadly']]},
      {type:'table',eyebrow:'LOOK-ALIKE PAIRS',title:'Meaning বদলে যায়—form নয়',visual:'pos-pair-traps',rows:[['hard','with effort','hardly = almost not'],['late','not early','lately = recently'],['near','close','nearly = almost'],['high','at a high level','highly = very'],['most','greatest amount','mostly = mainly'],['good','adjective','well = adverb/healthy adjective']]},
      {type:'table',eyebrow:'POSITION LANE',title:'Adverb কোথায় বসে?',visual:'pos-position-lane',rows:[['Frequency','main verb-এর আগে, be-এর পরে','He always comes.'],['Manner','verb/object-এর পরে','She spoke clearly.'],['Place','verb/object-এর পরে; time-এর আগে','He sat here yesterday.'],['Degree','যে word modify করে তার আগে','very good · almost finished'],['Enough','adj/adv-এর পরে','old enough · quickly enough']]},
      {type:'compare',eyebrow:'TOO / ENOUGH / VERY',title:'Intensity বনাম result',visual:'pos-adverb-radar',columns:[{label:'TOO',tone:'purple',title:'too weak to walk',body:'অতিরিক্ত; negative result-এর signal।'},{label:'ENOUGH',tone:'green',title:'strong enough to lift',body:'যথেষ্ট; adj/adv-এর পরে বসে।'},{label:'VERY',tone:'blue',title:'very weak',body:'শুধু degree বাড়ায়; নিজে result clause দেয় না।'}],note:'ordinary adjective-এর আগে too much weak / very much tired—ভুল।'}
    ]},
    {id:'pos-preposition',title:'07 · Preposition: Object, Fixed Combos',icon:'∕',slides:[
      {type:'hero',eyebrow:'PREPOSITION · RELATION + OBJECT',title:'Object আছে কি না—এটাই gate',lead:'Preposition noun, pronoun, gerund বা noun-like group-এর সঙ্গে relation দেখায় এবং সাধারণত object নেয়।',visual:'pos-object-gate',rule:'Preposition + object → prepositional phrase',example:'in Dhaka · of gold · by working hard · on the table',note:'Object না থাকলে একই word adverbial particle হতে পারে।'},
      {type:'table',eyebrow:'KINDS + RELATIONS',title:'Preposition-এর family ও use',visual:'pos-relation-map',rows:[['Simple','at, in, on, to, from, by','at 5 pm · in Dhaka'],['Compound','into, upon, within, without','within the room'],['Phrasal','because of, in spite of, according to','because of rain'],['Time','at point, on day, in period','at noon · on Friday · in June'],['Place','at point, on surface, in area','at door · on wall · in room'],['Agent/tool','by person, with instrument','by Shakespeare · with a knife']]},
      {type:'compare',eyebrow:'OBJECT TEST',title:'Preposition না Adverb?',visual:'pos-object-gate',columns:[{label:'OBJECT আছে',tone:'blue',title:'Climb up the tree.',body:'up + the tree → preposition।'},{label:'OBJECT নেই',tone:'green',title:'He looked up.',body:'up-এর পরে object নেই → adverbial particle।'}],note:'Phrasal verb-এর particle-কে exam option অনুযায়ী adverbial ধরো।'},
      {type:'table',eyebrow:'CLAUSE TEST',title:'Preposition বনাম Conjunction',visual:'pos-prep-conj',rows:[['after + noun','after the war','preposition'],['after + clause','after he left','conjunction'],['since + noun','since Monday','preposition'],['since + clause','since he left','conjunction'],['since + nothing','I have not seen him since.','adverb'],['as + role noun','as a teacher','preposition-like role marker']]},
      {type:'table',eyebrow:'FIXED COMBO + ERROR CLINIC',title:'Fixed preposition ও extra-preposition traps',visual:'pos-fixed-combos',rows:[['afraid / proud / fond','of','fond of music'],['depend / rely / congratulate','on','depend on him'],['superior / inferior / prefer','to','prefer tea to coffee'],['discuss / enter / resemble','no extra prep','discuss the plan'],['despite','no of','despite rain'],['look forward to / object to','+ gerund','to seeing / to going']]}
    ]},
    {id:'pos-conjunction',title:'08 · Conjunction: FANBOYS to Correlative',icon:'&',slides:[
      {type:'hero',eyebrow:'CONJUNCTION · JOINER FAMILIES',title:'Join করছে, নাকি clause-এর member?',lead:'Coordinating, subordinating ও correlative—connector-এর family এবং right-side structure মিলিয়ে answer ধরো।',visual:'pos-conj-families',rule:'Conjunction joins; relative pronoun joins + clause-এর subject/object হতে পারে',example:'and/but/or = coordinate · because/if/although = subordinate · either…or = correlative',note:'Connector দেখেই final label নয়; clause-এর ভেতরে word-এর job দেখো।'},
      {type:'table',eyebrow:'FANBOYS RAIL',title:'Seven coordinating conjunction',visual:'pos-fanboys',rows:[['F','for','reason/support'],['A','and','addition'],['N','nor','negative alternative'],['B','but','contrast'],['O','or','alternative'],['Y','yet','contrast'],['S','so','result']]},
      {type:'table',eyebrow:'SUBORDINATING RADAR',title:'Connector → meaning map',visual:'pos-connector-radar',rows:[['Time','when, while, before, after','When he arrived…'],['Reason','because, since, as','because it rained'],['Condition','if, unless, provided','If you work…'],['Concession','although, though','Although he is poor…'],['Purpose','so that, in order that','so that he can pass'],['Result','so…that, such…that','so cold that…']]},
      {type:'compare',eyebrow:'CORRELATIVE TRAP',title:'Parallelism না হলে sentence ভাঙে',visual:'pos-parallelism',columns:[{label:'CORRECT',tone:'green',title:'not only reading but also writing',body:'দুই পাশে একই V-ing form।'},{label:'WRONG',tone:'purple',title:'not only reading but also to write',body:'দুই পাশে form mismatch।'}],note:'both…and / either…or / neither…nor / not only…but also—parallel form রাখো।'},
      {type:'table',eyebrow:'MULTI-ROLE CONNECTORS',title:'that / as / because-এর function',visual:'pos-conj-families',rows:[['that + noun','That book','demonstrative adjective'],['that + clause','I know that he came','subordinating conjunction'],['that inside clause','the book that I bought','relative pronoun'],['as + role noun','as a teacher','preposition-like role'],['as + clause','as he was tired','conjunction'],['because of + noun / because + clause','because of rain / because it rained','prep / conjunction']]}
    ]},
    {id:'pos-interjection',title:'09 · Interjection: Small but Tested',icon:'!',slides:[
      {type:'hero',eyebrow:'INTERJECTION · EMOTION BURST',title:'Structure-এর বাইরে emotion signal',lead:'Interjection sudden feeling প্রকাশ করে; sentence-এর grammar structure-এর core member না-ও হতে পারে।',visual:'pos-interjection-map',rule:'Emotion burst → interjection',example:'Alas! He is no more. · Hurrah! We won. · Oh! I forgot.',note:'What! surprise হলে interjection; What book? হলে interrogative adjective।'},
      {type:'table',eyebrow:'MEANING MAP',title:'Emotion → common interjection',visual:'pos-interjection-map',rows:[['Sorrow','alas','Alas! He is gone.'],['Joy','hurrah','Hurrah! We won.'],['Surprise','oh / what','Oh! What a surprise!'],['Approval','bravo','Bravo! Well done.'],['Attention','hey','Hey! Listen.']]},
      {type:'compare',eyebrow:'INTERJECTION VS OTHER POS',title:'একই word, ভিন্ন job',visual:'pos-interjection-map',columns:[{label:'INTERJECTION',tone:'purple',title:'What! You failed?',body:'What = surprise; real question নয়।'},{label:'ADJECTIVE',tone:'blue',title:'What book is this?',body:'What modifies book।'},{label:'PRONOUN',tone:'green',title:'What happened?',body:'What একা subject/object slot-এ।'}],note:'Punctuation clue সাহায্য করে, কিন্তু function ও structure final।'},
      {type:'table',eyebrow:'QUICK DRILL',title:'ছোট chapter-এর শেষ check',visual:'pos-interjection-map',rows:[['Alas!','sorrow','interjection'],['He works well.','manner','adverb'],['Well, listen.','discourse/emotion opener','interjection-like'],['Why did he leave?','question word','interrogative adverb'],['What!','surprise','interjection']]}
    ]},
    {id:'pos-goldmine',title:'10 · Same Word, Different POS: Goldmine',icon:'★',slides:[
      {type:'hero',eyebrow:'GOLDMINE · FUNCTION SWITCHER',title:'একই spelling, sentence বদলালে POS বদলায়',lead:'Admission-এর সবচেয়ে repeated pattern: word-এর meaning নয়, চারপাশের function দেখো।',visual:'pos-goldmine',rule:'Same word ≠ same POS; right-side + modify + object test একসাথে চালাও',example:'round · like · since · but · as · that · enough · home · past · very',note:'প্রতিটি star word-এর অন্তত তিনটি sentence লিখে function compare করো।'},
      {type:'examples',eyebrow:'ROUND · FIVE POS',title:'round-এর পাঁচটি job',visual:'pos-round-switcher',items:[['Adjective','The earth is round.','earth-কে describe করে'],['Adverb','He came round.','came-কে modify করে'],['Preposition','They sat round the fire.','object = fire'],['Noun','We won the first round.','name of a stage'],['Verb','The car rounded the corner.','action + -ed']]},
      {type:'table',eyebrow:'LIKE / AFTER / SINCE',title:'Right-side fork দিয়ে word ধরো',visual:'pos-goldmine',rows:[['like + object','looks like her mother','preposition'],['like as action','I like coffee.','verb'],['after + noun','after lunch','preposition'],['after + clause','after he came','conjunction'],['after alone','I came after.','adverb'],['since alone','I have not seen him since.','adverb']]},
      {type:'table',eyebrow:'BUT / AS / THAT',title:'Multi-role word atlas',visual:'pos-goldmine',rows:[['but = contrast','poor but honest','conjunction'],['but = except','none but the brave','preposition'],['but = only','but one rupee','adverb'],['as = role','as a teacher','preposition-like'],['as = clause','as he was tired','conjunction'],['that = book/clause/relative','that book / that he came / book that I bought','adj / conj / relative pronoun']]},
      {type:'table',eyebrow:'MORE STAR WORDS',title:'Position ও object দিয়ে switch করো',visual:'pos-goldmine',rows:[['enough','enough food / old enough / I have enough','adj / adv / noun'],['home','go home / a happy home / home truth','adv / noun / adj'],['past','walked past the gate / the past / walked past','prep / noun / adv'],['very','very good / the very man','adv / adj'],['fast / hard / well','fast train / work hard / is well','adj / adv / adj']]}
    ]},
    {id:'pos-method',title:'11 · Identification Method & Confusing Pairs',icon:'5',slides:[
      {type:'hero',eyebrow:'METHOD · FIVE STEPS',title:'Difficult POS question-এ algorithm চালাও',lead:'Guess নয়—finite verb, subject/object, modifier, right-side এবং function ধারাবাহিকভাবে check করো।',visual:'pos-algorithm',rule:'1 Finite verb → 2 Subject/Object → 3 Modify/Join → 4 Right side → 5 Function label',example:'The man who came is my uncle.\nwho = subject of came + antecedent man → relative pronoun',note:'Dictionary class নয়; sentence evidence দিয়ে answer justify করো।'},
      {type:'table',eyebrow:'SIGNAL CHEATSHEET',title:'Surface clue → hypothesis → confirmation',visual:'pos-signal-cheatsheet',rows:[['a/an/the/my/this + word + noun','adjective হতে পারে','word কি noun describe করছে?'],['word + noun phrase','preposition হতে পারে','noun কি object?'],['word + subject + verb','conjunction/relative','word কি clause-এর member?'],['শেষে, object নেই','adverb/particle','verb/meaning modify করছে?'],['be/seem/look/feel + word','adjective/noun complement','is দিয়ে replace হয়?'],['V-ing subject/object','gerund','the act of test'],['to + V1','infinitive','to কি noun/verb-এর আগে?']]},
      {type:'table',eyebrow:'FOUR-WAY RIGHT-SIDE FORK',title:'Preposition, conjunction, relative—দূরত্ব',visual:'pos-confusing-pairs',rows:[['Noun/pronoun/gerund only','relation দেখায়','Preposition'],['Full clause; word clause-এর member নয়','শুধু join করে','Conjunction'],['Clause-এর subject/object/possessive','antecedent replace করে','Relative pronoun'],['Time/place/reason clause; in/on which-এর কাজ','join + modify','Relative adverb']]},
      {type:'table',eyebrow:'V-ING / TO FORK',title:'Gerund, participle, infinitive, finite',visual:'pos-finite-fork',rows:[['He writes.','tense + agreement','Finite verb'],['Writing is fun.','noun job','Gerund'],['a writing desk / is writing','modifier or continuous','Participle'],['to write','noun/adverb/purpose','Infinitive'],['used to working','to + gerund','to = preposition']]},
      {type:'table',eyebrow:'CONFUSING PAIRS',title:'শেষ মুহূর্তের compare cards',visual:'pos-confusing-pairs',rows:[['because + clause / because of + noun','reason','conjunction / preposition'],['although + clause / despite + noun','concession','conjunction / preposition'],['during + noun / while + clause','time','preposition / conjunction'],['like + noun / as + clause or role','similarity / role','preposition / conjunction-like'],['no sooner…than / hardly…when','inversion pair','fixed structure']]}
    ]},
    {id:'pos-strategy',title:'12 · Admission Strategy & Shortcuts',icon:'⏱',slides:[
      {type:'hero',eyebrow:'STRATEGY · EXAM HALL',title:'৩০ সেকেন্ডে POS question filter',lead:'Stem-এর pattern ধরো, তারপর matching test চালাও—সব option একসঙ্গে বিশ্লেষণ করার দরকার নেই।',visual:'pos-exam-strategy',rule:'Question pattern → matching solver → eliminate → confirm meaning',example:'“The underlined word is a/an—” → 5-step algorithm\n“since” after noun/clause/zero → right-side test',note:'Traditional BD admission default: function > form > fancy modern label।'},
      {type:'table',eyebrow:'QUESTION PATTERNS',title:'Examiner কীভাবে POS জিজ্ঞেস করে?',visual:'pos-exam-strategy',rows:[['Direct rule','definition/type','A collective noun is—'],['Identify POS','sentence function','The underlined word is a/an—'],['Same-word set','form ≠ function','round as preposition কোথায়?'],['Error detection','case/adj-adv/extra prep','Identify incorrect sentence'],['Fill blank','article/prep/conj pair','He is ___ honest man.'],['Exception/trap','uncountable/Latin/hardly','Which is uncountable?']]},
      {type:'table',eyebrow:'30-SECOND CHECKLIST',title:'Hall-এর দ্রুত routine',visual:'pos-checklist',rows:[['১','Underline-এর ডানে 3–4 word পড়ো','right-side test'],['২','Finite verb খুঁজো','clause আছে?'],['৩','Object আছে?','preposition?'],['৪','Noun modify? Verb modify?','adj / adv'],['৫','V-ing / to form','job দেখো'],['৬','Meaning ও option label মিলাও','final confirmation']]},
      {type:'examples',eyebrow:'HIGH-FREQUENCY DRILL',title:'এই words বারবার আসে',visual:'pos-goldmine',items:[['Round / like','earth is round · looks like him','adjective/adverb/preposition/verb'],['Since / after','since Monday · since he left · since','prep/conj/adv'],['But / as / that','none but · as a teacher · that book','multi-role traps'],['Enough / still / well','enough food · still waiting · is well','position + function'],['Home / past / very','go home · walked past · very man','right-side lens']]},
      {type:'table',eyebrow:'MINI MOCK ROUTE',title:'Answer করার order',visual:'pos-checklist',rows:[['Easy direct rule','আগে করো','confidence build'],['Function question','modify/object test','evidence-based'],['Same word','right-side test','context switch'],['Error detection','known blacklist','discuss about, despite of'],['Advanced trap','শেষে রাখো','hardly, but, since, enough']]}
    ]},
    {id:'pos-traps',title:'13 · Admission Trap Database',icon:'⚠',slides:[
      {type:'hero',eyebrow:'TRAP DATABASE · 10 DEADLY LINES',title:'Examiner যে ভুলগুলোতে থামায়',lead:'প্রতিটি trap-এ আগে students কী ভাবে, তারপর actual rule, exam ask ও memory trick দেখো।',visual:'pos-trap-cards',rule:'Misconception → Actually → Examiner ask → Memory trick',example:'the rich → noun function · friendly → adjective · feel bad → adjective complement',note:'Trap card-এর চার ধাপ একসঙ্গে পড়লে correction দীর্ঘদিন মনে থাকে।'},
      {type:'table',eyebrow:'TRAPS 11–15',title:'Rich, friendly, linking, case, right-side',visual:'pos-trap-cards',rows:[['The rich','rich adjective নয়; class noun','the rich are…'],['friendly','সব -ly adverb নয়','in a friendly way'],['feel/smell/look','linking + adjective','feel bad · smell sweet'],['between/let','objective case','between you and me'],['since/after/before','clause/noun/zero test','since he left / since Monday / since']]},
      {type:'table',eyebrow:'TRAPS 16–20',title:'Enough, V-ing, Latin comparison, agreement, number',visual:'pos-trap-cards',rows:[['enough','adj before noun; adv after adj','enough food / old enough'],['V-ing','job decides label','gerund / participle / continuous'],['superior/prefer/despite','to / to / no of','prefer tea to coffee'],['each/either/neither','singular head','Each is ready.'],['news/scenery/scissors','singular / uncountable / plural','The news is; scissors are']]},
      {type:'compare',eyebrow:'WRONG → RIGHT',title:'Error clinic: first correction set',visual:'pos-trap-cards',columns:[{label:'WRONG',tone:'purple',title:'He spoke to me friendly.',body:'-ly দেখে adverb ধরে ফেলেছে।'},{label:'RIGHT',tone:'green',title:'He spoke to me in a friendly way.',body:'friendly adjective; manner phrase ব্যবহার।'}],note:'Error spotting-এ option-এর grammatical role নয়, sentence-এর actual function দেখো।'},
      {type:'table',eyebrow:'TRAP CHECKLIST',title:'শেষে যেগুলো scan করবে',visual:'pos-trap-cards',rows:[['Linking + adj','tastes sweet, feel bad','adverb নয়'],['Extra prep','discuss the plan, enter the room','about/into বাদ'],['Pronoun case','between me, whom I met','I/him test'],['Uncountable','advice, information, furniture, news','piece/much'],['Fixed pair','no sooner…than, hardly…when','pair ভাঙবে না']]}
    ]},
    {id:'pos-microrules',title:'14 · 40 Micro-Rules: Smart Revision',icon:'40',slides:[
      {type:'hero',eyebrow:'MICRO-RULES · SCAN BOARD',title:'প্রতি rule এক বা দুই লাইনে lock করো',lead:'এই unit পুরো guide-এর repeated defaults-কে দ্রুত scan করার জন্য—long explanation নয়, high-yield sparks।',visual:'pos-micro-rules',rule:'Read → recall → tiny example → move on',example:'Object আছে? Preposition. Clause আছে? Conjunction. Nothing? প্রায়ই Adverb.',note:'Rule cards-এ প্রথমে function, তারপর exception, তারপর example মনে রাখো।'},
      {type:'table',eyebrow:'RULES 01–10',title:'Foundation + case + article',visual:'pos-micro-rules',rows:[['01','POS = function','dictionary class নয়'],['02','same spelling','context বদলালে POS বদলায়'],['03','name/replace/describe','noun/pronoun/adjective'],['04','action/state','verb'],['05','relation + object','preposition'],['06','object test','object থাকলে prep'],['07','clause test','S+V থাকলে conjunction'],['08','article','traditional exam-এ adjective'],['09','a/an','sound দিয়ে'],['10','my বনাম mine','noun-এর আগে / একা']]},
      {type:'table',eyebrow:'RULES 11–20',title:'Pronoun + linking + adverb',visual:'pos-micro-rules',rows:[['11','its বনাম it’s','possessive / it is'],['12','who বনাম whom','he / him'],['13','reflexive','subject একা নয়'],['14','between/let','me, not I'],['15','each/every','singular verb'],['16','one','one’s'],['17','few/little','negative; a few/a little = some'],['18','linking + adj','taste sweet'],['19','good / well','adj / adv'],['20','hard / hardly','effort / almost not']]},
      {type:'table',eyebrow:'RULES 21–30',title:'Enough + verbal + preposition',visual:'pos-micro-rules',rows:[['21','-ly exceptions','friendly, lovely…'],['22','enough','before noun; after adj'],['23','too / very','result vs degree'],['24','gerund','V-ing as noun'],['25','infinitive','to + V1; noun/adj/adv'],['26','used to','V1 vs be used to + gerund'],['27','look forward to','to + gerund'],['28','no extra prep','discuss/enter/resemble'],['29','despite/because','noun vs clause'],['30','superior/prefer','to, not than']]},
      {type:'table',eyebrow:'RULES 31–40',title:'Conjunction + star words + noun traps',visual:'pos-micro-rules',rows:[['31','FANBOYS','coordinating'],['32','correlative','parallel form'],['33','no sooner/hardly','than/when'],['34','that','five possible roles'],['35','but','conj/prep/adv'],['36','as','conj/prep/adv'],['37','star words','round, like, still, fast…'],['38','the + adjective','noun function'],['39','uncountable list','advice, information…'],['40','go home','home = adverb']]}
    ]},
    {id:'pos-revision',title:'15 · Rapid Revision & Master Memory Map',icon:'⌁',slides:[
      {type:'hero',eyebrow:'5-MINUTE REVISION',title:'শেষ মুহূর্তের four-board scan',lead:'৮ POS, golden rule, right-side test ও modify test—এই চারটি board দিয়ে পুরো chapter recall করো।',visual:'pos-rapid-revision',rule:'Function not form · same word many lives · noun/phrase/clause/zero test · modify test',example:'Noun/Pronoun/Adjective/Verb · Adverb/Preposition/Conjunction/Interjection',note:'Revision-এ নতুন rule যোগ করো না; known signal দিয়ে answer compress করো।'},
      {type:'compare',eyebrow:'FOUR REVISION BOARDS',title:'চারটি fastest lens',visual:'pos-rapid-revision',columns:[{label:'8 POS',tone:'blue',title:'Eight jobs',body:'name · replace · describe · act/state · modify · relate · join · emotion'},{label:'GOLDEN',tone:'green',title:'Function, not form',body:'same word sentence বদলালে job বদলায়'},{label:'RIGHT SIDE',tone:'purple',title:'Noun / clause / zero',body:'prep / conj / adverb fork'},{label:'MODIFY',tone:'gold',title:'কাকে describe?',body:'noun → adjective; verb/adj/adv → adverb'}],note:'এই চার lens-এর পর only exception list দেখো।'},
      {type:'table',eyebrow:'CORE + EXCEPTIONS',title:'Must-remember review board',visual:'pos-rapid-revision',rows:[['Core','linking + adjective; gerund noun; who/whom he/him','basic rules'],['Exceptions','friendly; hardly; home; but; that; as','multi-role traps'],['Signals','Which/what kind/how many vs how/when/where','adj vs adv'],['Fixed pairs','despite + noun; although + clause; prefer to','structure lock'],['Uncountables','advice, information, furniture, news, scenery','number/agreement']]},
      {type:'table',eyebrow:'MASTER MEMORY MAP',title:'Eight jobs থেকে cross-cutting skills',visual:'pos-memory-map',rows:[['8 jobs','Noun → Pronoun → Adjective → Verb','Adverb → Preposition → Conjunction → Interjection'],['Types & rules','প্রতিটি POS-এর family','case/degree/finite/object/function'],['Exceptions','same word, confusing pairs','hardly, enough, to, but, as, that'],['5-step ID','verb → S/O → modify → right side → label','exam solver'],['Assessment','traps → revision → source MCQ','practice loop']]},
      {type:'table',eyebrow:'COMPLETE TOPIC MAP',title:'Final recall in one board',visual:'pos-topic-map',rows:[['Noun','Proper/Common/Collective/Material/Abstract','Count/Uncount · Case · Function'],['Pronoun','Personal/Possessive/Reflexive/Relative','Agreement · Who/Whom'],['Adjective','Quality/Quantity/Articles/Degrees','OSASCOMP · Few/Little'],['Verb','Main/Aux · Finite · T/I · Linking','Gerund · Infinitive · Participle'],['Adverb/Prep','Types · hard/hardly · enough','Object · Time/Place · Fixed combos'],['Conj/Interj','Coordinating/Subordinating/Correlative','Emotion burst'],['Cross-cutting','Same word · confusing pairs · traps','5-step ID · admission MCQ']]}
    ]},
    {id:'pos-source-lab',title:'16 · Source MCQ Lab & Complete Topic Map',icon:'Q',slides:[
      {type:'hero',eyebrow:'SOURCE MCQ LAB · 80 ITEMS',title:'PDF-এর source bank দিয়ে নিজেকে পরীক্ষা করো',lead:'এই course-এর ৮০টি source MCQ-তে PDF-এর original difficulty tier, answer key এবং explanation রাখা হয়েছে।',visual:'pos-source-bank',rule:'Answer first → read explanation → revisit the matching visual lesson',example:'BASIC 16 · INTERMEDIATE 24 · ADMISSION 28 · TRAP / ADVANCED 12',note:'Source question-এর পাশে Course Practice আলাদা tag-এ থাকবে; global Question Bank data বদলাবে না।'},
      {type:'table',eyebrow:'SOURCE TIERS',title:'Question bank route',visual:'pos-source-bank',rows:[['BASIC','Q01–Q16','definition/type/function'],['INTERMEDIATE','Q17–Q40','case/countability/verbals/structure'],['ADMISSION','Q41–Q68','same-word POS and function traps'],['TRAP / ADVANCED','Q69–Q80','hardly, enough, to, but, after, inversion'],['Course Practice','80 additional','lesson-specific reinforcement']]},
      {type:'compare',eyebrow:'CARD HIERARCHY',title:'Source বনাম Course Practice',visual:'pos-source-bank',columns:[{label:'PDF SOURCE',tone:'blue',title:'Original stem + tier',body:'answer key ও source explanation preserved; source tag visible।'},{label:'COURSE PRACTICE',tone:'green',title:'Targeted reinforcement',body:'same topic-এর নতুন example; separate practice tag।'}],note:'দুটি bank আলাদা label-এ থাকে, কিন্তু একই Question Bank-style card controls ব্যবহার করে।'},
      {type:'table',eyebrow:'ANSWER KEY',title:'৮০টি source answer validation board',visual:'pos-answer-key',rows:[['01–20','B C B B B B C C B C C C B C B B B C B B','Basic → Intermediate'],['21–40','B B B B C B B B B B B C C B C B B B B C','Intermediate'],['41–60','C C B C B C D B C B C B B C B B B B B B','Admission'],['61–80','B C B C C C B C C C B B C C B B C C C C','Admission → Trap/Advanced']]},
      {type:'table',eyebrow:'CLOSING RECALL',title:'Repeated micro-rules + final topic map',visual:'pos-topic-map',rows:[['Function','dictionary class নয়','fast car / run fast'],['Object','object থাকলে prep','in Dhaka / come in'],['Clause','S+V থাকলে conj','after war / after he left'],['Modify','noun → adj; verb → adv','weekly market / meet weekly'],['Final line','শব্দ নয়, কাজ বদলায়','FUNCTION · NOT FORM']]}
    ]}
  ];
  const course={id:'parts-of-speech-mastery',title:'Parts of Speech Mastery',subtitle:'Eight Jobs • Function not Form • Admission Traps',subject:'English Grammar',level:'University Admission Focus',time:'90 min+',color:'#163552',icon:'🔤',status:'published',builtIn:true,source:'Parts_of_Speech_Visual_Admission_Master_Guide.pdf',sourceFileName:'Parts_of_Speech_Visual_Admission_Master_Guide.pdf',sourceNote:'১০০-page PDF-এর ৮০টি source MCQ (Basic 16 · Intermediate 24 · Admission 28 · Trap/Advanced 12) + ৮০টি আলাদা Course Practice MCQ; source answer key ও explanation রাখা হয়েছে। PDF-এ আলাদা raster image ছিল না—table, box, flow, ladder, atlas ও map responsive visual হিসেবে recreate করা হয়েছে।',lessons,mcqs:sourceQuestions.concat(practice)};
  const list=window.__admissionExtraCourses||(window.__admissionExtraCourses=[]);
  window.__admissionExtraCourses=list.filter(c=>c.id!==course.id).concat(course);
  window.__admissionPartsCourse=course;
})();
