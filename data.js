const TY={w:['廁所',0x4aa3d9,'#9ad3f0'],s:['景點',0xe8734a,'#f6b393'],r:['餐廳',0xf2b632,'#f8d77c'],m:['博物館',0x5b8fd9,'#a9c6f0'],x:['交通',0x3fb5a8,'#8fddd3']};
const CT=[
{id:'p',n:'布拉格',en:'Prague',cc:'🇨🇿 捷克',x:-14,z:-24,col:0xa8503a,d:'百塔之城，舊城、城堡區與伏爾塔瓦河沿岸步行即可串連；貨幣為捷克克朗（CZK）。'},
{id:'v',n:'維也納',en:'Vienna',cc:'🇦🇹 奧地利',x:0,z:0,col:0xd4a23c,d:'哈布斯堡的帝都，宮殿、音樂與咖啡館文化並存；貨幣為歐元（EUR）。'},
{id:'b',n:'布達佩斯',en:'Budapest',cc:'🇭🇺 匈牙利',x:32,z:10,col:0x3d8c78,d:'多瑙河兩岸的溫泉之都，布達城堡區與佩斯市區隔河相望；貨幣為福林（HUF）。'},
{id:'k',n:'布拉提斯拉瓦',en:'Bratislava',cc:'🇸🇰 斯洛伐克',x:16,z:-2,col:0x5b7fb8,d:'多瑙河畔的小而美首都，舊城步行半天即可逛完，離維也納只要約 1 小時；貨幣為歐元（EUR）。'},
{id:'c',n:'CK 小鎮',en:'Český Krumlov',cc:'🇨🇿 捷克',x:-31,z:-8,col:0xb83a4b,d:'南波希米亞的中世紀小鎮，伏爾塔瓦河在舊城外繞成 S 形河灣，城堡高踞在岩壁上；整個歷史中心列入世界遺產，步行即可逛完。從布拉格搭直達巴士約 2.5–3 小時；貨幣為捷克克朗（CZK）。'}];
// [city,type,name,icon,rows,desc,rating]
const P=[
['p','s','布拉格城堡','🏰',[['開放時間','庭院 6:00–22:00（4–10月）；古蹟內部約 9:00–17:00（冬季提早）'],['票價','Circuit B 約 350 CZK；Circuit A 約 450 CZK']],'世界最大古城堡群之一，含聖維特大教堂、舊皇宮與黃金巷。'],
['p','s','查理大橋','🌉',[['開放時間','全天開放'],['票價','免費']],'14 世紀石橋，兩側 30 座巴洛克雕像；清晨或夜間人潮最少。'],
['p','s','舊城廣場與天文鐘','🕰️',[['開放時間','鐘塔 週二–日 9:00–21:00、週一 11:00–21:00；整點報時'],['票價','廣場免費；塔樓登頂約 300 CZK']],'15 世紀天文鐘每到整點有十二使徒遊行，是布拉格最熱鬧的地標。'],
['p','m','布拉格猶太博物館','🕍',[['開放時間','週日–五 9:00–18:00（冬季提早）；週六休'],['票價','聯票約 550 CZK']],'含老新會堂、舊猶太墓地等多處古蹟的聯票，建議預留半天。'],
['p','m','國家博物館','🏛️',[['開放時間','每日 10:00–18:00'],['票價','主館約 300 CZK']],'位於瓦茨拉夫廣場上方的新文藝復興建築，館藏自然史與捷克歷史。'],
['p','r','Lokál Dlouhááá','🍺',[['營業時間','11:00–01:00（週日至 24:00）'],['餐點','Svíčková 奶油牛肉、炸起司、Pilsner Urquell 現打啤酒'],['價位','主菜約 250–400 CZK']],'連鎖捷克小酒館，啤酒新鮮、份量大，當地人與遊客都愛。','約 4.5'],
['p','r','Café Savoy','☕',[['營業時間','約 8:00–22:30'],['餐點','早餐、自製甜點、傳統捷克菜'],['價位','約 300–600 CZK']],'新文藝復興天花板彩繪的老咖啡館，早餐時段最受歡迎。','約 4.4'],
['p','x','布拉格市區交通','🚇',[['票券','90 分鐘約 40 CZK；24 小時約 120 CZK；72 小時約 330 CZK'],['機場','119 公車 → 地鐵 A 線 Nádraží Veleslavín 站，約 40 分鐘'],['備註','地鐵、電車、公車共用一張票，上車前先打票']],'舊城區多半可步行，城堡與維謝赫拉德可搭電車。'],
['v','s','美泉宮','👑',[['開放時間','約 8:30–17:30（7–8月延至 18:30）'],['票價','Imperial Tour 約 €27；Grand Tour 約 €31']],'哈布斯堡王朝夏宮，含茜茜公主的故事、法式庭園與動物園。'],
['v','s','聖史蒂芬大教堂','⛪',[['開放時間','週一–六 6:00–22:00、週日 7:00–22:00（參觀時段有限）'],['票價','主堂免費；南塔約 €6']],'維也納的象徵，彩色屋頂磁磚與 343 級南塔階梯。'],
['v','m','藝術史博物館 KHM','🖼️',[['開放時間','週二–日 10:00–18:00（週四至 21:00）；週一休'],['票價','約 €23']],'哈布斯堡收藏，有布勒哲爾、維梅爾、拉斐爾等名作。'],
['v','m','美景宮 Belvedere','🎨',[['開放時間','上宮每日約 9:00–18:00'],['票價','約 €20（上宮）']],'典藏克林姆《吻》，巴洛克宮殿與庭園本身就值得走一趟。'],
['v','r','Figlmüller Wollzeile','🥩',[['營業時間','約 11:00–22:00'],['餐點','維也納炸豬排 Wiener Schnitzel、馬鈴薯沙拉'],['價位','約 €20–28']],'以特大尺寸炸肉排聞名，熱門時段建議事先訂位。','約 4.3'],
['v','r','Café Central','🍰',[['營業時間','週一–六 8:00–20:00；週日 10:00–20:00'],['餐點','Melange 咖啡、蘋果卷、各式蛋糕'],['價位','咖啡約 €6；甜點約 €7–9']],'19 世紀文人聚集的百年咖啡館，旺季常需排隊。','約 4.3'],
['v','x','維也納市區交通','🚋',[['票券','24 小時約 €8；72 小時約 €17'],['機場','S7 到 Wien Mitte 約 25 分鐘，單程約 €4–5'],['備註','地鐵 U 線、電車、公車共用票券；也有跨城市旅遊券']],'內環線（Ring）周邊景點密集，電車 1／2 號沿環線行駛。'],
['b','s','國會大廈','🏛️',[['開放時間','僅導覽，英文場次每日多梯，需先預約'],['票價','非歐盟遊客約 HUF 14,000']],'新哥德式建築，可看聖斯蒂芬王冠與大階梯；導覽約 45 分鐘。'],
['b','s','漁夫堡','🗼',[['開放時間','下層全天；上層約 9:00–23:00（3/15–10/15）'],['票價','下層免費；上層約 HUF 1,800']],'布達城堡區的新羅曼式露台，可俯瞰多瑙河與國會大廈。'],
['b','s','塞切尼溫泉','♨️',[['開放時間','約 6:00–22:00'],['票價','約 HUF 12,000–14,000（依平日、更衣櫃或更衣室）']],'歐洲最大的溫泉浴場之一，室外熱水池冬季特別有感。'],
['b','m','恐怖之屋','🕯️',[['開放時間','週二–日 10:00–18:00；週一休'],['票價','約 HUF 4,000–4,500']],'記錄納粹與共產極權時期，內容沉重但值得深入了解。'],
['b','m','匈牙利國家博物館','🏺',[['開放時間','週二–日 10:00–18:00'],['票價','約 HUF 3,500']],'從建國史到近代的常設展，是理解匈牙利歷史的起點。'],
['b','r','大市集廳','🌶️',[['營業時間','週一 6–17；週二–五 6–18；週六 6–15；週日休'],['餐點','Lángos 炸餅、紅椒粉香腸、匈牙利燉牛肉湯'],['價位','Lángos 約 HUF 2,500–3,500']],'19 世紀鐵構市集，樓上美食區能一次吃到匈牙利經典小吃。','約 4.4'],
['b','r','Menza','🍲',[['營業時間','約 10:00–24:00'],['餐點','牛肉湯 Gulyás、紅椒雞 Paprikás、甜點'],['價位','主菜約 HUF 5,000–8,000']],'李斯特廣場的現代匈牙利餐館，適合傍晚小酌。','約 4.3'],
['b','x','布達佩斯市區交通','🚊',[['票券','24 小時約 HUF 2,500；72 小時約 HUF 5,500'],['機場','100E 機場快線到 Deák Ferenc tér，單程約 HUF 2,200–2,500'],['備註','地鐵、電車、公車共用；4 號電車與 2 號沿河電車風景好']],'市中心與多瑙河兩岸多半可步行，電車 2 號沿佩斯河岸行駛。']];
for(let i=P.length-1;i>=0;i--)if(P[i][1]==='x')P.splice(i,1);
const add=(c,t,txt)=>txt.trim().split('\n').forEach(l=>{const a=l.split('|');P.push(t==='r'?[c,'r',a[0],a[1],[['營業時間',a[2]],['餐點',a[3]],['價位',a[4]]],a[5],a[6]]:t==='x'?[c,'x',a[0],a[1],[['路線',a[2]],['票券',a[3]],['備註',a[4]]],a[5]]:t==='w'?[c,'w',a[0],a[1],[['開放時間',a[2]],['費用',a[3]],['備註',a[4]]],a[5]||'']:[c,'s',a[0],a[1],[['開放時間',a[2]],['票價',a[3]]],a[4]])});
add('p','s',`維謝赫拉德|🏯|公園全天；教堂約 10:00–17:00|公園免費；教堂約 90 CZK|河岸高地古堡，可遠眺城堡與河景。
瓦茨拉夫廣場|🐎|全天開放|免費|長型大道，購物與天鵝絨革命的歷史場景。
黃金巷|🏮|約 9:00–17:00（冬季至 16:00）|含在城堡門票內|城堡內的彩色小屋街，卡夫卡曾短暫居住。
聖尼古拉教堂|⛪|約 9:00–17:00|約 200 CZK|小城區的巴洛克代表，綠色圓頂。
列儂牆|🎨|全天開放|免費|不斷更新的塗鴉牆，和平與自由的象徵。
跳舞的房子|💃|外觀全天開放|外觀免費|蓋瑞設計，被稱為「琴吉與佛雷」。
佩特任瞭望塔|🗼|約 10:00–22:00|登塔約 300 CZK|縮小版艾菲爾鐵塔，可俯瞰全市。
斯特拉霍夫圖書館|📚|約 9:00–12:00、13:00–17:00|約 150 CZK|巴洛克大廳圖書館，天頂畫與古地球儀。
火藥塔|💣|約 10:00–22:00（依季節）|約 190 CZK|舊城的哥德式城門，可登塔。
市民會館|🎭|導覽約 10:00–17:00|導覽約 400 CZK|新藝術建築，內有史麥塔納廳。`);
add('p','r',`Café Louvre|☕|約 8:00–23:30|早午餐、捷克家常菜、蛋糕|約 300–500 CZK|卡夫卡與愛因斯坦光顧過的百年咖啡館。|約 4.4
Café Imperial|🥐|約 7:00–23:00|早餐、捷克料理|約 300–600 CZK|新藝術磁磚裝飾，早餐很受歡迎。|約 4.4
Pivovarský dům|🍻|約 11:00–23:30|自釀啤酒、烤豬肘、起司麵|約 250–450 CZK|自家釀造的特色啤酒館。|約 4.4
U Fleků|🍺|約 10:00–23:00|深色啤酒、烤鴨、豬肘|約 300–500 CZK|1499 年起釀酒，布拉格最老的啤酒館之一。|約 4.2
Kolkovna Olympia|🍖|約 11:00–24:00|烤豬肘、牛肉燉菜、Pilsner|約 300–500 CZK|現代風捷克餐廳，份量大。|約 4.4
Čestr|🥩|約 12:00–23:00|熟成牛排|約 500–900 CZK|自家熟成肉，肉質評價高。|約 4.6
Eska|🍞|約 8:00–23:00|酸種麵包、現代捷克菜|約 400–700 CZK|Karlín 區的人氣餐廳與麵包店。|約 4.5
Hergetova Cihelna|🌉|約 11:00–24:00|牛排、義式料理|約 500–900 CZK|河畔露台，可看查理大橋。|約 4.4
U Medvídků|🐻|約 11:30–23:00|烤鴨、豬肘、自釀啤酒|約 300–500 CZK|1466 年起的老啤酒屋。|約 4.3
Bake Shop Praha|🥖|約 7:00–19:00|麵包、可頌、三明治|約 100–200 CZK|烘焙店，適合帶路上吃。|約 4.5`);
add('p','x',`布拉格地鐵|🚇|A 綠、B 黃、C 紅三線，約 5:00–24:00，尖峰 2–5 分一班|90 分鐘約 40 CZK；24 小時約 120 CZK；72 小時約 330 CZK|上車前先打票，與電車、公車通用|三條線在市中心交會，最適合跨區移動。
布拉格電車與公車|🚋|電車 22 號經城堡區；夜間電車約 91–99 號|同一張票|電車路網密集，夜間不收班|電車 22 號是前往城堡的經典路線。
布拉格火車與機場|🚆|Praha hl.n. 主站；往 Karlštejn、Kutná Hora 約 40–70 分鐘|約 100–150 CZK（單程，依班次）|機場：119 公車接 A 線，約 40 分鐘|近郊一日遊建議從主站出發。`);
add('v','s',`霍夫堡皇宮|👑|約 9:00–17:30|Sisi 博物館約 €17–20|哈布斯堡冬宮，含茜茜公主博物館與銀器館。
國家歌劇院|🎼|導覽約每日數場|導覽約 €10–15|世界知名歌劇院，也可買站票看表演。
普拉特與大摩天輪|🎡|約 10:00–24:00（依季節）|摩天輪約 €14–15|1897 年建成的摩天輪，《第三人》場景。
卡爾教堂|⛪|約 9:00–18:00|約 €10|巴洛克圓頂教堂，可搭電梯近看壁畫。
百水公寓|🌈|外觀全天開放|外觀免費|百水先生設計的彩色公寓，沒有直線。
市立公園|🌳|全天開放|免費|有金色的約翰・史特勞斯像。
市政廳廣場|🏛️|全天開放|免費|新哥德式市政廳，冬季有聖誕市集。
卡倫山|⛰️|全天開放|免費|可俯瞰維也納與多瑙河，附近有酒莊。
嘉布遣會地下墓室|💀|約 10:00–18:00|約 €8–9|哈布斯堡皇室成員的安葬處。
納旭市場|🧺|週一至週六約 6:00–19:30|免費逛；餐點自付|維也納最大露天市場，週六有跳蚤市場。`);
add('v','r',`Plachutta Wollzeile|🍲|約 11:30–24:00|水煮牛肉 Tafelspitz|約 €25–35|招牌水煮牛肉，需訂位。|約 4.5
Zum Schwarzen Kameel|🥪|約 8:00–24:00|開放式三明治、維也納菜|約 €15–30|百年老店，兼具酒館與麵包店。|約 4.3
Café Sacher|🍫|約 8:00–22:00|Sacher 巧克力蛋糕|蛋糕約 €8–9|沙架蛋糕的原創老店，旺季排隊。|約 4.2
Café Demel|🎂|約 9:00–19:00|蛋糕、熱巧克力|約 €8–15|皇家糕點坊，櫥窗精緻。|約 4.2
Café Landtmann|☕|約 7:30–22:00|早餐、Melange、蛋糕|約 €10–20|靠近市政廳的經典咖啡館。|約 4.3
Café Sperl|♟️|約 7:00–22:00|蛋糕、早餐|約 €8–15|1880 年的老咖啡館，氣氛復古。|約 4.4
Neni am Naschmarkt|🥙|約 9:00–22:00|中東風鷹嘴豆泥、烤肉|約 €15–25|市場旁的人氣中東料理。|約 4.4
Meinl am Graben|🍷|約 9:00–24:00|精緻酒食、早午餐|約 €25–60|高級食品店與餐廳。|約 4.4
Trzesniewski|🥖|約 8:30–19:00|迷你開放式三明治|每個約 €1.5–2|一口大小三明治，維也納經典小吃。|約 4.4
Würstelstand Bitzinger|🌭|約 9:00–凌晨|香腸、麵包|約 €5–8|歌劇院旁的香腸攤，深夜也有人排。|約 4.3`);
add('v','x',`維也納地鐵|🚇|U1、U2、U3、U4、U6 五線，約 5:00–24:30，週末夜間發車|24 小時約 €8；72 小時約 €17|與電車、公車通用|U1／U3 交會於聖史蒂芬廣場。
維也納電車與公車|🚋|電車 1／2 號沿環城大道；夜間 N 路公車|同一張票|1／2 號電車是便宜的環城觀光|電車也可搭配 Wiener Linien App 查班次。
維也納火車與機場|🚆|Wien Hbf 主站；機場 S7 約 25 分鐘|單程約 €4–5；跨城見城際交通|往薩爾茨堡、哈修塔特等從主站出發|ÖBB App 可買車票與早鳥價。`);
add('b','s',`英雄廣場|🗽|全天開放|免費|匈牙利千年歷史人物群像。
聖伊什特萬大教堂|⛪|約 9:00–17:45（依日期）|入場約 HUF 1,500–2,000；登頂另計|布達佩斯最大教堂，穹頂可看全景。
鏈橋|🌉|全天開放|免費|橫跨多瑙河的第一座永久橋，夜景絕美。
布達城堡|🏰|庭院全天；展館約 10:00–18:00|庭院免費；展館另計|布達山丘的皇宮建築群。
馬加什教堂|🔔|約 9:00–17:00（週日較晚）|約 HUF 3,000–3,500|彩色屋頂磁磚，內部壁畫華麗。
蓋勒特山|⛰️|全天開放|免費|山頂是 Citadella，視野極佳。
多瑙河畔的鞋|👞|全天開放|免費|紀念猶太受難者的鐵鞋雕塑。
多哈尼街猶太會堂|🕍|約 10:00–16:00（週六休）|約 HUF 8,000–10,000|歐洲最大猶太會堂。
瑪格麗特島|🌸|全天開放|免費|多瑙河中的公園島，可租自行車。
維達杭亞迪城堡|🏯|庭園全天；室內約 10:00–17:00|庭園免費|市民公園內的仿古城堡群。`);
add('b','r',`Gundel|🍽️|約 12:00–23:00|匈牙利經典菜、鵝肝|約 HUF 10,000–20,000|1894 年創立的名餐廳。|約 4.5
Café Gerbeaud|🍰|約 9:00–21:00|蛋糕、熱巧克力|約 HUF 3,000–6,000|1858 年老店，Vörösmarty 廣場旁。|約 4.2
New York Café|📖|約 9:00–24:00|早餐、蛋糕、匈牙利菜|約 HUF 5,000–10,000|號稱最美咖啡館，需訂位。|約 4.4
Mazel Tov|🥙|週一至五 12:00–23:00；週六日 12:00–24:00（強烈建議訂位）|中東菜、早午餐|約 HUF 5,000–9,000|猶太區的綠意庭院餐廳。|約 4.5
Szimpla Kert|🍻|週一至五約 15:00–4:00；週六約 12:00–4:00；週日約 9:00–4:00（週日 9:00–14:00 有農夫市集）|啤酒、調酒|飲品約 HUF 1,500–3,000|廢墟酒吧的代表，入場免費。|約 4.4
Karavan Street Food|🌭|約 11:00–22:00|街頭小吃、Lángos|約 HUF 3,000–5,000|露天美食市集。|約 4.5
Bock Bisztró|🍷|約 12:00–23:00|匈牙利現代料理、匈牙利葡萄酒|約 HUF 7,000–12,000|獲獎小酒館，需訂位。|約 4.6
Hungarikum Bistro|🍲|約 12:00–23:00|牛肉湯、紅椒雞、鵝肝|約 HUF 5,000–9,000|供應傳統匈牙利菜，評價高。|約 4.6
Café Kör|🍳|約 10:00–22:00|匈牙利家常菜、早午餐|約 HUF 5,000–9,000|聖史蒂芬教堂旁的人氣小館。|約 4.6
Nagyi Palacsintázója|🥞|約 24 小時（依分店）|匈牙利薄餅 Palacsinta|約 HUF 1,500–3,000|平價薄餅，深夜也能吃。|約 4.3`);
add('b','x',`布達佩斯地鐵|🚇|M1 黃、M2 紅、M3 藍、M4 綠；約 4:30–23:00|24 小時約 HUF 2,500；72 小時約 HUF 5,500|M1 是歐洲最早的地鐵之一|三線在 Deák Ferenc tér 交會。
布達佩斯電車與公車|🚋|2 號沿河電車；4／6 號環線；夜間公車以 9 開頭|同一張票|2 號電車沿多瑙河，可欣賞國會與城堡|觀光路線建議搭 2 號。
布達佩斯火車與機場|🚆|Keleti（東）、Nyugati（西）、Déli（南）三站|機場：100E 約 HUF 2,200–2,500|往 Szentendre、Eger 等近郊從 Nyugati 或 Batthyány tér|跨城列車多從 Keleti 出發。`);
const R=[
{a:'p',b:'v',n:'布拉格 ⇄ 維也納',rows:[['火車','ÖBB Railjet／RegioJet 約 4–4.5 小時；約 €10–30'],['巴士','FlixBus／RegioJet 約 4.5–5.5 小時；約 €10–20'],['車站','Praha hl.n. ⇄ Wien Hbf'],['備註','早鳥票便宜；熱門日座位快賣完']]},
{a:'v',b:'b',n:'維也納 ⇄ 布達佩斯',rows:[['火車','Railjet 約 2 小時 40 分，幾乎每小時一班；早鳥約 €10–25'],['巴士','約 3 小時；約 €8–15'],['車站','Wien Hbf ⇄ Budapest Keleti'],['備註','最順的一段，可當半日移動']]},
{a:'p',b:'b',n:'布拉格 ⇄ 布達佩斯',rows:[['火車','直達 EuroCity 約 6.5–7 小時；也可經維也納轉車'],['巴士','RegioJet／FlixBus 約 7–8 小時'],['車站','Praha hl.n. ⇄ Budapest Keleti'],['備註','建議路線：布拉格 → 維也納 → 布達佩斯']]}];
add('k','s',`布拉提斯拉瓦城堡|🏰|庭院約 9:00–21:00；展覽約 10:00–18:00|庭院免費；展覽約 €10|四角塔的白色方城，可俯瞰多瑙河。
聖馬丁大教堂|⛪|約 9:00–18:00（週日午後開放）|主堂免費；部分區域另計|曾是匈牙利國王的加冕教堂。
米歇爾門|🗼|約 10:00–18:00（依季節）|約 €5–6|舊城僅存的中世紀城門，可登頂。
主廣場與舊市政廳|🏛️|廣場全天；博物館約 10:00–17:00|廣場免費；博物館約 €6–8|舊城核心，周邊咖啡館林立。
藍教堂|💙|約 7:00–19:00（彌撒時不可參觀）|免費|新藝術風格的藍色教堂，聖伊莉莎白教堂。
UFO 瞭望塔|🛸|約 10:00–22:00|約 €10–15|新橋上的飛碟造型塔，附餐廳。
總統府|🏯|花園約 6:00–22:00|花園免費|洛可可風的 Grassalkovich 宮。
Slavín 紀念碑|🎖️|全天開放|免費|山丘上的紀念碑，可看全市景觀。
斯洛伐克國家劇院|🎭|依表演場次|票約 €10–60|新文藝復興風格的歌劇與芭蕾劇院，前有噴泉。
Čumil 雕像|🔧|全天開放|免費|從下水道探頭的工人，舊城趣味地標。`);
add('k','r',`Slovak Pub|🥔|約 10:00–24:00|馬鈴薯麵疙瘩 halušky、豬排、啤酒|主菜約 €8–15|傳統斯洛伐克料理，份量大。|約 4.4
Modrá Hviezda|🍷|約 11:00–23:00|烤鴨、羊排、葡萄酒|約 €15–30|城堡下方的老房子，氣氛浪漫。|約 4.5
Prašná Bašta|🏰|約 11:00–23:00|傳統菜、啤酒|約 €10–20|位於中世紀塔樓內。|約 4.4
Café Mayer|☕|約 9:00–22:00|咖啡與蛋糕|約 €5–12|主廣場旁的老咖啡館。|約 4.3
Koliba Kamzík|🌲|約 11:00–23:00|羊乳酪麵疙瘩、烤肉|約 €10–20|山上的木屋式傳統餐廳。|約 4.3
Bistro St. Germain|🥐|約 8:00–22:00|早午餐、可頌|約 €8–18|舊城內的法式小餐館。|約 4.4
Zylinder|🎩|約 9:00–23:00|咖啡、午餐套餐|約 €8–18|歷史建築裡的咖啡餐廳。|約 4.3
Meštiansky Pivovar|🍺|約 11:00–24:00|自釀啤酒、烤肉|約 €10–20|自家釀造的啤酒館。|約 4.4`);
add('k','x',`布市電車|🚋|電車與無軌電車串聯舊城與新城|60 分鐘票約 €1.5；24 小時約 €6|可用手機買票|沒有地鐵，電車是主要市區交通。
布市公車與機場|🚌|61 公車往機場約 30 分鐘；夜間公車|同一套票價|機場在市區東北約 10 公里|機場班次少，常搭火車轉維也納機場。
布市火車|🚆|Hlavná stanica 主站、Petržalka 站|維也納約 €10–17；布達佩斯約 €12–25|往維也納約 1 小時；往布達佩斯約 2 小時 40|主站離舊城約 1.5 公里，可搭電車。`);
R.push({a:'v',b:'k',n:'維也納 ⇄ 布拉提斯拉瓦',rows:[['火車','區域列車約 1–1.25 小時，每小時 1–2 班；約 €10–17'],['巴士','FlixBus 約 1–1.5 小時；約 €5–12'],['船','多瑙河高速船約 75 分鐘，約 €30 起'],['車站','Wien Hbf ⇄ Bratislava hl.st.']]},
{a:'k',b:'b',n:'布拉提斯拉瓦 ⇄ 布達佩斯',rows:[['火車','直達列車約 2.5–3 小時；約 €12–25'],['巴士','約 2.5–3 小時；約 €7–15'],['車站','Bratislava hl.st. ⇄ Budapest Keleti'],['備註','建議路線：布拉格 → 維也納 → 布拉提斯拉瓦 → 布達佩斯']]},
{a:'p',b:'k',n:'布拉格 ⇄ 布拉提斯拉瓦',rows:[['火車','直達列車約 4–4.5 小時；約 €12–30'],['巴士','RegioJet／FlixBus 約 4.5–5.5 小時；約 €10–25'],['車站','Praha hl.n. ⇄ Bratislava hl.st.'],['備註','也可經維也納轉車']]});
const XY={p:[[-1.4,.8],[-.4,-.1],[0,0],[-.2,.2],[.7,-1],[.1,.4],[-.8,-1.2],[.1,-3.3],[.6,-.9],[-1.3,.85],[-.8,.1],[-.8,-.2],[0,-1.9],[-1.8,-.5],[-2.1,.4],[.5,.05],[.6,-.1],[-.1,-.7],[1,.2],[.4,-1.7],[-.1,-1.3],[-.7,-1.5],[-1.1,-.6],[2,1.3],[-.75,-.05],[-.1,-.5],[.1,.3],[.3,-.5],[-1.2,.5],[1,-1]],
v:[[-5,-2.8],[0,0],[-1.4,-.4],[1.5,-1.7],[.3,.1],[-.9,.5],[-.8,-.2],[-.1,-.9],[2.5,1.5],[.5,-1.5],[1.9,-.6],[1,-.7],[-1.3,.7],[-1,8],[-.2,-.5],[-.9,-1.3],[.4,.15],[-.5,.3],[-.1,-.8],[-.55,.4],[-1.2,.6],[-1.3,-1.4],[-.9,-1.2],[-.3,.2],[-.35,.05],[-.5,-.55],[.05,.1],[-1,.4],[.9,-2.5]],
b:[[.8,1],[-.6,.45],[3.1,2.3],[1.8,1],[1.4,-1],[1.3,-1.8],[1.9,.9],[2.9,1.9],[.8,.2],[0,0],[-.7,-.5],[-.7,.55],[-.9,-1.8],[.3,.7],[1.2,-.2],[.1,2.6],[3,1.5],[3.2,2.2],[.6,0],[1.7,.1],[1.2,.3],[1.4,.1],[1.3,.2],[1.7,.35],[1,.15],[.8,.3],[1.7,.7],[.9,-.05],[.35,-.3],[2.3,-.4]],
k:[[-.9,-.45],[-.3,-.5],[0,.25],[0,0],[1,0],[-.5,-.7],[-.1,.7],[-1,.6],[.2,-.2],[.05,-.1],[.2,.6],[-.6,-.4],[0,.3],[0,0],[-2.5,2.3],[0,.1],[0,-.05],[-1.8,.9],[.1,-.8],[-.9,-1.5],[.4,1.6]]};
XY.c=[];
const RV={p:[[.5,-4],[.2,-2.5],[-.4,-1],[-.5,0],[-.1,1.2],[1.2,2],[2.5,2.3]],v:[[-4,2.5],[-2,1.5],[-.5,1.1],[1,.9],[2.5,.4],[4,.8]],b:[[.3,4],[.1,2],[0,.5],[0,-.5],[-.4,-2.5],[-.8,-4]],k:[[-4,-1.2],[-2,-1],[0,-1.1],[2,-1.4],[4,-1.8]]};
RV.c=[[-4.2,-2.6],[-2.8,-1.7],[-1.7,-1],[-1.15,.1],[-1.25,1.2],[-.3,1.95],[1.1,1.9],[1.9,.9],[1.75,-.5],[2,-1.9],[3.3,-2.8],[4.5,-3.1]];
const prj=(e,n)=>{const x=e*1.3,z=-n*1.3,L=Math.hypot(x,z);if(L<1e-6)return[0,0];const L2=6.2*Math.tanh(L/5.4);return[x/L*L2,z/L*L2]};

add('b','r',`Rákóczi 市場（Rákóczi tér 市集）|🍷|週一 6:00–16:00；週二至五 6:00–18:00；週六 6:00–13:00；週日休|牆上與木桶的現倒葡萄酒（folyóbor）、生鮮、香腸、起司、麵包|酒價現場標示，我沒查到確切價格|Rákóczi tér 7–9，在地人買菜的市場，入口左側有現倒酒的酒攤；地鐵 M4 Rákóczi tér 站旁。|
`);
XY.b.push([2.2,-.9]);
const rj={'p-v':[['布拉格→維也納','06:01→10:21；09:01→13:18；13:01→17:21；16:01→20:18'],['維也納→布拉格','06:39→10:56；10:39→14:56；14:39→19:00；17:36→21:58']],
'v-b':[['維也納→布達佩斯','07:34→09:58；10:27→12:58；13:27→15:58；17:27→19:58'],['布達佩斯→維也納','07:58→10:32；11:58→14:32；14:58→17:32；17:58→20:27'],['備註','抵離站在 Budapest Déli／Kelenföld 一帶，不是 Keleti，上車前請確認']],
'p-b':[['布拉格→布達佩斯','06:01→約 12:58；13:01→約 19:58（經維也納，每日 2 班）'],['備註','回程時刻我沒查到，請看 regiojet.com']],
'p-k':[['布拉格⇄布市','每日約 4 班、約 4 小時 15 分；最新時刻我沒查到，請看 regiojet.com']]};
R.forEach(r=>{const k=r.a+'-'+r.b;if(rj[k])r.rj=rj[k]});
const ROAD={p:[[[-1.4,.8],[-.8,.1],[-.5,0],[0,0],[.3,-.3],[.7,-1]],[[-.6,-.8],[.2,-.45]]],
v:[[[-1,1.1],[-1.5,.7],[-1.6,-.2],[-1.4,-.6],[-.5,-.95],[.3,-.85],[.9,-.4],[1.1,.5],[1,.9]],[[-.9,-.3],[-2.5,-.9],[-4,-1.6]],[[.4,.9],[1.4,1.1],[2.5,1.5]]],
b:[[[.3,-1.6],[1.2,-1],[1.9,-.3],[1.9,.5],[1.2,1.6],[.15,2.3]],[[.8,.3],[1.8,1],[2.9,1.9]],[[.6,-.6],[.6,.1],[.65,.8]]],
k:[[[-.6,-.5],[-.3,-.1],[.2,.5]],[[-.8,-.8],[0,-.9],[1,-.9]],[[0,.2],[.3,.6],[.5,1]]]};
const PARK={p:[[-1.8,-.5,.8],[.1,-3.3,.5],[0,1.6,.7]],v:[[3,1,1.3],[1,-.7,.3],[-5,-2.8,1.1],[1.5,-1.9,.4],[-1,8,1.5]],b:[[.1,2.6,.5],[3,2.1,.8],[-.9,-1.8,.5],[-.65,0,.4]],k:[[-1,.6,.4],[-.9,-.45,.35],[-2.5,2.3,1],[.1,-1.9,.5]]};
PARK.c=[[-3,.3,.9],[2.4,-1.9,.6],[.2,2.7,.5]];
const LBL={p:[[.1,-2.5,'伏爾塔瓦河'],[-1.8,-.5,'佩特任山'],[.1,-3.3,'維謝赫拉德'],[.3,.3,'舊城'],[-1.4,1.1,'城堡區']],
v:[[-.4,1.4,'多瑙運河'],[0,.3,'內城'],[1.1,-.2,'環城大道'],[3,1,'普拉特'],[-5,-2.8,'美泉宮']],
b:[[-.5,-2.3,'多瑙河'],[.1,2.6,'瑪格麗特島'],[1.9,.2,'大環路'],[3,2.1,'市民公園'],[-.9,-1.8,'蓋勒特山'],[-.65,.2,'布達城堡區']],
k:[[1.5,-1.4,'多瑙河'],[0,.3,'舊城'],[-.9,-.45,'城堡'],[-2.5,2.3,'Kamzík 山']]};
LBL.c=[[.3,2,'伏爾塔瓦河'],[0,-.1,'舊城'],[-1.9,.9,'城堡'],[-3,.3,'城堡花園']];
function cityMap(id){const S=1024,R=6.7,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d'),T=(e,n)=>{const q=prj(e,n);return[(q[0]/R*.5+.5)*S,(q[1]/R*.5+.5)*S]},u=S/(2*R);
 x.beginPath();x.arc(S/2,S/2,S/2,0,6.283);x.clip();x.fillStyle=PC[id].bg;x.fillRect(0,0,S,S);
 x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;for(let i=0;i<=16;i++){x.beginPath();x.moveTo(i*S/16,0);x.lineTo(i*S/16,S);x.moveTo(0,i*S/16);x.lineTo(S,i*S/16);x.stroke()}
 PARK[id].forEach(p=>{const c=T(p[0],p[1]);x.fillStyle='rgba(80,150,95,.7)';x.beginPath();x.arc(c[0],c[1],p[2]*1.45*u,0,6.283);x.fill()});
 const line=(pts,w,col)=>{const cu=new THREE.CatmullRomCurve3(pts.map(q=>{const c=T(q[0],q[1]);return new THREE.Vector3(c[0],c[1],0)}));x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();cu.getPoints(80).forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke()};
 
 const lineS=(pts,w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';x.beginPath();pts.forEach((p,i)=>{const cx=(p.x/R*.5+.5)*S,cy=(p.z/R*.5+.5)*S;i?x.lineTo(cx,cy):x.moveTo(cx,cy)});x.stroke()};lineS(RVP[id],44,'#3b8fc4');lineS(RVP[id],30,'#6cc0ee');
 {const L=LAY[id],P2=q=>[(q[0]/R*.5+.5)*S,(q[1]/R*.5+.5)*S],seg=(w,col)=>{x.lineCap='round';x.strokeStyle=col;x.lineWidth=w;L.E.forEach(e=>{const a=P2(L.pp[e[0]]),b=P2(L.pp[e[1]]);x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()})};
  seg(44,PC[id].re);seg(36,PC[id].rd);
  L.pp.forEach(q=>{const c=P2(q);x.fillStyle=PC[id].rd;x.strokeStyle=PC[id].re;x.lineWidth=5;x.beginPath();x.arc(c[0],c[1],28,0,6.283);x.fill();x.stroke()})}
 {const NM={p:'伏爾塔瓦河 Vltava',v:'多瑙河 Donau',b:'多瑙河 Duna',k:'多瑙河 Dunaj',c:'伏爾塔瓦河 Vltava'}[id],pts=RVP[id];x.save();x.font='bold 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=6;[].forEach(f=>{const i=Math.floor(f*(pts.length-1)),a=pts[Math.max(0,i-3)],b=pts[Math.min(pts.length-1,i+3)],c=pts[i],cx=(c.x/R*.5+.5)*S,cy=(c.z/R*.5+.5)*S;let ang=Math.atan2(b.z-a.z,b.x-a.x);if(ang>Math.PI/2||ang<-Math.PI/2)ang+=Math.PI;x.save();x.translate(cx,cy);x.rotate(ang);x.strokeStyle='#14385a';x.strokeText(NM,0,0);x.fillStyle='#e6f6ff';x.fillText(NM,0,0);x.restore()});x.restore()}
 x.font='bold 26px sans-serif';x.textAlign='center';x.lineWidth=5;[].forEach(l=>{const c=T(l[0],l[1]);x.strokeStyle=PC[id].re;x.strokeText(l[2],c[0],c[1]);x.fillStyle='#e8eefc';x.fillText(l[2],c[0],c[1])});
 const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t}
const poly=[[-28,-36],[-2,-38],[10,-26],[26,-12],[46,-4],[46,18],[32,26],[8,16],[-10,12],[-26,8],[-40,4],[-46,-8],[-44,-22],[-34,-32]];
const inP=(x,z)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
add('p','r',`Pork's Mostecká|🍖|每日 12:00–23:30|脆皮烤豬腳、烤豬肋排、豬腳堡、Pilsner 與 Kozel 生啤|豬腳約 469 CZK；肋排約 379 CZK；啤酒約 75 CZK（為較早的報導價格，現價可能更高）|查理大橋旁 Mostecká 16，常需排隊或先訂位；另有 Vodičkova 分店。|約 4.7`);
XY.p.push([-.65,.1]);
const RN={
'p-v':{t:'國鐵與 RegioJet 時刻',rows:[['火車','ČD／ÖBB Railjet 約每 2 小時一班，約 4 小時 05 分（首班約 6 點、2026 年新增約 19:30 的較晚班）；RegioJet 每日 4 班，約 4 小時 15–20 分'],['車站','Praha hl.n. ⇄ Wien Hbf'],['巴士','FlixBus／RegioJet 約 4 小時 15 分–4 小時 45 分']],rj:[['RegioJet 布→維','06:01→10:21；09:01→13:18；13:01→17:21；16:01→20:18'],['RegioJet 維→布','06:39→10:56；10:39→14:56；14:39→19:00；17:36→21:58'],['Railjet','約每 2 小時一班，確切時刻請查 cd.cz 或 oebb.at']]},
'v-b':{t:'國鐵與 RegioJet 時刻',rows:[['火車','ÖBB／MÁV Railjet 與 EuroCity 每小時一班，約 2 小時 37–40 分，到 Budapest Keleti；RegioJet 每日 4 班，約 2 小時 40–47 分，到 Budapest Déli'],['價格','ÖBB 早鳥 €19.90 起（MÁV 官網 €13 起）、當日全價約 €52.70；RegioJet €9 起'],['車站','Wien Hbf ⇄ Budapest Keleti／Déli']],rj:[['RegioJet 維→布','07:34→10:14；10:27→13:14；13:27→16:14；17:27→20:14'],['RegioJet 布→維','Déli 07:45→10:32；11:45→14:32；14:45→17:32；17:45→20:27'],['ÖBB／MÁV','維也納 Hbf 約每小時 :40 發，Keleti 約 :19 抵（如 08:40→11:19、09:40→12:19）；12/13 起時刻略調']]},
'p-b':{t:'國鐵直達與 RegioJet 時刻',rows:[['國鐵直達','ČD／ZSSK／MÁV 的 Railjet、EuroCity 與 ComfortJet，約每 2 小時一班，經布拉提斯拉瓦，全程約 6 小時 52 分，到 Budapest Nyugati'],['RegioJet','每日 3 班，經維也納，全程約 7 小時 13 分，到 Budapest Déli'],['夜車','Metropol 21:58 發，隔天 08:29 抵 Nyugati'],['價格','ČD 早鳥約 €21（2 等）、當日全價約 €70；RegioJet €19.90 起']],rj:[['國鐵 布→布達佩斯','05:36→12:28；07:36→14:28；09:36→16:28；11:36→18:28；13:36→20:28；15:34（Holešovice 站）→22:28'],['國鐵 布達佩斯→布','05:30→12:23；09:30→16:23；11:30→18:23；13:30→20:23；15:30→22:23；07:30（ComfortJet）→14:25（Holešovice 站）'],['RegioJet 布→匈','06:01→13:14；09:01→16:14；13:01→20:14'],['RegioJet 匈→布','Déli 07:45→14:56；11:45→19:00；14:45→21:58']]},
'v-k':{t:'國鐵（ÖBB REX）時刻',rows:[['火車','ÖBB REX 直達，約 56 分（2025 年 10 月電氣化後縮短），每小時最多 2 班'],['價格','單程約 €12.70（固定票價，可當天買）'],['車站','Wien Hbf ⇄ Bratislava hl.st.（部分班次停 Petržalka）'],['其他','巴士約 55 分；Twin City Liner 船約 75 分（季節性）']],rj:[['ÖBB REX','維也納 Hbf 每小時 :14 發、布拉提斯拉瓦 :10 抵（如 09:14→10:10、10:14→11:10）']]},
'k-b':{t:'國鐵時刻（布拉格－布達佩斯同線）',rows:[['火車','ZSSK／MÁV 直達，約每 2 小時一班，約 2 小時 23–26 分，到 Budapest Nyugati'],['價格','MÁV 早鳥 €10.50 起、當日全價約 €25'],['車站','Bratislava hl.st. ⇄ Budapest Nyugati'],['備註','RegioJet 在此段我沒查到火車']],rj:[['布拉提斯拉瓦→布達佩斯','08:05→10:28；10:05→12:28；12:05→14:28；14:05→16:28；16:05→18:28；18:05→20:28；20:05→22:28'],['布達佩斯→布拉提斯拉瓦','05:30→07:55；07:30→09:55；09:30→11:55；11:30→13:55；13:30→15:55；15:30→17:55；17:30→19:55；19:30→21:55']]},
'p-k':{t:'國鐵與 RegioJet',rows:[['國鐵直達','ČD／ZSSK 約每 2 小時一班，約 4 小時 26 分'],['價格','ČD 早鳥 €15 起（2 等）、當日全價約 €45'],['RegioJet','每日有數班（經 Břeclav 與維也納一帶），確切時刻我沒查到，請看 regiojet.com'],['車站','Praha hl.n. ⇄ Bratislava hl.st.']],rj:[['國鐵 布→布市','05:36→10:02；07:36→12:02；09:36→14:02；11:36→16:02；13:36→18:02'],['國鐵 布市→布','05:58→10:23；07:58→12:23；11:58→16:23；13:58→18:23；15:58→20:23；17:58→22:23']]}};
R.forEach(r=>{const x=RN[r.a+'-'+r.b];if(x){r.rows=x.rows;r.rj=x.rj;r.rjt=x.t}});
R.push({a:'p',b:'c',n:'布拉格 ⇄ CK 小鎮',rows:[['巴士','RegioJet 與 FlixBus 直達，約 2 小時 30 分–3 小時 20 分；約每小時 1 班（依星期與時段不同）；約 CZK 210–380（約 €9–16）'],['出發站','布拉格：Na Knížecí（Anděl 地鐵站旁）、ÚAN Florenc、Roztyly；CK 小鎮：巴士總站或 Špičák 站'],['火車','每日有少數 ČD 直達車（約 2 小時 30 分，約 CZK 280–600），多數班次需在 České Budějovice 轉車，全程約 4 小時；火車站離舊城較遠'],['備註','巴士通常比火車快又方便，旺季先訂位；2026 年 11 月 3 日整理自 Omio、FlixBus、ckrumlov.info，時刻請以 regiojet.com、flixbus.com、cd.cz 為準']]});
add('p','r',`Havelské tržiště（哈維爾市場）|🥬|週一至六 7:00–19:00；週日 8:00–18:30|露天市集：蔬果、花卉、捷克手工藝與小吃|蔬果與小吃自付，價格依攤位|Havelská 13，舊城唯一保留的市場，起源可追溯到 1232 年。|
Pražská tržnice（Holešovice 市場）|🏪|22 號廳週一至五 7:30–17:00、週六 7:30–14:00、週日休；戶外園區全天|蔬果、肉品、起司、熟食與市集活動|攤位自訂價格|Bubenské nábřeží 306/13，布拉格最大的全年市場廳，22 號廳約 80 個攤位。|`);
XY.p.push([.2,-.25],[2.2,2.6]);
add('b','r',`Instant-Fogas 綜合體|💃|每日 18:00–06:00|7 個舞廳、18 間酒吧、雞尾酒與啤酒|入場多半免費（活動日另計）；酒約 HUF 1,500–3,000|Akácfa u. 49–51，歐洲最大的廢墟酒吧派對綜合體，凌晨 2 點左右最熱鬧。|
Kőleves Kert|🌿|每日 11:30–23:00|啤酒、雞尾酒、匈牙利家常菜|飲品約 HUF 1,500–3,000|Kazinczy 街的綠意庭院廢墟酒吧，比 Szimpla 安靜。|
Élesztőház|🍺|週日、一 15:00–01:00；週二、三 15:00–02:00；週四至六 15:00–03:00|精釀啤酒、啤酒花園|啤酒約 HUF 1,500–2,500|Tűzoltó 街的啤酒廢墟酒吧，遊客較少。|`);
XY.b.push([1.3,.3],[1.5,.15],[1.8,-1.2]);
add('b','r',`Csendes Vintage Bar & Café（廢墟咖啡）|☕|每日約 10:00–02:00（各來源時間不一，建議出發前確認）|咖啡、早午餐、調酒|價位我沒查到，請看現場菜單|Ferenczy István utca 5，被稱為有廢墟酒吧氛圍的咖啡館，白天喝咖啡、晚上變成酒吧。|`);
XY.b.push([.9,-.6]);
add('k','r',`Stará tržnica（舊市場廳）|🏪|我沒查到確切營業時間，請看官方資訊|蔬果、乳酪、在地小吃與咖啡|攤位自訂價格|Námestie SNP 的老市場廳，布拉提斯拉瓦最具歷史的市集。|`);
XY.k.push([.1,.2]);
const RTO={},RTV={'布拉格城堡':'2026-10','查理大橋':'2026-10','舊城廣場與天文鐘':'2026-10','布達城堡':'2026-10','布拉提斯拉瓦城堡':'2026-10'};
const RT={'布拉格國立歌劇院':4.7,'匈牙利國家歌劇院':4.8,'布拉格城堡':4.7,'查理大橋':4.8,'舊城廣場與天文鐘':4.7,'布拉格猶太博物館':4.6,'國家博物館':4.6,'維謝赫拉德':4.6,'瓦茨拉夫廣場':4.4,'黃金巷':4.3,'聖尼古拉教堂':4.7,'列儂牆':4.4,'跳舞的房子':4.4,'佩特任瞭望塔':4.6,'斯特拉霍夫圖書館':4.7,'火藥塔':4.5,'市民會館':4.6,
'美泉宮':4.7,'聖史蒂芬大教堂':4.7,'藝術史博物館 KHM':4.8,'美景宮 Belvedere':4.6,'霍夫堡皇宮':4.6,'國家歌劇院':4.7,'普拉特與大摩天輪':4.5,'卡爾教堂':4.6,'百水公寓':4.3,'市立公園':4.6,'市政廳廣場':4.5,'卡倫山':4.5,'嘉布遣會地下墓室':4.5,'納旭市場':4.3,
'國會大廈':4.8,'漁夫堡':4.7,'塞切尼溫泉':4.5,'恐怖之屋':4.6,'匈牙利國家博物館':4.6,'英雄廣場':4.7,'聖伊什特萬大教堂':4.8,'鏈橋':4.8,'布達城堡':4.7,'馬加什教堂':4.7,'蓋勒特山':4.7,'多瑙河畔的鞋':4.7,'多哈尼街猶太會堂':4.7,'瑪格麗特島':4.7,'維達杭亞迪城堡':4.7,
'布拉提斯拉瓦城堡':4.5,'聖馬丁大教堂':4.6,'米歇爾門':4.6,'主廣場與舊市政廳':4.6,'藍教堂':4.6,'UFO 瞭望塔':4.2,'總統府':4.5,'Slavín 紀念碑':4.6,'斯洛伐克國家劇院':4.7,'Čumil 雕像':4.3};
add('p','s',`布拉格國立歌劇院|🎭|演出多在晚間；英語導覽僅特定日期（例如週日 12:30，名額有限）|導覽約 CZK 160–260；演出票依座位|新文藝復興風格的 Státní opera（1888 年），2020 年修復後重新開幕，位於國家博物館與中央車站附近的 Wilsonova 街。`);
XY.p.push([1.1,-.9]);
add('b','s',`匈牙利國家歌劇院|🎭|英語導覽每日 13:30、15:00、16:30（演出時段不辦導覽）|導覽約 HUF 12,000／人（含結尾迷你音樂會）；演出票依座位|Andrássy út 22，由 Miklós Ybl 設計，1884 年落成，是匈牙利最重要的新文藝復興建築之一。`);
XY.b.push([1.2,.4]);
add('v','w',`市政廳廣場公廁|🚻|有人看管的時段（依管理單位）|廁間 €0.50，小便斗免費|維也納市府 MA48 管理；來源為奧地利廣播公司報導|`);
add('v','w',`卡爾廣場公廁（新建）|🚻|我沒查到|我沒查到（維也納約八成公廁免費）|新聞報導卡爾廣場新建了固定公廁|`);
XY.v.push([-1.1,.9],[.6,-1.3]);
add('b','w',`Blaha Lujza tér 公廁|🚻|24 小時|約 HUF 250|布達佩斯污水處理廠營運，第八區|`);
add('b','w',`Mátyás tér 公廁|🚻|7:00–21:00|約 HUF 250|第八區|`);
add('b','w',`Urania 旁公廁|🚻|24 小時|約 HUF 250|第八區|`);
add('b','w',`Orczy Park 公廁|🚻|6:00–20:00|免費|第八區公園內|`);
add('b','w',`Kálvária tér 遊樂場公廁|🚻|7:00 到天黑（封閉廣場到 21:00）|免費|第八區|`);
add('b','w',`János Pál pápa tér 公廁|🚻|7:00 到天黑（封閉廣場到 21:00）|免費（2022 年 7 月起）|第八區|`);
add('b','w',`Déri Miksa 街遊樂場公廁|🚻|7:00 到天黑|免費（2022 年 12 月起）|第八區；另一座同街廁所曾故障|`);
add('b','w',`流動廁所（Teleki tér 入口旁）|🚻|24 小時|免費|第八區 5 座免費流動廁所之一|`);
XY.b.push([1.9,-.35],[2.5,-.75],[1.3,-.05],[3.9,-2.1],[3.1,-1.4],[2.1,-.45],[2.9,-1],[2.6,-1.1]);
add('k','w',`Janko Kráľ 公園公廁（Aupark 旁）|🚻|我沒查到|我沒查到|旅遊局資訊標示為無障礙公廁|`);
add('k','w',`Eurovea 購物中心廁所|🚻|隨商場營業時間|我沒查到（商場內，每層有無障礙廁所）|旅遊局資訊|`);
XY.k.push([.1,-2],[.9,-.85]);
const addM=(c,txt)=>txt.trim().split('\n').forEach(l=>{const a=l.split('|');P.push([c,'m',a[0],a[1],[['開放時間',a[2]],['票價',a[3]]],a[4]])});
add('c','s',`克魯姆洛夫城堡|🏰|庭院全年可進；導覽路線 I 為 4/1–10/31 週二至日（6–8 月 9:00–17:00、9–10 月 9:00–16:00）；路線 II 約 7–10 月（9–10 月僅週末）；11 月起導覽路線休館|路線 I 300 CZK；路線 II 260 CZK；青年（18–24）與長者 240／210 CZK；兒童（6–17）90／80 CZK（官網 2026 年票價）|伏爾塔瓦河上方的城堡群，有彩繪圓塔與五座庭院，是 CK 小鎮最醒目的地標。
巴洛克城堡劇院|🎭|季節性導覽，約 5/1–10/31 週二至日 10:00–16:00（最後一團約 15:00）；11 月起休館；日期以官網為準|約 400 CZK；青年與長者 320 CZK；兒童（6–17）120 CZK；需預約|歐洲保存最完整的巴洛克劇院之一，舞台、機關與道具都留有原件。
城堡花園|🌳|我沒查到 11 月確切時間（依季節開放）|免費|17 世紀的巴洛克花園，在城堡第五庭院之後的山坡上。
披風橋 Plášťový most|🌉|橋面開放時間我沒查到；橋內走廊屬導覽路線 II（約 7–10 月）|橋內走廊含在路線 II 門票（260 CZK）|高懸在深谷上的多層石橋，連接城堡各庭院，是拍城堡與小鎮全景的熱門位置。
斯沃諾斯蒂廣場|⛲|全天開放|免費|舊城主廣場，市政廳在 1 號屋，四周有咖啡館與餐廳；2026 年 11 月 21 日至 2027 年 1 月 6 日有降臨節與聖誕活動（官網活動日曆）。
聖維特教堂|⛪|我沒查到確切開放時間|我沒查到|哥德式三殿教堂（1408–1439 年），位於舊城的 Kostelní 街。
理髮師橋 Lazebnický most|🌉|全天開放|免費|跨伏爾塔瓦河的橋，從橋上可看河灣與城堡，節慶遊行也常在此觀賞。`);
XY.c.push([-1.7,.6],[-2.4,1],[-3.1,.2],[-1.4,.1],[0,0],[.9,.6],[-.7,-.9]);
addM('c',`城堡博物館與城堡塔樓|🗼|11/1–12/20 週二至日 9:00–15:30（自助參觀）；12/20 之後的休館期請看官網|280 CZK；青年與長者 220 CZK；兒童（6–17）80 CZK|展出統治 Krumlov 的羅森貝格、艾根貝格與施瓦岑貝格家族故事，可登塔俯瞰小鎮。
Egon Schiele Art Centrum|🎨|冬季每日（週一休）10:00–18:00，12/24 只到 16:00（依 ckrumlov.info 2025 年冬季公告）|約 CZK 220–250（各來源不一，請看官網）|奧地利畫家席勒曾在此居住與創作，展出他的生平與作品及季節展覽。
Museum Fotoateliér Seidel|📷|冬季週二至日 9:00–17:00，12:00–13:00 午休，最後入場 16:00；12/24–25 休（依 2025 年 12 月公告，11 月請再確認）|我沒查到確切票價|1905 年的新藝術風格攝影工作室，記錄 Josef 與 František Seidel 父子及波希米亞森林一帶的老照片。
克魯姆洛夫區域博物館|🏺|我沒查到確切時間|我沒查到|以歷史核心區的陶瓷模型聞名，另有考古、手工藝與民俗收藏。
木筏博物館與聖約斯特教堂|🪵|季節性開放；冬季需電話預約 +420 605 922 296（依 2026 年春季公告）|我沒查到|介紹伏爾塔瓦河木筏運輸的傳統，館內有捷克第二大的木筏模型。`);
XY.c.push([-1.4,.5],[.6,-.4],[-1,-1.1],[-.5,-.1],[-.2,1.8]);
add('c','r',`Krčma v Šatlavské|🔥|全年營業，確切時間我沒查到，請看官網|明火烤肉（烤豬腳、豬五花、牛肋排）、Budvar 啤酒、摩拉維亞葡萄酒|每人約 CZK 300（部落格估計，未核對）|中世紀地牢風格的洞穴餐廳（Horní 157，入口在 Šatlavská 巷），約 120 席，可刷卡；旺季建議先訂位。|約 4.3
Hospoda Na Louži|🍺|我沒查到最新營業時間（舊資料為每日約 10:00–23:00）|烤豬肉配麵包糰與酸菜（vepřo-knedlo-zelo）等捷克家常菜、當地 Eggenberg 啤酒|主菜約 CZK 200–350（ItiMaker 2026）|Kájovská 66，家族經營的傳統酒館，木板裝潢保存近百年。|約 4.2
Hospoda 99|🍻|我沒查到|傳統捷克料理|價位我沒查到|附設在啤酒博物館旁的酒館餐廳，看起來有點觀光化，但傳統捷克菜評價不錯（Lonely Planet）。
Kafé Forbína|☕|我沒查到|咖啡與輕食|價位我沒查到|官網介紹的劇院咖啡館，可看到小鎮全景。`);
XY.c.push([-.4,.1],[.7,-.8],[1.3,.4],[.1,1]);
add('c','x',`克魯姆洛夫巴士與火車站|🚆|布拉格⇄CK：RegioJet、FlixBus 直達巴士；火車多半在 České Budějovice 轉車|巴士約 CZK 210–380；火車約 CZK 280–600|往維也納：FlixBus 直達約 3.5–4 小時，約 €13–45（依日期，部分班次為接駁車）|巴士總站在舊城東側（Objížďková 與 Nemocniční 街口附近）；Špičák 站離城堡與舊城較近，RegioJet 全部、FlixBus 部分班次停靠，火車站離舊城較遠。
CK 小鎮市區交通與停車|🚶|舊城與城堡以步行為主|自駕停 P1–P5、P7 自助停車場（費率我沒查到）|P5 在巴士總站旁；活動日部分道路封閉|歷史中心不大，從停車場或車站走進舊城是最順的方式。`);
XY.c.push([2.9,1.6],[-3.1,-1.5]);
add('c','w',`巴士總站公廁|🚻|全年約 5:30–22:30|我沒查到|位於巴士總站大樓內，旁邊是 P5 停車場|
霍尼街與城堡庭院公廁|🚻|我沒查到確切時間|我沒查到|官方 FAQ 列出 Horní 街、城堡第一與第四庭院；無障礙廁所在 Horní 街與第四庭院|
P1–P3 停車場公廁|🚻|5–10 月約 8:00–19:00（各場略有不同），11 月起我沒查到|我沒查到|官方停車場資訊；也有無障礙廁所|
Špičák 站公廁|🚻|我沒查到|我沒查到|官方 FAQ 列出 Špičák 巴士站有公廁|`);
XY.c.push([2.6,1.3],[-.9,.2],[-2.7,-1.7],[-1.9,-.2]);
Object.assign(RT,{'克魯姆洛夫城堡':4.7,'巴洛克城堡劇院':4.7,'城堡花園':4.6,'披風橋 Plášťový most':4.7,'斯沃諾斯蒂廣場':4.7,'聖維特教堂':4.6,'理髮師橋 Lazebnický most':4.6,'城堡博物館與城堡塔樓':4.6,'Egon Schiele Art Centrum':4.4,'Museum Fotoateliér Seidel':4.6,'克魯姆洛夫區域博物館':4.4});
const WCG={p:'布拉格：免費公廁很少，多數公共廁所約收 10–30 CZK（以現金硬幣為主）；購物中心、博物館與咖啡館的廁所通常提供給客人使用，有些要消費。各來源對特定廁所是否免費說法不一，請以 Google 地圖與現場告示為準。',
v:'維也納：市府 MA48 管理約 167–170 座固定公廁，其中約 140 座（八成以上）免費；約 27 座有人看管的設施，廁間收 €0.50、小便斗免費（例如市政廳廣場）；地鐵網路內部分廁所入口收費。市府正評估全面免費化。',
b:'布達佩斯：自動公廁多為 HUF 200–400（約 €0.5–1）；免費的多在第八區：公園與遊樂場廁所（如 Orczy Park 6:00–20:00）和 24 小時流動廁所；許多咖啡館與餐廳會在門口標示廁所是否免費。市政府官方地圖與 BudapestGO App 可篩選公廁並標示輪椅可用；購物中心與速食店通常讓顧客使用。',
k:'布拉提斯拉瓦：公共廁所不多，近年關閉過數座，常見做法是去購物中心（Eurovea 每層有無障礙廁所）、公車站、火車站或速食店；Námestie Slobody 周邊只有咖啡館的廁所且需付費。'};
WCG.c='CK 小鎮：官方資訊列出市中心的公廁在 Horní 街與城堡第一、第四庭院，另有巴士總站、Špičák 站與 P1–P3 停車場；停車場公廁僅 5–10 月開放，巴士總站大樓內的廁所全年約 5:30–22:30。收費與價格我沒查到，請以現場告示為準。';
const EVT={p:{x:-19.5,z:-10,ico:'🎭',n:'街頭藝人廣場',m:'斯梅塔納〈伏爾塔瓦〉主題（簡化合成版）',d:'布拉格市區旁的街頭藝人廣場：提線木偶、小提琴、雜耍、魔術與手風琴同時開演，中間有噴泉，觀眾圍成圈鼓掌。'},v:{x:6,z:10.5,ico:'🎻',n:'戶外音樂會',m:'貝多芬〈歡樂頌〉（簡化合成版）',d:'維也納的露天音樂會：舞台上有指揮與小提琴手，前方的舞池有華爾滋舞者，兩側坐滿觀眾，後方還有站著欣賞的人群，夜晚點起串燈。'},k:{x:14.5,z:-13.5,ico:'🎪',n:'馬戲團表演',m:'原創馬戲團波卡舞曲（合成）',d:'布拉提斯拉瓦的馬戲大帳篷：空中飛人在兩個鞦韆之間飛躍，大象踩著圓凳、獅子鑽過火圈，還有小丑、大力士與雜耍，觀眾圍成一圈。'},b:{x:40,z:0,ico:'🍷',n:'品酒嘉年華',m:'原創匈牙利恰爾達什風格曲（合成）',d:'布達佩斯的品酒嘉年華：長桌上擺滿葡萄酒與餐點，木桶當桌，大家舉杯聊天，旁邊的烤肉架冒著煙，酒攤有人倒酒，角落有兩位樂手伴奏。'}};
EVT.c={x:-34,z:-22,ico:'🌹',n:'五瓣玫瑰節',m:'原創波希米亞圓舞曲（合成）',d:'CK 小鎮的五瓣玫瑰節：真實活動每年 6 月中旬舉行三天，重現羅森貝格家族的文藝復興時代（2026 年為 6/19–21，2027 年為 6/18–20）。場景中間是真人大棋盤，後方是紅白條紋屋頂的手工藝與美食市集，兩側有小提琴、手風琴、雜耍與魔術，觀眾圍成半圈。'};
const RVP={};CT.forEach(c=>{const ps=RV[c.id].map(q=>{const w=prj(q[0],q[1]);return new THREE.Vector3(w[0],0,w[1])}),ext=(a,b)=>{const d=a.clone().sub(b);d.y=0;d.normalize();const B=d.x*a.x+d.z*a.z,C=a.x*a.x+a.z*a.z-6.75*6.75,t=-B+Math.sqrt(Math.max(0,B*B-C));return a.clone().add(d.multiplyScalar(Math.max(t,0)))};ps.unshift(ext(ps[0],ps[1]));ps.push(ext(ps[ps.length-1],ps[ps.length-2]));RVP[c.id]=new THREE.CatmullRomCurve3(ps).getPoints(90)});
const LAY={};
CT.forEach(c=>{const pp=P.filter(p=>p[0]===c.id).map((_,j)=>prj(XY[c.id][j][0],XY[c.id][j][1])),N=pp.length;
 const ord=pp.map((q,j)=>[Math.hypot(q[0],q[1]),j]).sort((a,b)=>a[0]-b[0]);ord.forEach((o,rk)=>{const q=pp[o[1]],a=o[0]<1e-6?rk*2.4:Math.atan2(q[1],q[0]),R=5.5*Math.sqrt((rk+.5)/N);q[0]=Math.cos(a)*R;q[1]=Math.sin(a)*R});
 for(let it=0;it<260;it++){for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const dx=pp[b][0]-pp[a][0],dz=pp[b][1]-pp[a][1],d=Math.hypot(dx,dz)||.01;if(d<1.65){const f=(1.65-d)/2/d;pp[a][0]-=dx*f;pp[a][1]-=dz*f;pp[b][0]+=dx*f;pp[b][1]+=dz*f}}pp.forEach(q=>{let bd=9,bp=null;RVP[c.id].forEach(p=>{const d=Math.hypot(q[0]-p.x,q[1]-p.z);if(d<bd){bd=d;bp=p}});if(bd<.85){const f=(.85-bd)/(bd||.01);q[0]+=(q[0]-bp.x)*f;q[1]+=(q[1]-bp.z)*f}const L=Math.hypot(q[0],q[1]);if(L>5.5){q[0]*=5.5/L;q[1]*=5.5/L}})}
 const E=[],has=new Set(),ad=(a,b)=>{const k=a<b?a+'-'+b:b+'-'+a;if(!has.has(k)){has.add(k);E.push([a,b])}},dd=(a,b)=>Math.hypot(pp[a][0]-pp[b][0],pp[a][1]-pp[b][1]),inT=[0],rest=new Set(pp.map((_,i)=>i).slice(1));
 while(rest.size){let bd=1e9,ba=0,bb=0;inT.forEach(a=>rest.forEach(b=>{const d=dd(a,b);if(d<bd){bd=d;ba=a;bb=b}}));ad(ba,bb);inT.push(bb);rest.delete(bb)}
 {const cand=[];for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const k=a+'-'+b;if(!has.has(k))cand.push([dd(a,b),a,b])}cand.sort((x,y)=>x[0]-y[0]);let n=0;for(const c of cand){if(n>=3||c[0]>2.4)break;ad(c[1],c[2]);n++}}
 const adj=pp.map(()=>[]);E.forEach(e=>{adj[e[0]].push(e[1]);adj[e[1]].push(e[0])});LAY[c.id]={pp,E,adj}});
const PC={p:{bg:'#3a4066',rd:'#8c93c4',re:'#1e2240',rim:0x262a48},v:{bg:'#5a4036',rd:'#b39a88',re:'#2c1d18',rim:0x3a2a24},k:{bg:'#2a4f5c',rd:'#86b0be',re:'#122a32',rim:0x1c3640},b:{bg:'#4f3048',rd:'#b088a8',re:'#261422',rim:0x331e2e}};
PC.c={bg:'#4a3a3c',rd:'#c49a8a',re:'#2a1c1c',rim:0x38282a};
const SV={p:['Becherovka 草本酒','Moser 水晶玻璃','捷克石榴石首飾','木製玩偶與提線木偶','溫泉薄脆餅 Lázeňské oplatky','捷克啤酒（Pilsner Urquell 等）'],v:['Mozartkugeln 莫札特巧克力球','Manner 榛果威化餅','Sachertorte 薩赫蛋糕','Demel 糖果與果醬','Julius Meinl 咖啡','Augarten 瓷器','Zotter 巧克力'],b:['Szeged 紅椒粉 paprika','Tokaji 托卡伊貴腐酒','Herend 赫倫瓷器','Unicum 草本酒','Pick 薩拉米臘腸','Túró Rudi 乳酪巧克力棒','Kalocsa 刺繡'],k:['Bratislavské rožky 布拉提斯拉瓦月牙麵包','Demänovka 草本酒','Bryndza 羊乳酪','Slivovica 李子白蘭地','Modra 手繪陶器','Horalky 威化餅','斯洛伐克民俗刺繡與木雕']};
const EN={"布拉格城堡": ["Prague Castle", "one of the largest castle complexes in the world, with St. Vitus Cathedral and Golden Lane"], "查理大橋": ["Charles Bridge", "a fourteenth century stone bridge lined with thirty baroque statues"], "舊城廣場與天文鐘": ["Old Town Square and the Astronomical Clock", "where the medieval clock puts on its hourly show of the twelve apostles"], "布拉格猶太博物館": ["the Jewish Museum in Prague", "a group of historic synagogues and the old Jewish cemetery"], "國家博物館": ["the National Museum", "a neo renaissance landmark above Wenceslas Square"], "維謝赫拉德": ["Vyšehrad", "a hilltop fortress with beautiful views of the river"], "瓦茨拉夫廣場": ["Wenceslas Square", "a long boulevard at the heart of modern Prague"], "黃金巷": ["Golden Lane", "tiny colorful houses inside the castle walls where Kafka once stayed"], "聖尼古拉教堂": ["St. Nicholas Church", "a baroque masterpiece with a green dome"], "列儂牆": ["the Lennon Wall", "a graffiti wall that symbolizes peace and freedom"], "跳舞的房子": ["the Dancing House", "a modern building nicknamed Ginger and Fred"], "佩特任瞭望塔": ["Petřín Lookout Tower", "a small cousin of the Eiffel Tower with views of the city"], "斯特拉霍夫圖書館": ["Strahov Library", "a baroque library with painted ceilings and old globes"], "火藥塔": ["the Powder Tower", "a gothic gate tower at the edge of the old town"], "市民會館": ["Municipal House", "an art nouveau gem with the Smetana Hall"], "布拉格國立歌劇院": ["the Prague State Opera", "a neo renaissance opera house from 1888"], "美泉宮": ["Schönbrunn Palace", "the Habsburg summer residence with French gardens and a zoo"], "聖史蒂芬大教堂": ["St. Stephen's Cathedral", "the gothic symbol of Vienna with a colorful tiled roof"], "藝術史博物館 KHM": ["the Kunsthistorisches Museum", "home to Bruegel, Vermeer and Raphael"], "美景宮 Belvedere": ["Belvedere Palace", "a baroque palace that houses Klimt's The Kiss"], "霍夫堡皇宮": ["Hofburg Palace", "the winter palace of the Habsburgs, with the Sisi Museum"], "國家歌劇院": ["the Vienna State Opera", "one of the world's great opera houses"], "普拉特與大摩天輪": ["the Prater and its giant Ferris wheel", "a historic amusement park with the 1897 Riesenrad"], "卡爾教堂": ["Karlskirche", "a baroque church with a huge green dome"], "百水公寓": ["the Hundertwasser House", "a colorful apartment block with no straight lines"], "市立公園": ["the Stadtpark", "a green park with the golden Johann Strauss statue"], "市政廳廣場": ["Rathausplatz", "the square in front of the neo gothic city hall"], "卡倫山": ["Kahlenberg", "a hill with panoramic views over Vienna and the Danube"], "嘉布遣會地下墓室": ["the Capuchin Crypt", "the burial place of the Habsburg family"], "納旭市場": ["the Naschmarkt", "Vienna's biggest open air market"], "國會大廈": ["the Hungarian Parliament Building", "a neo gothic landmark on the Danube"], "漁夫堡": ["Fisherman's Bastion", "a fairytale terrace with sweeping river views"], "塞切尼溫泉": ["Széchenyi Thermal Bath", "one of the largest thermal baths in Europe"], "恐怖之屋": ["the House of Terror", "a museum about the fascist and communist regimes"], "匈牙利國家博物館": ["the Hungarian National Museum", "the best place to start with Hungarian history"], "大市集廳": ["the Great Market Hall", "a nineteenth century market hall full of food stalls"], "英雄廣場": ["Heroes' Square", "a monument square for a thousand years of Hungarian history"], "聖伊什特萬大教堂": ["St. Stephen's Basilica", "the largest church in Budapest, with a dome you can climb"], "鏈橋": ["the Chain Bridge", "the first permanent bridge over the Danube"], "布達城堡": ["Buda Castle", "the royal palace on Castle Hill"], "馬加什教堂": ["Matthias Church", "a church with a colorful tiled roof"], "蓋勒特山": ["Gellért Hill", "a hill with the Citadella and great views"], "多瑙河畔的鞋": ["the Shoes on the Danube Bank", "a memorial of iron shoes"], "多哈尼街猶太會堂": ["the Dohány Street Synagogue", "the largest synagogue in Europe"], "瑪格麗特島": ["Margaret Island", "a park island in the middle of the Danube"], "維達杭亞迪城堡": ["Vajdahunyad Castle", "a fairytale castle in City Park"], "匈牙利國家歌劇院": ["the Hungarian State Opera House", "a neo renaissance masterpiece from 1884"], "布拉提斯拉瓦城堡": ["Bratislava Castle", "a white castle with four towers above the Danube"], "聖馬丁大教堂": ["St. Martin's Cathedral", "where Hungarian kings were once crowned"], "米歇爾門": ["Michael's Gate", "the only surviving medieval gate of the old town"], "主廣場與舊市政廳": ["the Main Square and Old Town Hall", "the lively heart of the old town"], "藍教堂": ["the Blue Church", "an art nouveau church in light blue"], "UFO 瞭望塔": ["the UFO Tower", "a flying saucer shaped viewing deck on the New Bridge"], "總統府": ["Grassalkovich Palace", "the presidential palace with a rococo garden"], "Slavín 紀念碑": ["the Slavín Memorial", "a hilltop war memorial with city views"], "斯洛伐克國家劇院": ["the Slovak National Theatre", "an opera and ballet house in neo renaissance style"], "Čumil 雕像": ["the Čumil statue", "a worker peeking out of a manhole"], "Rákóczi 市場（Rákóczi tér 市集）": ["Rákóczi Market Hall", "a local market with wine poured from barrels"], "Stará tržnica（舊市場廳）": ["the Stará tržnica Old Market Hall", "a historic market hall"], "Csendes Vintage Bar & Café（廢墟咖啡）": ["Csendes Vintage Bar and Cafe", "a ruin bar style cafe"], "Instant-Fogas 綜合體": ["the Instant Fogas complex", "a huge ruin bar party complex"], "Havelské tržiště（哈維爾市場）": ["Havelské tržiště", "the old town market since 1232"], "Pražská tržnice（Holešovice 市場）": ["the Prague Market in Holešovice", "the largest year round market hall in Prague"]};
SV.c=['Trdelník 煙囪捲','Eggenberg 當地啤酒','木製玩偶與提線木偶','蕾絲與手工刺繡','捷克石榴石首飾（Czech garnet）','城堡與小鎮明信片'];
Object.assign(EN,{"克魯姆洛夫城堡":["Cesky Krumlov Castle","a castle complex above the Vltava River, with a colorful round tower and five courtyards"],"巴洛克城堡劇院":["the Baroque Castle Theatre","one of the best preserved Baroque theatres in Europe, with its original stage machinery"],"城堡花園":["the Castle Garden","a Baroque garden on the hill behind the fifth castle courtyard, free to enter"],"披風橋 Plášťový most":["the Cloak Bridge","a tall stone bridge that links the castle courtyards"],"斯沃諾斯蒂廣場":["Svornosti Square","the main square of the old town, with the Town Hall and many cafes"],"聖維特教堂":["St. Vitus Church","a Gothic church with three naves, built in the early fifteenth century"],"理髮師橋 Lazebnický most":["Barber's Bridge","a bridge over the Vltava with a good view of the river bend and the castle"],"城堡博物館與城堡塔樓":["the Castle Museum and Tower","a self-guided museum about the noble families who ruled Krumlov, with a tower for views over the town"],"Egon Schiele Art Centrum":["the Egon Schiele Art Centrum","a gallery about the Austrian painter Egon Schiele, who lived and worked in Krumlov"],"Museum Fotoateliér Seidel":["the Seidel Photo Studio Museum","a preserved Art Nouveau photo studio from 1905"],"克魯姆洛夫區域博物館":["the Regional Museum","best known for its ceramic model of the historic center"],"木筏博物館與聖約斯特教堂":["the Wooden Rafting Museum","a small museum about the rafting tradition on the Vltava"],"克魯姆洛夫巴士與火車站":["the bus and train stations","where direct buses from Prague arrive"],"CK 小鎮市區交通與停車":["getting around town","the old town is small and best explored on foot"]});
