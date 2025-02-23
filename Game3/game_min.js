let p1_hand=[],p2_hand=[],p1_selected_cards=[],p2_selected_cards=[],p1_selected_place=[0,0,0,0,0,0,0,0],p2_selected_place=[0,0,0,0,0,0,0,0],p1_point=0,p2_point=0,turn="p1",hand_num=8;const elementToNumber={H:1,He:2,Li:3,Be:4,B:5,C:6,N:7,O:8,F:9,Ne:10,Na:11,Mg:12,Al:13,Si:14,P:10,S:16,Cl:17,Ar:18,K:19,Ca:20,Fe:26,Cu:29,Zn:30,I:53},elements=[...Array(30).fill("H"),...Array(25).fill("O"),...Array(20).fill("C"),"He","Li","Be","B","N","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Fe","Cu","Zn","I"],element=["H","O","C","He","Li","Be","B","N","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Fe","Cu","Zn","I"];let imageCache={},materials;async function loadMaterials(){let e=await fetch("../compound/standard.json"),t=await e.json();if(!t.material||!Array.isArray(t.material))return console.error('Loaded data does not contain a valid "material" array:',t),[];materials=t.material}async function preloadImages(){[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,26,29,30,53].forEach(e=>{let t=new Image;t.src=`../image/${e}.webp`,imageCache[e]=t}),console.log(imageCache)}function p1_turn(){p1_view_hand();let e=document.getElementById("p1_generate"),t=document.getElementById("p1_exchange");e.ariaDisabled="disabled",t.ariaDisabled="disabled";let n=document.getElementById("p1_generate"),a=document.getElementById("p1_exchange");n.ariaDisabled=null,a.ariaDisabled=null,"p2"==turn&&p2_turn()}function p2_turn(){p2_view_hand();let e=document.getElementById("p1_generate"),t=document.getElementById("p1_exchange");e.ariaDisabled="disabled",t.ariaDisabled="disabled";let n=document.getElementById("p2_generate"),a=document.getElementById("p2_exchange");n.ariaDisabled=null,a.ariaDisabled=null,"p1"==turn&&p1_turn()}async function p1_generate(){if(0!=p1_selected_cards.length){let e;await search_material(array_to_dict(p1_selected_cards)).then(t=>e=t[0]),void 0!==e?(document.getElementById("p1_text").innerHTML=`<p>生成した物質：　　${e.name} (${e.formula}) - ${e.point} ポイント</p>`,p1_point+=e.point,document.getElementById("p1_point").innerHTML=`<p>プレイヤー１のポイント：${p1_point}</p>`):document.getElementById("p1_text").innerHTML="該当の物質がありません",p1_exchange(),p1_selected_cards=[],p1_selected_place=[0,0,0,0,0,0,0,0],turn="p2"}else document.getElementById("p1_text").innerHTML="カードが選択されていません"}async function p2_generate(){if(0!=p2_selected_cards.length){let e;await search_material(array_to_dict(p2_selected_cards)).then(t=>e=t[0]),void 0!==e?(document.getElementById("p2_text").innerHTML=`<p>生成した物質：　　${e.name} (${e.formula}) - ${e.point} ポイント</p>`,p2_point+=e.point,document.getElementById("p2_point").innerHTML=`<p>プレイヤー２のポイント：${p2_point}</p>`):document.getElementById("p2_text").innerHTML="該当の物質がありません",p2_exchange(),p2_selected_cards=[],p2_selected_place=[0,0,0,0,0,0,0,0],turn="p1"}else document.getElementById("p2_text").innerHTML="カードが選択されていません"}function p1_exchange(){p1_selected_cards.length>=1?(p1_selected_place.forEach((e,t)=>{1==e&&(p1_hand[t]=get_random_card())}),p1_selected_cards=[],p1_selected_place=[0,0,0,0,0,0,0,0],p1_view_hand(),turn="p2"):document.getElementById("p1_text").innerHTML="カードが選択されていません"}function p2_exchange(){p2_selected_cards.length>=1?(p2_selected_place.forEach((e,t)=>{1==e&&(p2_hand[t]=get_random_card())}),p2_selected_cards=[],p2_selected_place=[0,0,0,0,0,0,0,0],p2_view_hand(),turn="p1"):document.getElementById("p1_text").innerHTML="カードが選択されていません"}function p1_view_hand(){let e=document.getElementById("p1_hand");e.innerHTML="",p1_hand.forEach((t,n)=>{let a=document.createElement("img");a.src=imageCache[elementToNumber[t]].src,a.alt=t,a.style.padding="5px",a.style.border="1px solid #000",a.className="p1",a.place=n,a.addEventListener("click",function(){if("p1"==turn){if(this.classList.contains("selected")){this.classList.remove("selected");let e=p1_selected_cards.indexOf(this.alt);-1!==e&&(p1_selected_cards.splice(e,1),p1_selected_place[n]=0),this.style.padding="5px",this.style.border="1px solid black"}else this.classList.add("selected"),p1_selected_cards.push(this.alt),p1_selected_place[n]=1,this.style.padding="1px",this.style.border="5px solid red";console.log(p1_selected_cards)}}),e.appendChild(a)})}function p2_view_hand(){let e=document.getElementById("p2_hand");e.innerHTML="",p2_hand.forEach((t,n)=>{let a=document.createElement("img");a.src=imageCache[elementToNumber[t]].src,a.alt=t,a.style.padding="5px",a.style.border="1px solid black",a.className="p2",a.place=n,a.classList.add("selected"),a.classList.toggle("selected"),a.addEventListener("click",function(){if("p2"==turn){if(this.classList.contains("selected")){this.classList.remove("selected");let e=p2_selected_cards.indexOf(this.alt);-1!==e&&(p2_selected_cards.splice(e,1),p2_selected_place[n]=0),this.style.padding="5px",this.style.border="1px solid black"}else this.classList.add("selected"),p2_selected_cards.push(this.alt),p2_selected_place[n]=1,this.style.padding="1px",this.style.border="5px solid red";console.log(p2_selected_cards)}}),e.appendChild(a)})}async function search_material(e){return materials.filter(t=>{for(let n in e)if(!t.components[n]||t.components[n]!==e[n])return!1;for(let a in t.components)if(!e[a])return!1;return!0})}function initial_hand(){for(i=0;i<=hand_num-1;i++)p1_hand.push(elements[Math.floor(Math.random()*elements.length)]),p2_hand.push(elements[Math.floor(Math.random()*elements.length)])}function get_random_card(){return elements[Math.floor(Math.random()*elements.length)]}function array_to_dict(e){let t={};return e.forEach(e=>{t[e]?t[e]+=1:t[e]=1}),t}function reset_size(e){let t=document.getElementById(e).getElementsByTagName("img");for(i=0;i<t.length;i++)t[i].style.transform="scale(1.00)"}function win_check(){return(p1_point>=250||p2_point>=250)&&(p1_point>=250?"p1":"p2")}document.addEventListener("DOMContentLoaded",function(){loadMaterials(),preloadImages()});
