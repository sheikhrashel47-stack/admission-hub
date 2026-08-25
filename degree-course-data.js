/* Degree Mastery course data: source-grounded lessons + deterministic course-local practice. */
(function(){
  'use strict';
  const questions=[];
  const add=(family,q,correct,wrong,explanation)=>{
    const options=[correct,...wrong].map(String).filter((x,i,a)=>x.trim()&&a.indexOf(x)===i).slice(0,4);
    if(options.length!==4||!options.includes(correct))return;
    const shift=questions.length%4;
    const rotated=options.slice(shift).concat(options.slice(0,shift));
    questions.push({id:`degree-practice-${String(questions.length+1).padStart(3,'0')}`,tag:'Course Practice',family,q,o:rotated,a:rotated.indexOf(correct),e:`${family}: ${explanation}`});
  };
  const simpleForms=[
    ['tall','taller','tallest'],['short','shorter','shortest'],['fast','faster','fastest'],['young','younger','youngest'],['clean','cleaner','cleanest'],['hard','harder','hardest'],['bright','brighter','brightest'],['cold','colder','coldest'],['small','smaller','smallest'],['strong','stronger','strongest']
  ];
  simpleForms.forEach(([base,comp,sup])=>{
    add('Formation',`The comparative form of “${base}” is _____.`,comp,[base,sup,`more ${base}`],`One-syllable adjectives normally take -er: ${base} → ${comp}.`);
    add('Formation',`The superlative form of “${base}” is _____.`,`the ${sup}`,[sup,`most ${base}`,`the ${comp}`],`One-syllable adjectives take -est and normally use the: the ${sup}.`);
  });
  const yForms=[['happy','happier','happiest'],['easy','easier','easiest'],['heavy','heavier','heaviest'],['busy','busier','busiest'],['lazy','lazier','laziest']];
  yForms.forEach(([base,comp,sup])=>{
    add('Spelling',`Choose the correct comparative of “${base}”.`,comp,[`${base}er`,`more ${base}`,sup],`Consonant + y changes y to i before -er: ${base} → ${comp}.`);
    add('Spelling',`Choose the correct superlative of “${base}”.`,`the ${sup}`,[`${base}est`,`most ${base}`,`the ${comp}`],`Consonant + y changes y to i before -est: ${base} → ${sup}.`);
  });
  const longForms=[['beautiful','more beautiful','most beautiful'],['difficult','more difficult','most difficult'],['useful','more useful','most useful'],['important','more important','most important'],['interesting','more interesting','most interesting']];
  longForms.forEach(([base,comp,sup])=>{
    add('Formation',`The comparative of “${base}” is _____.`,comp,[`${base}er`,`most ${base}`,`the ${sup}`],`Long adjectives normally use more + adjective.`);
    add('Formation',`The superlative of “${base}” is _____.`,`the ${sup}`,[`${sup}`,`more ${base}`,`the ${comp}`],`Long adjectives normally use the most + adjective.`);
  });
  const irregular=[
    ['good','better','best'],['bad','worse','worst'],['many','more','most'],['much','more','most'],['little','less','least'],['few','fewer','fewest'],['far','farther','farthest'],['old','older','oldest'],['late','later','latest'],['well','better','best']
  ];
  irregular.forEach(([base,comp,sup])=>{
    add('Irregular forms',`The comparative form of “${base}” is _____.`,comp,[base,sup,`more ${base}`],`This is an irregular degree form: ${base} → ${comp}.`);
    add('Irregular forms',`The superlative form of “${base}” is _____.`,`the ${sup}`,[sup,`most ${base}`,`the ${comp}`],`This is an irregular degree form: ${base} → ${sup}.`);
  });
  const signals=[
    ['Rina is brighter ___ Mina.','than',['as','to','from'],'Two-person comparison uses comparative + than.'],
    ['Rina is ___ bright as Mina.','as',['than','the','more'],'Equality uses as + adjective + as.'],
    ['Rina is the brightest ___ the class.','in',['than','as','to'],'A group after superlative commonly takes in/of.'],
    ['He is one of the best ___ in the team.','players',['player','playing','play'],'One of the is followed by a superlative and plural noun.'],
    ['Iron is more useful than any other ___ .','metal',['metals','metallic','more metal'],'Any other is followed by a singular noun in this pattern.'],
    ['Dhaka is larger than all other ___ in Bangladesh.','cities',['city','citys','the city'],'All other is followed by a plural noun.'],
    ['Of the two plans, this is ___ better.','the',['a','most','an'],'For two items, the comparative commonly takes the article the.'],
    ['He is senior ___ me.','to',['than','from','as'],'Senior takes to, not than.'],
    ['This method is superior ___ that one.','to',['than','from','as'],'Superior takes to.'],
    ['I prefer tea ___ coffee.','to',['than','from','as'],'Prefer A to B is the standard pattern.'],
    ['The two plans are different ___ each other.','from',['than','to','as'],'Different takes from.'],
    ['The two copies are identical ___ each other.','to',['than','from','as'],'Identical takes to.' ]
  ];
  signals.forEach(([q,c,w,e])=>add('Signal words',q,c,w,e));
  const transforms=[
    ['Rafi is taller than Karim. Choose the positive form.','Karim is not as tall as Rafi.',['Karim is as tall as Rafi.','Rafi is not as tall as Karim.','Karim is the tallest.'],'Comparative to positive uses the reverse subject with not as…as.'],
    ['No other peak is as high as Everest. Choose the comparative form.','Everest is higher than any other peak.',['Everest is the highest than any peak.','No peak is higher as Everest.','Everest is as high than all peaks.'],'No other…as…as converts to higher than any other.'],
    ['He is the tallest boy in the class. Choose the positive form.','No other boy in the class is as tall as he is.',['Every boy is as tall as he is.','He is not as tall as any boy.','Very few boys are taller than he is.'],'The superlative highest meaning becomes no other…as…as.'],
    ['He is one of the best players. Choose the positive form.','Very few players are as good as he is.',['No player is as good as he is.','Every player is better than he is.','He is as good as one player.'],'One of the best expresses very high rank, not absolute uniqueness.'],
    ['Very few cities are as large as Dhaka. Choose the comparative form.','Dhaka is larger than most other cities.',['Dhaka is largest than most cities.','Dhaka is as large than all cities.','Dhaka is the larger city.'],'Very few…as…as converts to larger than most other.'],
    ['A is the tallest of all boys. Choose the comparative form.','A is taller than any other boy.',['A is taller than all boy.','A is as tall than any boy.','No boy is taller as A.'],'The tallest of all converts to taller than any other.'],
    ['This is the cheapest item. Choose the positive form.','No other item is as cheap as this.',['Every item is as cheap as this.','This is not as cheap as any item.','No item is cheaper as this.'],'Superlative lowest meaning becomes no other…as…as.'],
    ['Rina is better than most other students. Choose the positive form.','Very few other students are as good as Rina.',['No student is as good as Rina.','Rina is as good as all students.','Most students are better than Rina.'],'Better than most other expresses one of the highest group positions.'],
    ['No other metal is as useful as iron. Choose the superlative form.','Iron is the most useful metal.',['Iron is more useful as any metal.','Iron is the usefulest metal.','No metal is more useful than iron as.'],'No other…as…as expresses the superlative meaning.'],
    ['Arif is taller than any other boy. Choose the superlative form.','Arif is the tallest boy.',['Arif is the taller boy of two.','No boy is taller than Arif as.','Arif is taller as all boys.'],'Than any other converts to the superlative.'],
    ['This book is as useful as that one. Choose the negative equality.','This book is not so useful as that one.',['This book is more useful than that one.','This book is not useful than that one.','This book is the most useful one.'],'Negative equality uses not so/as + adjective + as.'],
    ['A is taller than B. Choose the equivalent sentence.','B is not as tall as A.',['B is as tall as A.','A is not as tall as B.','B is the tallest of all.'],'The meaning stays the same after reversing the subjects.'],
    ['He is the best player. Choose the equivalent positive sentence.','No other player is as good as he is.',['Every player is better than him.','He is good than all.','No player is good as he.'],'The best means no other player is as good as him.'],
    ['A is one of the tallest boys. Choose the comparative form.','A is taller than most other boys.',['A is taller than any other boy.','A is the only tallest boy.','Most boys are taller than A.'],'One of the tallest means taller than most other, not necessarily every other.'],
    ['No other item is as cheap as this. Choose the comparative form.','This is cheaper than any other item.',['This is cheap than all item.','This is the cheaper of all.','No item is cheaper as this.'],'No other…as…as converts to cheaper than any other.' ],
    ['He is the tallest of the two brothers. Choose the natural form.','He is the taller of the two brothers.',['He is the tallest of two brothers.','He is more tall of two.','He is tall than his brother.'],'With two items, use the comparative, usually with the.' ]
  ];
  transforms.forEach(([q,c,w,e])=>add('Transformation',q,c,w,e));
  const patterns=[
    ['The more you read, ___ you learn.','the more',['more','the most','the much'],'The correlative pattern is the + comparative, the + comparative.'],
    ['The faster you drive, ___ dangerous it becomes.','the more',['more','the most','the much'],'The second clause also needs the + comparative.'],
    ['The longer I live here, ___ I like it.','the more',['more','the most','the much'],'The more… pattern expresses linked change.'],
    ['The city is becoming ___.','more and more crowded',['crowded and crowded','most crowded','more crowdedest'],'Repeated comparative expresses gradual increase.'],
    ['The route is becoming ___.','less and less useful',['less usefulest','least and least useful','lesser useful'],'Repeated comparative can express gradual decrease.'],
    ['She has twice ___ books as I have.','as many',['as much','more','many as'],'Books are countable plural, so use as many.'],
    ['This costs twice ___ as that.','as much',['as many','more much','much as'],'Cost is an amount, so use as much.'],
    ['I have ___ money than you.','less',['fewer','least','little'],'Money is uncountable, so the comparative quantity is less.'],
    ['There are ___ students in this class than that one.','fewer',['less','least','little'],'Students are countable plural, so use fewer.'],
    ['The box is ___ heavy to lift.','too',['enough','so','such'],'Too + adjective + to expresses excessive degree.'],
    ['The box is light ___ to carry.','enough',['too','so','such'],'Adjective + enough + to expresses sufficient degree.'],
    ['It is ___ cold that we stayed inside.','so',['such','too','enough'],'So + adjective + that is the correct pattern.'],
    ['It was ___ a cold day that we stayed inside.','such',['so','too','enough'],'Such + noun phrase + that is the correct pattern.'],
    ['He is ___ clever as his friend.','not so',['not clever than','not the cleverest','no clever'],'Negative equality uses not so/as + adjective + as.'],
    ['She is ___ to solve the problem.','difficult enough',['more difficult enough','too enough','enough difficult'],'Enough follows the adjective: difficult enough to solve.'],
    ['The sooner, ___.','the better',['better','the best','more good'],'This is a double comparative/correlative expression.']
  ];
  patterns.forEach(([q,c,w,e])=>add('High-yield patterns',q,c,w,e));
  const traps=[
    ['Choose the correct phrase.','much better',['more better','most better','betterest'],'Avoid the double comparative more better.'],
    ['Choose the correct phrase.','the tallest',['most tallest','the most tallest','tallestest'],'Avoid the double superlative most tallest.'],
    ['Choose the correct sentence.','He is older than me.',['He is elder than me.','He is more elder than me.','He is oldest than me.'],'Use older than in ordinary comparison; elder is mainly attributive for family relation.'],
    ['Choose the correct phrase.','one of the best students',['one of the best student','one of best students','one of the better student'],'One of the requires a superlative and plural noun.'],
    ['Choose the correct form.','easier',['more easier','easyer','most easy'],'Avoid double marking and apply consonant + y spelling.'],
    ['Choose the correct equality.','as good as',['as better as','as best as','more good as'],'Positive equality uses the positive form after as.'],
    ['Choose the correct sentence.','I prefer tea to coffee.',['I prefer tea than coffee.','I prefer tea from coffee.','I prefer tea as coffee.'],'Prefer takes to.'],
    ['Choose the standard form.','This is unique.',['This is more unique.','This is the most unique.','This is uniquer.'],'Unique is normally treated as absolute/non-gradable in standard exam usage.'],
    ['Choose the correct sentence.','He is senior to me.',['He is senior than me.','He is senior from me.','He is senior as me.'],'Senior takes to.'],
    ['Choose the correct sentence.','This is similar to that.',['This is similar than that.','This is similar from that.','This is more similar as that.'],'Similar takes to.'],
    ['Choose the correct sentence.','The two are different from each other.',['The two are different than each other.','The two are differently from each other.','The two are difference from each other.'],'Different takes from.'],
    ['Choose the correct form.','much information',['many information','few information','fewer information'],'Information is uncountable, so use much for quantity.'],
    ['Choose the correct form.','fewer books',['less books','least books','little books'],'Books are countable plural, so use fewer.'],
    ['Choose the correct phrase.','the better of the two',['the best of the two','betterest of the two','most better of the two'],'Two items take the comparative, usually with the.'],
    ['Choose the correct sentence.','Sugar tastes sweet.',['Sugar is tasted sweet.','Sugar is tasting sweet by us.','Sweet is tasted sugar.'],'A linking verb followed by an adjective has no object for passive conversion.'],
    ['Choose the correct sentence.','She looks happy.',['Happy is looked by her.','She is looked happy.','Happy is being looked by her.'],'Look is linking here; happy is an adjective, not an object.']
  ];
  traps.forEach(([q,c,w,e])=>add('Error clinic',q,c,w,e));
  const mixed=[
    ['Which degree compares two people or things?','Comparative',['Positive','Superlative','Absolute'],'Comparative degree is used for a two-item comparison.'],
    ['Which degree can express equality with as…as?','Positive',['Comparative','Superlative','Irregular'],'Positive degree appears in the as…as equality pattern.'],
    ['Which word is the signal for a group-top comparison?','the',['than','as','to'],'The + -est/most commonly signals superlative.'],
    ['Which is the correct form of large?','larger, largest',['largeer, largeest','more large, most large','larger, most larger'],'Words ending in e take only -r and -st.'],
    ['Which is the correct form of big?','bigger, biggest',['biger, bigest','more big, most big','biggest, biggerest'],'CVC spelling doubles the final consonant.'],
    ['Which is the correct form of gray?','grayer, grayest',['graier, graiest','grayyer, grayyest','more gray, most gray'],'Vowel + y keeps y before -er/-est.'],
    ['Which is correct for a mass noun?','twice as much water',['twice as many water','twice more water as','twice as few water'],'Water is uncountable, so use as much.'],
    ['Which is correct for a countable noun?','three times as many books',['three times as much books','three times more many books','three times few books'],'Books are countable plural, so use as many.'],
    ['Which form follows modal can in passive?','can be solved',['can solved','can been solved','can is solved'],'Modal passive is modal + be + V3.'],
    ['Which form follows a perfect modal?','ought to have been saved',['ought have saved','ought to be saved yesterday','ought to have saved'],'Perfect modal passive is ought to have been + V3.'],
    ['Which transformation keeps the group meaning?','Arif is taller than most other boys.',['Arif is taller than any other boy.','Arif is the only tall boy.','Very few boys are taller than Arif.'],'Very few…as…as means higher than most other, not necessarily every other.'],
    ['Which noun number follows any other?','singular noun',['plural noun','uncountable only','verb phrase'],'Any other + singular noun is the standard exam pattern.'],
    ['Which noun number follows all other?','plural noun',['singular noun','article only','verb only'],'All other + plural noun is the standard pattern.'],
    ['Which phrase expresses a lower amount of countable items?','fewer students',['less students','little students','least students'],'Fewer modifies countable plural nouns.'],
    ['Which phrase expresses a lower amount of an uncountable thing?','less money',['fewer money','few money','least money'],'Less modifies uncountable nouns.'],
    ['Which pattern is correct?','more and more expensive',['more and more expensiver','most and most expensive','more expensive and most'],'Repeated comparative expresses gradual change.'],
    ['Which pattern is correct?','The more you practise, the more you improve.',['More you practise, more improve.','The more you practise, more you improve.','The most you practise, the most improve.'],'Both clauses use the + comparative in the correlative pattern.'],
    ['Which is a non-gradable example from the guide?','unique',['good','tall','useful'],'Unique is listed as an absolute/non-gradable adjective for standard exam use.'],
    ['Which phrase is correct?','my elder brother',['my elder than brother','my older brother than','my eldest than brother'],'Elder is natural attributively in family relationships.'],
    ['Which passive-style comparison is correct?','No other river is as long as the Nile.',['No river is long than Nile as.','Every river is as long as Nile.','The Nile is as long than all.'],'No other…as…as expresses the top comparison in positive form.'],
    ['Which is correct?','the most spoken language',['the more spoken language','most spoken than language','the spokenest language'],'Long adjective/participle usage uses the most in this superlative phrase.'],
    ['Which sentence has a correct adjective order?','The road is narrower than that road.',['The road is narrow than that road.','The road is the narrower than that road.','The road is more narrowest than that road.'],'Two-item comparison uses the comparative form with than.'],
    ['Which sentence is correct?','This is the most interesting book I have read.',['This is most interesting than book.','This is the more interesting book I read ever.','This is the interestingest book.'],'Superlative with a long adjective uses the most and a group/experience context.'],
    ['Which connector completes “identical ___ each other”?','to',['than','from','as'],'Identical takes to.'],
    ['Which connector completes “superior ___ that”?','to',['than','from','as'],'Superior takes to.'],
    ['Which structure is correct?','not so useful as',['not more useful as','not so useful than','not the useful as'],'Negative equality uses not so/as + adjective + as.'],
    ['Which answer is a valid superlative phrase?','the least expensive',['less expensiveest','the less expensive than','least more expensive'],'Least is the superlative of little for amount and works with expensive in this phrase.'],
    ['Which phrase is correct?','later than expected',['latter than expected','latest than expected','more later than expected'],'Later is used for time; latter contrasts the second of two.'],
    ['Which phrase is correct?','the latter option',['the later option of two only','latter than option','most latter option'],'Latter refers to the second of two options.'],
    ['Which phrase is correct?','farther from the station',['farrer from the station','most far from the station','farther than from station'],'Farther is a standard comparative of far for distance.'],
    ['Which phrase is correct?','further discussion',['further than discussion','furthest discussion of two','more further discussion'],'Further is commonly used for additional/non-physical extension.'],
    ['Which phrase is correct?','more careful than before',['most careful than before','carefuler than before','more careful as before'],'More + adjective + than forms a comparative for a long adjective.'],
    ['Which phrase is correct?','the least useful option',['the less useful option of all','least useful than option','the usefulest option'],'The least + adjective identifies the lowest degree in a group.'],
    ['Which option contains a correct plural after one of the?','one of the largest cities',['one of the largest city','one of largest cities','one of the larger city'],'One of the + superlative takes a plural noun.'],
    ['Which option is correct?','The faster you work, the sooner you finish.',['Faster you work, sooner finish.','The faster you work, sooner you finish.','The fastest you work, the sooner finish.'],'Correlative comparatives require the in both clauses.'],
    ['Which option is correct?','It was such an interesting book that I read it twice.',['It was so an interesting book that…','It was too an interesting book that…','It was enough interesting book that…'],'Such + adjective + noun phrase + that is the correct structure.']
  ];
  mixed.forEach(([q,c,w,e])=>add('Admission mix',q,c,w,e));
  const filler=[
    ['Choose the correct phrase for two options.','the better option',['the best option','betterest option','most better option'],'Of two items, use the comparative with the.'],
    ['Choose the correct phrase for a group.','the best option in the list',['the better option in the list','best than option','the most best option'],'A group-top meaning uses the superlative.'],
    ['Complete: No other city is ___ as Dhaka.','as large',['more large','the largest','large than'],'Positive comparison uses as + adjective + as.'],
    ['Complete: Dhaka is ___ than most other cities.','larger',['large','the largest','more larger'],'Most other with two-way form takes the comparative.'],
    ['Complete: Dhaka is ___ city in Bangladesh.','the largest',['largest than','the larger','most large than'],'A group-top form needs the + superlative.'],
    ['Choose the correct word: I have ___ books than you.','more',['much','most','many much'],'More modifies countable plural books in a comparative quantity phrase.'],
    ['Choose the correct word: I have ___ time than you.','less',['fewer','fewest','many'],'Time is uncountable; use less.'],
    ['Choose the correct word: There are ___ errors now.','fewer',['less','little','least'],'Errors are countable plural; use fewer.'],
    ['Choose the correct form: She is ___ than her sister.','happier',['happyer','the happiest','more happiest'],'Happy changes y to i before -er.'],
    ['Choose the correct form: This is ___ lesson.','the most useful',['more useful than','most useful than','the usefulest'],'A group/selection requires the most + adjective.'],
    ['Choose the correct form: The door is ___ to open.','easy enough',['enough easy','too enough','more easy enough'],'Enough follows the adjective.'],
    ['Choose the correct form: The stone is ___ heavy to lift.','too',['enough','such','more'],'Too comes before the adjective in too…to.'],
    ['Choose the correct form: It is ___ hot that we stayed inside.','so',['such','enough','too'],'So + adjective + that is correct.'],
    ['Choose the correct form: It was ___ a difficult test that many paused.','such',['so','too','enough'],'Such is followed by a noun phrase.'],
    ['Choose the correct form: He is ___ to his manager.','junior',['junior than','more junior than','junior from'],'Junior normally takes to.'],
    ['Choose the correct form: This copy is ___ to the original.','identical',['identical than','identical from','the identicalest'],'Identical takes to.'],
    ['Choose the correct form: She is ___ to her mother.','similar',['similar than','similar from','the similarest'],'Similar takes to.'],
    ['Choose the correct form: This version is ___ from the old one.','different',['different than','differenter as','the differentest'],'Different takes from.'],
    ['Choose the correct form: The more you revise, ___ your recall.','the stronger',['stronger','the strongest','more strong'],'The correlative pattern needs the + comparative.'],
    ['Choose the correct form: The less you sleep, ___ you feel.','the worse',['worse','the worst','more bad'],'The + comparative pattern links the two changes.'],
    ['Choose the correct form: The road is becoming ___.','narrower and narrower',['more narrower','narrowest and narrowest','narrow and narrower'],'Repeated comparative expresses gradual change.'],
    ['Choose the correct form: The service is becoming ___.','more and more reliable',['most and most reliable','reliabler and reliabler','more reliable and most'],'Long adjectives use more and more.'],
    ['Choose the correct form: She is ___ of the two candidates.','the wiser',['the wisest','wiserest','most wise than'],'Two candidates require the comparative, usually with the.'],
    ['Choose the correct form: This is ___ of the three routes.','the safest',['the safer','safer than','most safe than'],'Three or more routes require the superlative.'],
    ['Choose the correct form: Mount Everest is ___ peak in this comparison.','the highest',['higher than peak','the higher','most high'],'The highest identifies the top of a group.'],
    ['Choose the correct form: No other peak is ___ as Everest.','as high',['higher','the highest','high than'],'Positive transformation uses as high as.'],
    ['Choose the correct form: Everest is higher than ___ peak.','any other',['any others','all other peak','other any'],'Any other is followed by singular peak.'],
    ['Choose the correct form: Everest is higher than ___ peaks.','all other',['all other peak','any others peak','other all peak'],'All other is followed by plural peaks.'],
    ['Choose the correct form: Very few peaks are ___ as Everest.','as high',['higher','the highest','high than'],'Very few…as…as expresses very high rank.'],
    ['Choose the correct form: She is one of the ___ students.','best',['better','best student','most best'],'One of the takes a superlative and plural noun.'],
    ['Choose the correct form: He is ___ than most other players.','better',['best','gooder','the betterest'],'Most other with a two-way comparison takes the comparative.'],
    ['Choose the correct form: He is ___ player in the team.','the best',['better than player','best than','the most best'],'A group-top meaning uses the superlative.'],
    ['Choose the correct form: The amount is ___ than before.','less',['fewer','least','little'],'Amount uses less for a lower quantity.'],
    ['Choose the correct form: The number is ___.','fewer',['less','little','least'],'Fewer is used for a number of countable items.'],
    ['Choose the correct form: This is ___ information available.','the latest',['the latter','later than','most late'],'Latest refers to the newest/current item in time.'],
    ['Choose the correct form: Of the two dates, the ___ is Friday.','latter',['latest','laterest','most late'],'Latter refers to the second of two mentioned items.']
  ];
  filler.forEach(([q,c,w,e])=>add('Guided practice',q,c,w,e));
  const finishing=[
    ['Choose the correct form: The book is ___ than the other one.','more useful',['most useful','usefulest','the useful'],'A long adjective uses more + adjective + than for a two-item comparison.'],
    ['Choose the correct form: This is ___ book on the shelf.','the most useful',['more useful than','the usefulest','the more useful'],'A group-top comparison uses the most + adjective.'],
    ['Complete: Rina is as ___ as Mina.','bright',['brighter','brightest','more bright than'],'Equality uses the positive adjective between as…as.'],
    ['Complete: Rina is not ___ as Mina.','so bright',['brighter than','the brightest','more bright than'],'Negative equality uses not so/as + adjective + as.'],
    ['Choose the correct transformation: A is taller than B.','B is not as tall as A.',['A is not as tall as B.','B is taller than A.','A is the tallest of all.'],'The reverse subject takes not as…as in the positive equivalent.'],
    ['Choose the correct transformation: A is the tallest boy.','No other boy is as tall as A.',['No boy is taller as A.','A is as tall than every boy.','Every boy is as tall as A.'],'Superlative highest meaning converts to no other…as…as.'],
    ['Choose the correct phrase: The number of errors is ___.','fewer',['less','least','little'],'Fewer is used for a countable number.'],
    ['Choose the correct phrase: The amount of water is ___.','less',['fewer','fewest','few'],'Less is used for an uncountable amount.']
  ];
  finishing.forEach(([q,c,w,e])=>add('Final review',q,c,w,e));
  if(questions.length!==200)throw new Error(`Degree MCQ generator expected 200, got ${questions.length}`);
  const sourceQuestions=[];
  const sourceAdd=(n,q,o,a,e)=>sourceQuestions.push({id:`degree-source-${String(n).padStart(3,'0')}`,tag:'PDF Source/Model',family:'PDF Guide MCQ',q,o,a,e});
  const sourceRows=[
    ['It is the [blank] city of the country.',['more populous','most populous','most population','more population'],1,'A group-top city needs the superlative most populous.'],
    ['Jara has [blank] records now as I had last year.',['half as many','half as much','half as more','half many as'],0,'Records are countable plural, so use half as many.'],
    ['This dictionary costs [blank] the other one.',['twice as much as','twice as many as','twice more as','twice as much'],0,'Cost is an amount: twice as much as.'],
    ['Salina ate [blank] sandwiches as Rubina.',['three times as much','three times as many','three times many as','three times more'],1,'Sandwiches are countable plural: three times as many.'],
    ['He can sing better than [blank] in his family.',['someone','anybody','everybody','nobody'],1,'The standard source answer uses anybody in this comparison.'],
    ['The Disney park is [blank] Florida or California.',['larger than the ones in','the largest than the ones in','larger the ones in','the larger of'],0,'Comparative larger than the ones in is the grammatical pattern.'],
    ['Which sentence is correct?',['More you read, less you understand.','The more you read, the less you understand.','The more you read, less you understand.','More you read, the less you understand.'],1,'The correlative pattern needs the before both comparatives.'],
    ['The longer I live here [blank].',['I like the more','the more I like it','the more do I like it','I like it more'],1,'The longer…, the more… pattern uses the second comparative clause.'],
    ['English is the [blank] native language worldwide after Chinese and Hindi.',['more spoken','most spoken','least spoken','spoken'],1,'A ranking in a group needs the superlative most spoken.'],
    ['Speed is not always [blank] velocity.',['as','similar','the same as','same'],2,'The fixed phrase is the same as.'],
    ['The roads of Dhaka are wider than [blank].',['Khulna','that of Khulna','those of Khulna','those Khulna'],2,'Roads is plural, so use those of Khulna.'],
    ['He is one of the best boys in the village.',['Very few boys are as good as he is.','Very few boys is as good as he.','Very few boys are better as he.','No boys are as good as he.'],0,'One of the best converts to very few…as good as.'],
    ['The tiny print is [blank] small to read easily.',['too','very much','so much','enough'],0,'Too + adjective + to expresses excessive degree.'],
    ['The chain was [blank] than we thought.',['strongest','stronger','strong','much'],1,'Than signals the comparative stronger.'],
    ['Computers are now [blank] to put on desktops.',['smaller than','small enough','so small','smallest'],1,'Adjective + enough + to is the correct complement.'],
    ['Rina is [blank] as Mina.',['as intelligent','more intelligent','the most intelligent','intelligent than'],0,'Equality uses as intelligent as.'],
    ['Karim is taller [blank] Rahim.',['as','than','to','from'],1,'Comparative taller takes than.'],
    ['This is [blank] book I have ever read.',['interesting','more interesting','the most interesting','most interesting than'],2,'A superlative experience uses the most interesting.'],
    ['No other metal is [blank] useful as iron.',['more','as','most','so much'],1,'No other…as…as uses the positive form as useful as.'],
    ['Iron is more useful than [blank] metal.',['all','any other','any','other any'],1,'Than any other is followed by a singular noun.'],
    ['Very few cities are as large as Dhaka.',['Dhaka is largest than most cities.','Dhaka is larger than most other cities.','Dhaka is more large than any cities.','Dhaka is the larger city.'],1,'Very few…as…as converts to larger than most other.'],
    ['Mount Everest is higher than any other peak.',['No other peak is as high as Mount Everest.','No peak is higher than Everest as.','Every peak is as high.','Everest is high than all.'],0,'Than any other converts to no other…as…as.'],
    ['She is one of [blank] students.',['the best','best','the better','a best'],0,'One of the takes a superlative and plural noun.'],
    ['He is [blank] boy in the class.',['taller','the tallest','most tall','the taller'],1,'A group-top comparison needs the tallest.'],
    ['This road is [blank] than that road.',['narrow','narrower','the narrowest','more narrowest'],1,'Than signals the comparative narrower.'],
    ['The comparative of happy is [blank].',['happyer','more happy','happier','happiest'],2,'Consonant + y changes y to i before -er.'],
    ['The superlative of big is [blank].',['bigest','bigger','the biggest','most big'],2,'CVC spelling doubles the final consonant and uses the biggest.'],
    ['The comparative of beautiful is [blank].',['beautifuller','more beautiful','beautifuler','most beautiful'],1,'Long adjective uses more beautiful.'],
    ['He is [blank] than his brother.',['good','better','best','the better'],1,'The comparative of good is better.'],
    ['This is the [blank] result we expected.',['bad','worse','worst','most worse'],2,'The group/result ranking uses the superlative worst.'],
    ['I have [blank] money than you.',['few','fewer','less','least'],2,'Money is uncountable, so use less.'],
    ['There are [blank] students in this class than that one.',['less','fewer','least','little'],1,'Students are countable plural, so use fewer.'],
    ['She has [blank] books than I have.',['much','more','most','many much'],1,'Books are countable plural, so use more.'],
    ['This is the [blank] information available.',['latest','later','latter','lastly'],0,'Latest refers to the newest information.'],
    ['My [blank] brother lives abroad.',['older','elder','oldest','eldest than'],1,'Elder is natural in a family relationship.'],
    ['He is senior [blank] me.',['than','to','from','as'],1,'Senior takes to, not than.'],
    ['This method is superior [blank] that one.',['than','to','from','as'],1,'Superior takes to.'],
    ['I prefer tea [blank] coffee.',['than','to','from','as'],1,'Prefer A to B is the standard pattern.'],
    ['The two plans are similar [blank].',['than','to each other','as','from'],1,'Similar takes to.'],
    ['The more you practise, [blank].',['the more you improve','more you improve','the most you improve','you improve more'],0,'Both clauses use the + comparative pattern.'],
    ['The city is becoming [blank].',['crowded and crowded','more and more crowded','most crowded','more crowdedest'],1,'Repeated comparative expresses gradual increase.'],
    ['This problem is [blank] to solve.',['too difficult','difficult enough','more difficult enough','too enough'],0,'Too + adjective + to is the correct structure.'],
    ['The bag is light [blank] to carry.',['too','enough','so','such'],1,'Adjective + enough + to is correct.'],
    ['It was [blank] interesting book that I read it twice.',['so','such an','too','enough'],1,'Such + adjective + noun phrase + that is correct.'],
    ['He is [blank] as his friend.',['not so clever','not clever than','not the cleverest','no clever'],0,'Negative equality uses not so clever as.'],
    ['Comparative of little, referring to quantity, is [blank].',['less','fewer','least','more'],0,'Less is the comparative of little for amount.'],
    ['Comparative of few is [blank].',['less','fewer','fewest','little'],1,'Fewer is the comparative of few.'],
    ['The correct form is [blank].',['more better','much better','most better','betterest'],1,'Avoid double comparative; much better is correct.'],
    ['Choose the correct phrase.',['one of the best student','one of best students','one of the best students','one of the better student'],2,'One of the best takes a plural noun.'],
    ['Choose the correct phrase.',['than any other cities','than any other city','than any cities other','than other any city'],1,'Any other is followed by singular city.'],
    ['He is [blank] of the two brothers.',['the taller','the tallest','taller','most tall'],0,'Two items take the comparative with the.'],
    ['Of the two options, this is [blank].',['the better','the best','betterest','most better'],0,'Of the two requires the comparative.'],
    ['She is [blank] person I know.',['kind','kinder','the kindest','most kind than'],2,'A group of known people needs the kindest.'],
    ['This is [blank] than I expected.',['more easy','easier','easiest','the easier'],1,'The standard comparative form is easier.'],
    ['The positive form of “Rafi is taller than Karim” is [blank].',['Karim is as tall as Rafi.','Karim is not as tall as Rafi.','Rafi is not as tall as Karim.','Karim is the tallest.'],1,'Comparative to positive uses the reverse subject with not as…as.'],
    ['The comparative form of “No other river is as long as the Nile” is [blank].',['The Nile is longer than any other river.','The Nile is the long river.','No river is longer than Nile as.','The Nile is as long than all.'],0,'No other…as…as converts to longer than any other.'],
    ['“He is the best player” means [blank].',['No other player is as good as he is.','Every player is better than him.','He is good than all.','He is as good as no player.'],0,'The best means no other player is as good as him.'],
    ['“The sooner, the better” is an example of [blank].',['positive degree','double comparative','superlative degree','irregular adjective'],1,'It is a correlative/double comparative.'],
    ['Which is correct?',['This is more unique than that.','This is unique.','This is the most unique than that.','This is uniquer than that.'],1,'Unique is normally treated as non-gradable in standard exam usage.'],
    ['Which sentence is correct?',['The two are different than each other.','The two are different from each other.','The two are differently from each other.','The two are difference from each other.'],1,'Different takes from.']
  ];
  sourceRows.forEach((r,i)=>sourceAdd(i+1,r[0],r[1],r[2],r[3]));
  if(sourceQuestions.length!==60)throw new Error(`Degree source MCQ expected 60, got ${sourceQuestions.length}`);
  const lessons=[
    {id:'degree-foundation',title:'01 · Foundation: Degree কী?',icon:'📐',slides:[
      {type:'hero',eyebrow:'FOUNDATION · BIG IDEA',title:'একটি quality-এর level বদলায়',lead:'Positive, Comparative ও Superlative—তিনটি form একই quality-কে ভিন্ন comparison-এ দেখায়।',visual:'focus',rule:'Positive = equality/no comparison  ·  Comparative = two  ·  Superlative = group top/bottom',example:'Rina is as bright as Mina.\nRina is brighter than Mina.\nRina is the brightest in the class.',note:'প্রথমে comparison কতজন/কতটি—এটি ধরো।'} ,
      {type:'table',eyebrow:'THREE-FORM LENS',title:'তিন form এক নজরে',rows:[['Positive','একটি বা সমতার pattern','as…as','Rina is as bright as Mina.'],['Comparative','দুই ব্যক্তি/বস্তু','than','Rina is brighter than Mina.'],['Superlative','তিন বা বেশি group','the / in / of','Rina is the brightest in the class.']]},
      {type:'compare',eyebrow:'ADJECTIVE বনাম DEGREE',title:'সব adjective-এর তিন degree হয় না',columns:[{label:'GRADABLE',tone:'green',title:'tall → taller → tallest',body:'Quality level বদলানো যায়\nএগুলো comparison নেয়'},{label:'ABSOLUTE TRAP',tone:'blue',title:'unique / perfect / wooden',body:'Standard exam usage-এ\nmore perfect এড়াও'}],note:'Context কিছু variation আনতে পারে, কিন্তু admission option-এ standard usage অনুসরণ করো।'}
    ]},
    {id:'degree-signals',title:'02 · Signal Radar: clue word ধরো',icon:'🔎',slides:[
      {type:'rule',eyebrow:'FAST IDENTIFICATION',title:'Connector আগে পড়ো',formula:'than → comparative  ·  as…as → positive  ·  the + -est/most → superlative',steps:['শূন্যস্থান-এর আগে/পরে signal word circle করো','দুই item হলে -er/more বেছে নাও','group হলে the + -est/most বেছে নাও','শেষে noun number মিলাও'],example:'Rina is brighter than Mina.\nRina is as bright as Mina.\nRina is the brightest in the class.'},
      {type:'compare',eyebrow:'TWO বনাম GROUP',title:'সংখ্যাই answer-এর direction ঠিক করে',columns:[{label:'TWO ITEMS',tone:'green',title:'the taller of the two',body:'Comparative + than\nদুই option-এর মধ্যে'},{label:'GROUP',tone:'blue',title:'the tallest in the class',body:'Superlative + in/of\nতিন বা বেশি'}]},
      {type:'table',eyebrow:'ARTICLE CHECK',title:'the কখন লাগবে?',rows:[['Comparative','তুলনামূলক phrase','taller than Rafi'],['Two-item choice','সাধারণত the','the better of the two'],['Superlative','the + -est/most','the most useful'],['Positive equality','as…as','as useful as that one']]}
    ]},
    {id:'degree-formation-short',title:'03 · Formation Lab: ছোট adjective',icon:'✍️',slides:[
      {type:'rule',eyebrow:'RULE A · ONE SYLLABLE',title:'-er / -est বসাও',formula:'base + er  ·  base + est',steps:['tall → taller → tallest','short → shorter → shortest','fast → faster → fastest','clean → cleaner → cleanest'],example:'One-syllable adjective হলে সাধারণত more নয়; spelling দেখে -er/-est দাও।'},
      {type:'compare',eyebrow:'RULE B · FINAL E',title:'শেষে e থাকলে e আবার লিখবে না',columns:[{label:'BASE',tone:'green',title:'large',body:'শেষে e আছে'},{label:'FORMS',tone:'blue',title:'larger · largest',body:'শুধু -r / -st যোগ'}],note:'wise → wiser → wisest-ও একই rule।'},
      {type:'rule',eyebrow:'RULE C · CVC',title:'শেষ consonant double করো',formula:'big → bigger → biggest  ·  hot → hotter → hottest',steps:['শেষ তিন letter দেখো','consonant-vowel-consonant হলে','শেষ consonant double করো','তারপর -er/-est দাও'],example:'big → bigger, thin → thinner, hot → hotter'}
    ]},
    {id:'degree-formation-long',title:'04 · Formation Lab: spelling ও syllable',icon:'🧩',slides:[
      {type:'rule',eyebrow:'RULE D · CONSONANT + Y',title:'y বদলে i হবে',formula:'happy → happier → happiest',steps:['happy → happier','easy → easier','heavy → heavier','vowel + y হলে y থাকে: gray → grayer'],example:'busy → busier → busiest\nlazy → lazier → laziest'},
      {type:'table',eyebrow:'RULE E · LONG ADJECTIVE',title:'more / most matrix',rows:[['beautiful','more beautiful','the most beautiful'],['difficult','more difficult','the most difficult'],['useful','more useful','the most useful'],['important','more important','the most important'],['interesting','more interesting','the most interesting']]},
      {type:'compare',eyebrow:'TWO-SYLLABLE FLEXIBILITY',title:'দুই pattern কখনও দুটোই চলে',columns:[{label:'-ER/-EST',tone:'green',title:'cleverer · cleverest',body:'clever, simple, narrow\nকিছু context-এ চলে'},{label:'MORE/MOST',tone:'purple',title:'more clever · most clever',body:'Option-এর context\nও standard usage দেখো'}],note:'ভর্তি পরীক্ষায় accepted standard form-টি বেছে নাও।'}
    ]},
    {id:'degree-irregular',title:'05 · Irregular Vault: form মুখস্থ নয়, pattern',icon:'🗝️',slides:[
      {type:'table',eyebrow:'IRREGULAR DEGREE VAULT',title:'দ্রুত reference',rows:[['good','better','best','ভালো'],['bad/ill','worse','worst','খারাপ'],['many/much','more','most','বেশি'],['little','less','least','কম পরিমাণ'],['few','fewer','fewest','কম সংখ্যক'],['far','farther/further','farthest/furthest','দূর'],['old','older/elder','oldest/eldest','বয়স্ক/জ্যেষ্ঠ'],['late','later/latter','latest/last','সময়/ক্রম']]},
      {type:'compare',eyebrow:'ELDER বনাম OLDER',title:'Family clue আলাদা করো',columns:[{label:'FAMILY',tone:'green',title:'my elder brother',body:'Attributive use\nfamily relationship'},{label:'ORDINARY',tone:'blue',title:'older than me',body:'সাধারণ comparison\nolder than ব্যবহার'}]},
      {type:'rule',eyebrow:'QUANTITY RADAR',title:'many/few বনাম much/little',formula:'number → many / few  ·  amount → much / little',steps:['books, students → many/few','money, water → much/little','comparative হলে more/fewer/less','superlative হলে most/fewest/least'],example:'more books · fewer students · less money · the least water'}
    ]},
    {id:'degree-transform-positive',title:'06 · Transformation I: Positive ↔ Comparative',icon:'🔁',slides:[
      {type:'compare',eyebrow:'AS…AS FAMILY',title:'Equality থেকে comparative',columns:[{label:'POSITIVE',tone:'green',title:'Rafi is as brave as Karim.',body:'সমতার pattern\nas + adjective + as'},{label:'COMPARATIVE',tone:'blue',title:'Karim is not braver than Rafi.',body:'অর্থ একই থাকে\nsubject reverse হয়'}]},
      {type:'table',eyebrow:'NO OTHER FAMILY',title:'Top meaning-এর তিন route',rows:[['Positive','No other boy is as tall as Arif.','group-এর কেউ সমান নয়'],['Comparative','Arif is taller than any other boy.','অন্য প্রত্যেকের চেয়ে বেশি'],['Superlative','Arif is the tallest boy.','group-এর top']]},
      {type:'rule',eyebrow:'VERY FEW FAMILY',title:'Most-এর সঙ্গে positive conversion',formula:'Very few…as…as → taller than most other → one of the tallest',steps:['Very few cities are as large as Dhaka','Dhaka is larger than most other cities','Dhaka is one of the largest cities'],example:'Very few ≠ no other; “many-এর মধ্যে খুব উপরে” অর্থ ধরে রাখো।'}
    ]},
    {id:'degree-transform-superlative',title:'07 · Transformation II: Superlative engine',icon:'🏆',slides:[
      {type:'rule',eyebrow:'SUPERLATIVE → POSITIVE',title:'the tallest থেকে no other',formula:'A is the tallest → No other … is as tall as A',steps:['group noun রাখো','No other বসাও','positive adjective ব্যবহার করো','as…as pattern শেষ করো'],example:'A is the tallest boy in the class.\n→ No other boy in the class is as tall as A.'},
      {type:'rule',eyebrow:'SUPERLATIVE → COMPARATIVE',title:'the tallest থেকে taller than any other',formula:'the tallest of all → taller than any other',steps:['the বাদ দাও','comparative বানাও','than any other + singular noun বসাও'],example:'A is the tallest of all boys.\n→ A is taller than any other boy.'},
      {type:'compare',eyebrow:'ONE OF THE',title:'One of the tallest মানে কী?',columns:[{label:'MEANING',tone:'green',title:'A is one of the tallest boys.',body:'A খুব উঁচু group rank-এ\nকিন্তু একমাত্র নয়'},{label:'COMPARATIVE',tone:'blue',title:'A is taller than most other boys.',body:'most other, any other নয়\nকারণ “one of” এসেছে'}]}
    ]},
    {id:'degree-quantity',title:'08 · Equality, quantity ও multiplier',icon:'⚖️',slides:[
      {type:'compare',eyebrow:'EQUALITY LENS',title:'সমতা ও negative equality',columns:[{label:'EQUALITY',tone:'green',title:'as useful as',body:'This book is as useful as that one.'},{label:'NEGATIVE',tone:'blue',title:'not so useful as',body:'This book is not so useful as that one.'}]},
      {type:'table',eyebrow:'MULTIPLIER TABLE',title:'many না much?',rows:[['Countable number','twice as many books','books গোনা যায়'],['Mass amount','twice as much money','money গোনা যায় না'],['Lower number','fewer students','countable plural'],['Lower amount','less water','uncountable']]},
      {type:'rule',eyebrow:'MORE AND MORE',title:'Degree ধীরে ধীরে বদলালে',formula:'comparative + and + comparative',steps:['বাড়লে: bigger and bigger','long adjective: more and more expensive','কমলে: less and less useful','meaning-এর direction দেখে form বেছে নাও'],example:'The city is becoming more and more crowded.'}
    ]},
    {id:'degree-high-yield',title:'09 · High-yield: the more…the more',icon:'📈',slides:[
      {type:'hero',eyebrow:'CORRELATIVE COMPARISON',title:'দুই পরিবর্তনের link দেখো',lead:'একটি quality যত বদলায়, অন্যটিও তার সঙ্গে বদলায়—এখানে দুই clause-এই the + comparative থাকে।',visual:'focus',rule:'The + comparative, the + comparative',example:'The more you read, the more you learn.\nThe faster you drive, the more dangerous it becomes.',note:'দ্বিতীয় the বাদ দেবে না।'} ,
      {type:'examples',eyebrow:'PATTERN DRILL',title:'তিনটি ready frame',items:[['READING','The more you read','the more you learn'],['SPEED','The faster you drive','the more dangerous it becomes'],['TIME','The longer I live here','the more I like it']]},
      {type:'rule',eyebrow:'DOUBLE COMPARATIVE',title:'সাধারণ gradual change',formula:'bigger and bigger  ·  more and more expensive  ·  less and less useful',steps:['same comparative repeat করো','and দিয়ে জোড়া দাও','long adjective হলে more/less repeat করো'],example:'The road is getting narrower and narrower.'}
    ]},
    {id:'degree-connectors',title:'10 · Connector clinic: to/from/than',icon:'🔗',slides:[
      {type:'table',eyebrow:'FIXED CONNECTOR MAP',title:'কোন word কোন connector নেয়?',rows:[['senior / junior','to','He is senior to me.'],['superior / inferior','to','This is superior to that.'],['similar','to','This is similar to that.'],['different','from','This is different from that.'],['identical','to','Copies are identical to each other.'],['prefer A','to B','I prefer tea to coffee.']]},
      {type:'compare',eyebrow:'ANY OTHER বনাম ALL OTHER',title:'singular/plural trap',columns:[{label:'ANY OTHER',tone:'green',title:'than any other city',body:'একটি city-এর সঙ্গে\nঅন্য প্রতিটি city'},{label:'ALL OTHER',tone:'blue',title:'than all other cities',body:'অন্য সব city\nplural noun'}],note:'Option-এ noun number দেখে ভুল answer বাদ দাও।'},
      {type:'rule',eyebrow:'PREFERENCE CHECK',title:'prefer-এর shortcut',formula:'prefer A to B  ·  not prefer A than B',steps:['A ও B শনাক্ত করো','prefer-এর পরে to বসাও','than option হলে সতর্ক হও'],example:'I prefer tea to coffee.\nThis method is superior to that one.'}
    ]},
    {id:'degree-complements',title:'11 · Too, enough, so, such',icon:'🧠',slides:[
      {type:'table',eyebrow:'COMPLEMENT MATRIX',title:'চারটি structure আলাদা করো',rows:[['too + adjective + to','too heavy to lift','অতিরিক্ত degree'],['adjective + enough + to','light enough to carry','যথেষ্ট degree'],['so + adjective + that','so cold that…','adjective-এর আগে so'],['such + noun phrase + that','such a cold day that…','noun phrase-এর আগে such']]},
      {type:'compare',eyebrow:'SO বনাম SUCH',title:'পরের word দেখেই answer',columns:[{label:'SO',tone:'green',title:'so interesting that',body:'so + adjective\nno noun immediately'},{label:'SUCH',tone:'purple',title:'such an interesting book that',body:'such + adjective + noun\nan article লাগতে পারে'}]},
      {type:'rule',eyebrow:'EXAM REWRITE',title:'too/enough-এ position ভুল নয়',formula:'too difficult to solve  ·  difficult enough to solve',steps:['too adjective to','adjective enough to','more difficult enough ভুল','enough difficult ভুল'],example:'The problem is too difficult to solve.\nThe problem is difficult enough to solve.'}
    ]},
    {id:'degree-traps',title:'12 · Error clinic ও 30-second method',icon:'🛡️',slides:[
      {type:'table',eyebrow:'ERROR CLINIC',title:'সবচেয়ে common traps',rows:[['more better ✗','double comparative','much better / better'],['most tallest ✗','double superlative','the tallest'],['senior than ✗','wrong connector','senior to'],['one of the best student ✗','singular noun','one of the best students'],['prefer tea than ✗','prefer takes to','prefer tea to coffee'],['as better as ✗','positive broken','as good as']]},
      {type:'rule',eyebrow:'30-SECOND SOLVER',title:'Connector → form → noun',formula:'১ connector  ·  ২ degree form  ·  ৩ noun/article',steps:['than/as/the/one of/any other circle করো','syllable ও spelling rule দেখো','any other হলে singular','one of হলে plural'],example:'প্রথমে signal word, শেষে meaning check—শুধু form মুখস্থ করে answer দিও না।'},
      {type:'hero',eyebrow:'FINAL REVISION',title:'Pattern ধরো, trap বাদ দাও',lead:'এই Course-এ source guide-এর logical content, visual tables, transformation families ও ২৬০টি মোট practice card একসঙ্গে রাখা হয়েছে।',visual:'filter',rule:'Positive ↔ Comparative ↔ Superlative = একই meaning-এর তিন lens',example:'শেষে ২০০টি নতুন Course Practice MCQ timer দিয়ে solve করো।',note:'[উৎস] guide-এর ৬০টি item এবং নতুন [Course Practice] item আলাদা করে review করা যাবে।'}
    ]}
  ];
  window.__admissionExtraCourses=[{id:'degree-mastery',title:'Degree Mastery',subtitle:'Positive • Comparative • Superlative',subject:'English Grammar',level:'Admission Focus',time:'45 min',color:'#2b77b6',icon:'📈',status:'published',builtIn:true,source:'Degree_of_Comparison_University_Admission_Guide.pdf',sourceFileName:'Degree_of_Comparison_University_Admission_Guide.pdf',sourceNote:'PDF-এর ৬০টি source/model MCQ + ২০০টি নতুন Course Practice MCQ; secondary source official university answer key নয়।',lessons,mcqs:sourceQuestions.concat(questions)}];
})();
