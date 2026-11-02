// דיפטיכון לכל רעיון: שתי יצירות אמנות, אחת לכל צד. רישיון CC0, מאוסף הגישה הפתוחה של מוזיאון קליבלנד לאמנות (Cleveland Museum of Art).
// נבחרו ונבדקו בעין, 02.11.2026. pos = נקודת מוקד לחיתוך (object-position) כשהמרכז אינו העיקר.
export type Art = { id: number; accession: string; title: string; titleEn: string; artist: string; artistEn: string; date: string; culture: string; file: string; pos?: string; why: string };
export const ART: Record<string, { a: Art | null; b: Art | null }> = {
  haste: {
    a: { id: 123368, accession: "1943.603", title: "הדייגים", titleEn: "The Anglers", artist: "אדריאן ואן אוסטאדה", artistEn: "Adriaen van Ostade", date: "c. 1647", culture: "Netherlands", file: 'haste-a.jpg', why: "Anglers waiting motionless on a footbridge: patience embodied." },
    b: { id: 126086, accession: "1948.306", title: "גשם סוחף בשונו", titleEn: "Driving Rain at Sh\u014dno, from Fifty-Three Stations of the Tokaid\u014d", artist: "אוטגווה הירושיגה", artistEn: "Utagawa Hiroshige", date: "1833", culture: "Japan, Edo period (1615\u20131868)", file: 'haste-b.jpg', why: "Travelers sprinting through a sudden downpour: no time to wait." },
  },
  together: {
    a: { id: 152265, accession: "1985.145", title: "אתר בנייה באמסטרדם", titleEn: "Construction Site in Amsterdam", artist: "ג'ורג' הנדריק ברייטנר", artistEn: "George Hendrik Breitner", date: "c. 1902", culture: "Netherlands", file: 'together-a.jpg', why: "A crew of laborers working side by side to dig a city foundation." },
    b: { id: 144270, accession: "1969.109", title: "פאולוס הנזיר", titleEn: "Saint Paul the Hermit", artist: "מטיה פרטי", artistEn: "Mattia Preti", date: "c. 1662\u201364", culture: "Italy", file: 'together-b.jpg', why: "A lone hermit in the wilderness, needing no one." },
  },
  like: {
    a: { id: 153797, accession: "1987.9.1", title: "אווזי בר", titleEn: "Wild Geese", artist: "קאנו סנראקו", artistEn: "Kano Sanraku", date: "late 1500s-early 1600s", culture: "Japan, Edo period (1615\u20131868)", file: 'like-a.jpg', why: "A flock of geese of one kind gathered together on the shore." },
    b: { id: 152252, accession: "1985.134", title: "דרקון ונמר", titleEn: "Dragon and Tiger", artist: "סוגה ניצ'וקואן", artistEn: "Soga Nichokuan", date: "early to mid-1600s", culture: "Japan, Edo period (1615\u20131868)", file: 'like-b.jpg', why: "Dragon and tiger, sky and earth: opposites that define each other." },
  },
  silence: {
    a: { id: 79581, accession: "2015.472", title: "בודהידהרמה", titleEn: "Bodhidharma", artist: "אונקיי אייי", artistEn: "Unkei Eii", date: "early to mid-1500s", culture: "Japan, Muromachi period (1392\u20131573)", file: 'silence-a.jpg', pos: '50% 88%', why: "Bodhidharma in wordless meditation, lips sealed." },
    b: { id: 135295, accession: "1958.306", title: "ישו מטיף", titleEn: "Christ Preaching ('La Petite Tombe')", artist: "רמברנדט ואן ריין", artistEn: "Rembrandt van Rijn", date: "c. 1652", culture: "Netherlands", file: 'silence-b.jpg', why: "Christ preaching to a gathered crowd: the power of the spoken word." },
  },
  looks: {
    a: { id: 147441, accession: "1973.18", title: "כד אחסון", titleEn: "Storage Jar", artist: "אמן לא ידוע, יפן", artistEn: "Unknown", date: "late 1300s\u20131400s", culture: "Japan, Muromachi period (1392\u20131573)", file: 'looks-a.jpg', why: "A plain, rough storage jar, prized for what it holds and its humble beauty." },
    b: { id: 135875, accession: "1959.38", title: "דיוקן צ'רלס השני", titleEn: "Portrait of King Charles II of England", artist: "פיליפ דה שמפן", artistEn: "Philippe de Champaigne", date: "1653", culture: "France", file: 'looks-b.jpg', why: "A king in gleaming armor and silk sash: splendor on display." },
  },
  distance: {
    a: { id: 98252, accession: "1917.93", title: "יציאה מקשימה", titleEn: "Departure from Kashima", artist: "אמן לא ידוע, יפן", artistEn: "Unknown", date: "1336\u201392", culture: "Japan, Nanbokuch\u014d period (1336\u201392)", file: 'distance-a.jpg', pos: '50% 55%', why: "A departure on horseback, setting out and leaving behind." },
    b: { id: 314365, accession: "2018.114", title: "הגיבורה שמחכה לאהובה", titleEn: "The Heroine Who Waits Anxiously for Her Absent Lover: Utka Nayika", artist: "אמן לא ידוע, צפון הודו", artistEn: "Unknown", date: "c. 1760\u201365", culture: "Northern India, Pahari kingdoms", file: 'distance-b.jpg', why: "A heroine waiting anxiously for her absent lover: longing grows in absence." },
  },
  money: {
    a: { id: 144397, accession: "1969.169", title: "מטבע זהב של הנרי השביעי", titleEn: "Sovereign: Henry VII (obverse); Shield of Arms in Tudor Rose (reverse)", artist: "טביעה אנגלית", artistEn: "Unknown", date: "1504\u20139", culture: "England, Henry VII, 1485-1509", file: 'money-a.jpg', why: "A gold sovereign, wealth itself, with the enthroned king." },
    b: { id: 148222, accession: "1975.21", title: "שיחה בבקתת קש", titleEn: "Conversation in a Thatched Hut", artist: "אמן לא ידוע, סין", artistEn: "Unknown", date: "late 1200s", culture: "China, Southern Song dynasty (1127-1279)", file: 'money-b.jpg', why: "Scholars talking in a thatched hut: contentment without riches." },
  },
  fate: {
    a: { id: 106088, accession: "1924.195", title: "בוקר אחרי סערה בים", titleEn: "Early Morning After a Storm at Sea", artist: "וינסלו הומר", artistEn: "Winslow Homer", date: "1900\u20131903", culture: "United States", file: 'fate-a.jpg', why: "Waves crashing after a storm: forces no one controls." },
    b: { id: 142374, accession: "1966.191", title: "החורש המשכים", titleEn: "The Early Plowman", artist: "סמואל פאלמר", artistEn: "Samuel Palmer", date: "before 1861", culture: "England, 19th century", file: 'fate-b.jpg', why: "A plowman at dawn driving his team: shaping the future by labor." },
  },
  deeds: {
    a: { id: 117747, accession: "1938.37", title: "קבוצת פועלים", titleEn: "A Group of Laborers", artist: "יאן טורופ", artistEn: "Jan Toorop", date: "1899", culture: "Netherlands", file: 'deeds-a.jpg', why: "Workers with spade and saw: people defined by what they do." },
    b: { id: 121698, accession: "1942.1512", title: "מתי הכותב", titleEn: "Leaf from a Lectionary with St. Matthew", artist: "כתב יד ביזנטי", artistEn: "Unknown", date: "1057\u20131063", culture: "Byzantium, Constantinople", file: 'deeds-b.jpg', why: "The evangelist Matthew writing: the power of the word." },
  },
  neighbors: {
    a: { id: 148965, accession: "1977.122", title: "חג בכפר", titleEn: "Village Festival", artist: "דויד טנירס", artistEn: "David Teniers", date: "c. 1646\u201350", culture: "Flanders", file: 'neighbors-a.jpg', why: "A village feast in the street, neighbors dancing together." },
    b: { id: 439428, accession: "2021.72", title: "בית עם גדר כלונסאות", titleEn: "Homestead with picket fence and flowers", artist: "צלם לא ידוע, אמריקה", artistEn: "Unknown", date: "c. 1857\u201365", culture: "America", file: 'neighbors-b.jpg', why: "A house behind a white picket fence: good fences make good neighbors." },
  },
  risk: {
    a: { id: 87275, accession: "2017.218", title: "אישה עם כלוב ציפור", titleEn: "Seated Woman Holding a Bird Cage", artist: "פרנסואה בושה", artistEn: "Fran\u00e7ois Boucher", date: "probably 18th century", culture: "France", file: 'risk-a.jpg', why: "A woman holding a small bird cage: the bird in the hand." },
    b: { id: 126769, accession: "1949.186", title: "קרב בין נמר לתאו", titleEn: "Fight Between a Tiger and a Buffalo", artist: "אנרי רוסו", artistEn: "Henri Rousseau", date: "1908", culture: "France, late 19th-early 20th Century", file: 'risk-b.jpg', why: "A tiger leaping on a buffalo in the jungle: daring and danger." },
  },
  drop: {
    a: { id: 359246, accession: "2019.76", title: "מפל פייגה בנורווגיה", titleEn: "Feige Waterfall (Feigefossen), Lysterfjord, Norway", artist: "יוהאן כריסטיאן דאהל", artistEn: "Johan Christian Clausen Dahl", date: "1848", culture: "Norway", file: 'drop-a.jpg', why: "A waterfall pouring onto rock, carving the valley over ages." },
    b: { id: 127207, accession: "1949.526", title: "גלים נשברים", titleEn: "The Breaking Waves, Tide of September 1901", artist: "אוגוסט לפר", artistEn: "Auguste Louis Lep\u00e8re", date: "1901", culture: "France, early 20th Century", file: 'drop-b.jpg', why: "Endless breaking waves: a single drop vanishes in the sea." },
  },
  knowledge: {
    a: { id: 158152, accession: "1995.2", title: "האלכימאי מגלה את הזרחן", titleEn: "The Alchymist, in Search of the Philosopher's Stone, Discovers Phosphorus, and Prays for t", artist: "ויליאם פת'ר", artistEn: "William Pether", date: "1775", culture: "England, 18th century", file: 'knowledge-a.jpg', why: "The alchemist in his laboratory, lit by discovery." },
    b: { id: 142285, accession: "1966.12", title: "רועים ישנים", titleEn: "Sleeping Shepherds", artist: "אדריאן ואן דה ולדה", artistEn: "Adriaen van de Velde", date: "1663", culture: "Netherlands", file: 'knowledge-b.jpg', why: "Shepherds asleep under a tree beside their flock: carefree ignorance." },
  },
  change: {
    a: { id: 111654, accession: "1930.189", title: "רוח דרומית, שמיים בהירים", titleEn: "South Wind, Clear Sky, from Thirty-Six Views of Mount Fuji", artist: "קצושיקה הוקוסאי", artistEn: "Katsushika Hokusai", date: "early 1830s", culture: "Japan, Edo period (1615\u20131868)", file: 'change-b.jpg', why: "Red Fuji under clear sky: the unchanging mountain." },
    b: { id: 111648, accession: "1930.183.a", title: "מערבולות אווה", titleEn: "The Whirlpools of Awa", artist: "אוטגווה הירושיגה", artistEn: "Utagawa Hiroshige", date: "1857", culture: "Japan, Edo period (1615\u20131868)", file: 'change-a.jpg', why: "The whirlpools of Awa: water never the same twice." },
  },
  revenge: {
    a: { id: 106381, accession: "1924.432.37", title: "הצדק", titleEn: "Justice (from the Tarocchi, series B: Cosmic Principles & Virtues, #37)", artist: "אמן קלפי הטארוקי, פרארה", artistEn: "Master of the E-Series Tarocchi", date: "before 1467", culture: "Italy, Ferrara, 15th century", file: 'revenge-a.jpg', why: "Justice with sword and scales: measure for measure." },
    b: { id: 104116, accession: "1922.278", title: "שובו של הבן האובד", titleEn: "Return of the Prodigal Son", artist: "רמברנדט ואן ריין", artistEn: "Rembrandt van Rijn", date: "1636", culture: "Netherlands", file: 'revenge-b.jpg', why: "The father embracing the returning prodigal son: forgiveness." },
  },
  golden: {
    a: { id: 105216, accession: "1923.409", title: "מתינות", titleEn: "The Seven Virtues:  Temperance", artist: "הנס בורגקמאייר", artistEn: "Hans Burgkmair", date: "ca. 1510", culture: "Germany", file: 'golden-a.jpg', pos: '50% 35%', why: "Temperance, mixing water into wine: restraint and refraining." },
    b: { id: 675150, accession: "2024.32", title: "השומרוני הטוב", titleEn: "The Good Samaritan", artist: "גוסטב מורו", artistEn: "Gustave Moreau", date: "c. 1865\u201370", culture: "France", file: 'golden-b.jpg', why: "The Good Samaritan carrying the wounded stranger: actively doing good." },
  },
  home: {
    a: { id: 95275, accession: "1916.1047", title: "ערבות ובית חווה", titleEn: "Willows and Farmhouse at Sainte-Catherine-l\u00e8s-Arras", artist: "ז'אן-בטיסט קמי קורו", artistEn: "Jean Baptiste Camille Corot", date: "1871", culture: "France, 19th century", file: 'home-a.jpg', why: "A farmhouse among willows: the rooted home." },
    b: { id: 74600, accession: "2019.61", title: "שיירה במדבר", titleEn: "A Caravan in the Desert", artist: "נרסיס ברשר", artistEn: "Narcisse Berch\u00e8re", date: "c. 1860s", culture: "France, 19th century", file: 'home-b.jpg', why: "A camel caravan crossing the desert: life on the move." },
  },
  age: {
    a: { id: 149608, accession: "1979.27.1.2", title: "לאו-דזה רוכב על שור", titleEn: "Paintings after Ancient Masters: Laozi Riding an Ox", artist: "צ'ן הונגשואו", artistEn: "Chen Hongshou", date: "1598\u20131652", culture: "China, Ming dynasty (1368\u20131644)", file: 'age-a.jpg', why: "Laozi, the old sage, riding his ox." },
    b: { id: 104139, accession: "1922.299", title: "ישו בין החכמים", titleEn: "Life of the Virgin:  Christ Among the Doctors", artist: "אלברכט דירר", artistEn: "Albrecht D\u00fcrer", date: "1504\u20131505", culture: "Germany, early 16th Century", file: 'age-b.jpg', why: "The boy Jesus teaching the elders in the temple." },
  },
  truth: {
    a: { id: 103960, accession: "1922.150", title: "פי האמת", titleEn: "The Mouth of Truth", artist: "גאורג פנץ", artistEn: "Georg Pencz", date: "c. 1533\u201334", culture: "Germany", file: 'truth-a.jpg', why: "The Mouth of Truth: the liar's hand is caught." },
    b: { id: 147046, accession: "1972.69", title: "מסכת נו: אישה צעירה", titleEn: "Noh Mask: Waka-onna", artist: "אמן לא ידוע, יפן", artistEn: "Unknown", date: "1400s", culture: "Japan, Muromachi period (1392\u20131573)", file: 'truth-b.jpg', why: "A Noh mask: the serene face that conceals." },
  },
  generosity: {
    a: { id: 148955, accession: "1977.113", title: "קבצנים מקבלים נדבה", titleEn: "Beggars Receiving Alms at the Door of a House", artist: "רמברנדט ואן ריין", artistEn: "Rembrandt van Rijn", date: "1648", culture: "Netherlands", file: 'generosity-a.jpg', why: "Beggars receiving alms at a house door: giving." },
    b: { id: 145575, accession: "1971.108.5", title: "הקמצנות", titleEn: "The Seven Deadly Sins: Avarice", artist: "ג'יימס אנסור", artistEn: "James Ensor", date: "1904", culture: "Belgium, 19th-20th Century", file: 'generosity-b.jpg', why: "Avarice: grotesque figures hoarding gold." },
  },
  heart: {
    a: { id: 159609, accession: "1996.345", title: "סר ג'ון הרשל", titleEn: "Sir John Herschel (1792-1871)", artist: "ג'וליה מרגרט קמרון", artistEn: "Julia Margaret Cameron", date: "1867", culture: "England, 19th century", file: 'heart-a.jpg', why: "The astronomer Herschel, the face of reason and intellect." },
    b: { id: 113164, accession: "1932.179", title: "זוג חתנים", titleEn: "A Bridal Couple", artist: "אמן לא ידוע, דרום גרמניה", artistEn: "Unknown", date: "c. 1470", culture: "Southern Germany, 15th century", file: 'heart-b.jpg', why: "A bridal couple, hand in hand: the heart's choice." },
  },
  work: {
    a: { id: 98376, accession: "1918.112", title: "המלקטות", titleEn: "The Gleaners", artist: "ז'אן-פרנסואה מילה", artistEn: "Jean-Fran\u00e7ois Millet", date: "c. 1855\u201356", culture: "France, 19th century", file: 'work-a.jpg', why: "The gleaners bent over the field: endless labor." },
    b: { id: 168345, accession: "2010.173", title: "פועל שדה ישן", titleEn: "Sleeping Field Worker", artist: "דומיניק לואי פפטי", artistEn: "Dominque Louis Papety", date: "1842", culture: "France, 19th century", file: 'work-b.jpg', why: "A field worker asleep against his basket: the rest that renews." },
  },
  pride: {
    a: { id: 122334, accession: "1942.632", title: "דיוקן נזיר", titleEn: "Portrait of a Monk", artist: "חרארד דוד", artistEn: "Gerard David", date: "early 1500s", culture: "Flanders, Bruges", file: 'pride-a.jpg', why: "A monk with hands joined in prayer: humility." },
    b: { id: 144689, accession: "1969.31", title: "הקיסר צ'יינלונג", titleEn: "Portraits of the Qianlong Emperor and His Twelve Consorts", artist: "ג'וזפה קסטיליונה", artistEn: "Giuseppe Castiglione", date: "1736\u201370s", culture: "China, Qing dynasty (1644\u20131911), Qianlong reign (1736\u201395)", file: 'pride-b.jpg', why: "The Qianlong emperor in dragon robes: majesty and self-worth." },
  },
};
